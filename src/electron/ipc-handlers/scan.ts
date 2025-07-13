import { ipcMain } from "electron";
import { promises as fs } from "fs";
import path from "path";
import { loadSignatures } from "../utils/signatures.js";
import { ScanContext, appendScanResult, isDevMode } from "../utils/config.js";
import { ErrorResponse, ScanProgress, Threat } from "../types/interfaces.js";
import { faLadderWater } from "@fortawesome/free-solid-svg-icons";

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
      const lastScanDate = Date.now().toString();
      appendScanResult({
        time: lastScanDate,
        threats,
        filesScanned: scannedFiles,
        action: "threatScan",
      });
      return { totalFiles, threats, durationMs };
    } catch (error: any) {
      return { error: (error as Error).message };
    }
  }
);
