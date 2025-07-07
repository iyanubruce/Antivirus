import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { initialize, enable } from "@electron/remote/main/index.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  isDevMode,
  getSystemInfo,
  buildCPEQueries,
  fetchVulnerabilities,
  waitForServer,
  ScanContext,
} from "./utils.js";
import {
  ErrorResponse,
  ScanProgress,
  Signature,
  Threat,
  Vulnerability,
} from "./interfaces.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let signaturesCache: Signature[] | null = null;

async function loadSignatures(): Promise<Signature[]> {
  if (signaturesCache) {
    return signaturesCache;
  }
  const signaturesPath = path.join(__dirname, "../signatures/signatures.json");
  try {
    const data = await fs.readFile(signaturesPath, "utf-8");
    const json = JSON.parse(data) as { signatures: Signature[] };
    signaturesCache = json.signatures;
    return signaturesCache;
  } catch (error: any) {
    throw new Error(`Failed to load signatures: ${error.message}`);
  }
}
initialize();
async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  enable(win.webContents);

  if (isDevMode()) {
    await waitForServer("http://localhost:5123");
    win.loadURL("http://localhost:5123");
  } else {
    win.loadFile(path.join(__dirname, "../../dist-react/index.html"));
  }

  return win;
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Directory Selection
ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  console.error("Selected directory:", result.filePaths[0]);
  return result.filePaths[0] || null;
});

// Virus Scanning Logic
ipcMain.handle(
  "scan-directory",
  async (
    event: Electron.IpcMainInvokeEvent,
    dir: string
  ): Promise<Threat[] | ErrorResponse> => {
    try {
      if (!dir || typeof dir !== "string") {
        return { error: "Invalid or missing directory path" };
      }

      try {
        await fs.access(dir);
      } catch {
        return { error: `Directory does not exist: ${dir}` };
      }

      const signatures = await loadSignatures();
      const scanContext = new ScanContext(process.platform, signatures);
      const threats: Threat[] = [];

      // Count total files for progress
      let totalFiles = 0;
      const countFiles = async (currentDir: string) => {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            await countFiles(fullPath);
          } else if (isDevMode() && !fullPath.endsWith(".txt")) {
            continue; // Limit to .txt in development
          } else {
            totalFiles++;
          }
        }
      };
      await countFiles(dir);

      // Scan files
      let scannedFiles = 0;
      const scanDir = async (currentDir: string) => {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            await scanDir(fullPath);
          } else if (isDevMode() && !fullPath.endsWith(".txt")) {
            continue; // Skip non-.txt files in development
          } else {
            try {
              const content = await fs.readFile(fullPath);
              const threat = scanContext.scan(fullPath, content);
              if (threat) {
                threats.push(threat);
              }
              scannedFiles++;
              const percentage =
                totalFiles > 0
                  ? Math.min(100, Math.round((scannedFiles / totalFiles) * 100))
                  : 0;
              event.sender.send("scan-progress", {
                percentage,
                scannedFiles,
                totalFiles,
              } as ScanProgress);
            } catch (error: any) {
              console.warn(`Failed to scan ${fullPath}: ${error.message}`);
            }
          }
        }
      };

      await scanDir(dir);
      return threats;
    } catch (error: any) {
      return { error: (error as Error).message };
    }
  }
);
ipcMain.handle(
  "check-vulnerabilities",
  async (): Promise<Vulnerability[] | ErrorResponse> => {
    try {
      // Get system information
      const systemInfo = await getSystemInfo();

      const queries = buildCPEQueries(systemInfo);

      const apiKey = process.env.NVD_API_KEY || undefined;

      // Fetch vulnerabilities for each query
      const allVulnerabilities: Vulnerability[] = [];

      for (const query of queries) {
        const vulnerabilities = await fetchVulnerabilities(query, apiKey);

        // Add component information to vulnerabilities
        vulnerabilities.forEach((vuln) => {
          if (query.includes("node.js")) {
            vuln.affectedComponent = `Node.js ${systemInfo.nodeVersion}`;
          } else if (query.includes("npm")) {
            vuln.affectedComponent = `npm ${systemInfo.npmVersion}`;
          } else {
            vuln.affectedComponent = `${systemInfo.platform} ${systemInfo.release}`;
          }
        });

        allVulnerabilities.push(...vulnerabilities);

        // Rate limiting: wait 1 second between requests to avoid hitting API limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Remove duplicates based on CVE ID
      const uniqueVulnerabilities = allVulnerabilities.filter(
        (vuln, index, self) => index === self.findIndex((v) => v.id === vuln.id)
      );

      // Sort by CVSS score (highest first)
      uniqueVulnerabilities.sort(
        (a, b) => (b.cvssScore || 0) - (a.cvssScore || 0)
      );

      return uniqueVulnerabilities;
    } catch (error: any) {
      return { error: (error as Error).message };
    }
  }
);
