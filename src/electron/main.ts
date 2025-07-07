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
  QuarantineRecord,
  QuarantineStrategy,
  UnquarantineStrategy,
} from "./utils.js";
import {
  ErrorResponse,
  ScanProgress,
  Signature,
  Threat,
  Vulnerability,
} from "./interfaces.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const quarantineDir = isDevMode()
  ? path.join(__dirname, "../../quarantine")
  : path.join(app.getPath("userData"), "quarantine");
// Helper function to append to quarantine log
export async function appendQuarantineLog(
  record: QuarantineRecord,
  action: "quarantine" | "unquarantine" = "quarantine"
) {
  const logPath = path.join(quarantineDir, "quarantine.json"); // Changed from path.dirname(quarantineDir)
  let logs: QuarantineRecord[] = [];
  try {
    const data = await fs.readFile(logPath, "utf-8");
    logs = JSON.parse(data);
  } catch {
    logs = [];
  }
  logs.push({ ...record, action });
  await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
}
let signaturesCache: Signature[] | null = null;

class WindowsQuarantineStrategy implements QuarantineStrategy {
  private quarantineDir: string;

  constructor(quarantineDir: string) {
    this.quarantineDir = quarantineDir;
  }

  async quarantine(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const destPath = path.join(this.quarantineDir, `${timestamp}_${fileName}`);
    await fs.mkdir(this.quarantineDir, { recursive: true });
    await fs.rename(filePath, destPath);
    const record: QuarantineRecord = {
      originalPath: filePath,
      quarantinedPath: destPath,
      timestamp,
    };
    await appendQuarantineLog(record);
  }
}

// Concrete strategy for Linux quarantine
class LinuxQuarantineStrategy implements QuarantineStrategy {
  private quarantineDir: string;

  constructor(quarantineDir: string) {
    this.quarantineDir = quarantineDir;
  }

  async quarantine(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const destPath = path.join(this.quarantineDir, `${timestamp}_${fileName}`);
    await fs.mkdir(this.quarantineDir, { recursive: true });
    await fs.rename(filePath, destPath);
    await fs.chmod(destPath, "0400"); // Read-only for owner
    const record: QuarantineRecord = {
      originalPath: filePath,
      quarantinedPath: destPath,
      timestamp,
    };
    await appendQuarantineLog(record);
  }
}

// Concrete strategy for macOS quarantine
class MacOSQuarantineStrategy implements QuarantineStrategy {
  private quarantineDir: string;

  constructor(quarantineDir: string) {
    this.quarantineDir = quarantineDir;
  }

  async quarantine(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const destPath = path.join(this.quarantineDir, `${timestamp}_${fileName}`);
    await fs.mkdir(this.quarantineDir, { recursive: true });
    await fs.rename(filePath, destPath);
    await fs.chmod(destPath, "0400"); // Read-only for owner
    const record: QuarantineRecord = {
      originalPath: filePath,
      quarantinedPath: destPath,
      timestamp,
    };
    await appendQuarantineLog(record);
  }
}

// Concrete strategy for Windows unquarantine
class WindowsUnquarantineStrategy implements UnquarantineStrategy {
  async unquarantine(
    quarantinedPath: string,
    originalPath: string
  ): Promise<void> {
    await fs.rename(quarantinedPath, originalPath);
    const record: QuarantineRecord = {
      originalPath,
      quarantinedPath,
      timestamp: new Date().toISOString(),
    };
    await appendQuarantineLog(record, "unquarantine");
  }
}

// Concrete strategy for Linux unquarantine
class LinuxUnquarantineStrategy implements UnquarantineStrategy {
  async unquarantine(
    quarantinedPath: string,
    originalPath: string
  ): Promise<void> {
    await fs.chmod(quarantinedPath, "0644"); // Restore default permissions
    await fs.rename(quarantinedPath, originalPath);
    const record: QuarantineRecord = {
      originalPath,
      quarantinedPath,
      timestamp: new Date().toISOString(),
    };
    await appendQuarantineLog(record, "unquarantine");
  }
}

// Concrete strategy for macOS unquarantine
class MacOSUnquarantineStrategy implements UnquarantineStrategy {
  async unquarantine(
    quarantinedPath: string,
    originalPath: string
  ): Promise<void> {
    await fs.chmod(quarantinedPath, "0644"); // Restore default permissions
    await fs.rename(quarantinedPath, originalPath);
    const record: QuarantineRecord = {
      originalPath,
      quarantinedPath,
      timestamp: new Date().toISOString(),
    };
    await appendQuarantineLog(record, "unquarantine");
  }
}

export class QuarantineContext {
  private strategy: QuarantineStrategy;

  constructor(platform: NodeJS.Platform, quarantineDir: string) {
    switch (platform) {
      case "win32":
        this.strategy = new WindowsQuarantineStrategy(quarantineDir);
        break;
      case "linux":
        this.strategy = new LinuxQuarantineStrategy(quarantineDir);
        break;
      case "darwin":
        this.strategy = new MacOSQuarantineStrategy(quarantineDir);
        break;
      default:
        this.strategy = new WindowsQuarantineStrategy(quarantineDir); // Fallback
    }
  }

  async quarantine(filePath: string): Promise<void> {
    return this.strategy.quarantine(filePath);
  }
}

// Context for selecting the appropriate unquarantine strategy
export class UnquarantineContext {
  private strategy: UnquarantineStrategy;

  constructor(platform: NodeJS.Platform) {
    switch (platform) {
      case "win32":
        this.strategy = new WindowsUnquarantineStrategy();
        break;
      case "linux":
        this.strategy = new LinuxUnquarantineStrategy();
        break;
      case "darwin":
        this.strategy = new MacOSUnquarantineStrategy();
        break;
      default:
        this.strategy = new WindowsUnquarantineStrategy(); // Fallback
    }
  }

  async unquarantine(
    quarantinedPath: string,
    originalPath: string
  ): Promise<void> {
    return this.strategy.unquarantine(quarantinedPath, originalPath);
  }
}

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
  return result.filePaths[0] || null;
});

// Virus Scanning Logic
ipcMain.handle(
  "scan-directory",
  async (
    event: Electron.IpcMainInvokeEvent,
    dir: string
  ): Promise<
    | { totalFiles: number; threats: Threat[]; durationMs: number }
    | ErrorResponse
  > => {
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

      const start = Date.now();
      await scanDir(dir);
      const durationMs = Date.now() - start;

      return { totalFiles, threats, durationMs };
    } catch (error: any) {
      return { error: (error as Error).message };
    }
  }
);

// Quarantine a File
ipcMain.handle(
  "quarantine-file",
  async (
    _event: Electron.IpcMainInvokeEvent,
    filePath: string
  ): Promise<void | ErrorResponse> => {
    try {
      if (!filePath || typeof filePath !== "string") {
        return { error: "Invalid or missing file path" };
      }

      // Prevent directory traversal
      if (filePath.includes("..") || !path.isAbsolute(filePath)) {
        return { error: "Invalid file path" };
      }

      try {
        await fs.access(filePath);
      } catch {
        return { error: `File does not exist: ${filePath}` };
      }

      const quarantineContext = new QuarantineContext(
        process.platform,
        quarantineDir
      );
      await quarantineContext.quarantine(filePath);
    } catch (error: any) {
      return { error: `Failed to quarantine file: ${error.message}` };
    }
  }
);

// Unquarantine a File
ipcMain.handle(
  "unquarantine-file",
  async (_event, quarantinedPath: string): Promise<void | ErrorResponse> => {
    try {
      if (!quarantinedPath || typeof quarantinedPath !== "string") {
        return { error: "Invalid or missing quarantined file path" };
      }

      // Prevent directory traversal
      if (quarantinedPath.includes("..") || !path.isAbsolute(quarantinedPath)) {
        return { error: "Invalid quarantined file path" };
      }

      try {
        await fs.access(quarantinedPath);
      } catch {
        return { error: `Quarantined file does not exist: ${quarantinedPath}` };
      }

      const logPath = path.join(quarantineDir, "quarantine.json");
      let logs: QuarantineRecord[] = [];
      try {
        const data = await fs.readFile(logPath, "utf-8");
        logs = JSON.parse(data);
      } catch {
        return { error: "Quarantine log not found" };
      }

      const record = logs.find(
        (log) =>
          log.quarantinedPath === quarantinedPath && log.action === "quarantine"
      );
      if (!record) {
        return { error: `No quarantine record found for ${quarantinedPath}` };
      }

      const originalPath = record.originalPath;
      try {
        await fs.access(path.dirname(originalPath));
      } catch {
        await fs.mkdir(path.dirname(originalPath), { recursive: true }); // Create directory
      }

      // Check for file conflict
      try {
        await fs.access(originalPath);
        return {
          error: `File already exists at original path: ${originalPath}`,
        };
      } catch {
        // File doesn't exist; proceed with unquarantine
      }

      const unquarantineContext = new UnquarantineContext(process.platform);
      await unquarantineContext.unquarantine(quarantinedPath, originalPath);
    } catch (error: any) {
      return { error: `Failed to unquarantine file: ${error.message}` };
    }
  }
);

ipcMain.handle(
  "get-quarantine-records",
  async (): Promise<QuarantineRecord[] | ErrorResponse> => {
    try {
      const logPath = path.join(quarantineDir, "quarantine.json");
      let logs: QuarantineRecord[] = [];
      try {
        const data = await fs.readFile(logPath, "utf-8");
        logs = JSON.parse(data);
      } catch {
        return []; // Return empty array if log doesn't exist
      }

      // Filter for active quarantine records and verify files exist
      const activeRecords = logs.filter(async (record) => {
        if (record.action !== "quarantine") return false;
        try {
          await fs.access(record.quarantinedPath);
          return !logs.some(
            (log) =>
              log.action === "unquarantine" &&
              log.quarantinedPath === record.quarantinedPath &&
              new Date(log.timestamp) > new Date(record.timestamp)
          );
        } catch {
          return false; // File no longer exists
        }
      });

      // Await all promises from the filter
      const resolvedRecords = await Promise.all(activeRecords);
      return resolvedRecords.filter(Boolean);
    } catch (error: any) {
      return { error: `Failed to load quarantine records: ${error.message}` };
    }
  }
);

ipcMain.handle(
  "check-vulnerabilities",
  async (): Promise<Vulnerability[] | ErrorResponse> => {
    try {
      const systemInfo = await getSystemInfo();

      const queries = buildCPEQueries(systemInfo);

      const apiKey = process.env.NVD_API_KEY || undefined;

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
