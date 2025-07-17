import { ipcMain } from "electron";
import { promises as fs } from "fs";
import path from "path";
import { loadSignatures } from "../utils/signatures.js";
import {
  ScanContext,
  appendScanResult,
  isDevMode,
  scanResultsDir,
} from "../utils/config.js";
import {
  ErrorResponse,
  ScanProgress,
  ScanResult,
  Threat,
} from "../types/interfaces.js";

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
      const lastScanDate = new Date().toISOString();
      console.log(lastScanDate);
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

ipcMain.handle(
  "get-last-scan-details",
  async (): Promise<
    | { totalFiles: number; threats: Threat[]; lastScanTime: string }
    | ErrorResponse
  > => {
    const logPath = path.join(scanResultsDir, "scan-results.json");
    try {
      const data = await fs.readFile(logPath, "utf-8");
      const logs: ScanResult[] = await JSON.parse(data);

      const lastThreatScan = [...logs]
        .reverse()
        .find((log) => log.action === "threatScan");

      if (
        !lastThreatScan ||
        !lastThreatScan.action ||
        !lastThreatScan.time ||
        !lastThreatScan.filesScanned
      ) {
        return {
          totalFiles: 0,
          threats: [],
          lastScanTime: "No scans yet",
        };
      }

      return {
        totalFiles: lastThreatScan.filesScanned || 0,
        threats: lastThreatScan.threats || [],
        lastScanTime: lastThreatScan.time,
      };
    } catch (error: any) {
      console.error(
        `Failed to read scan details: ${error.message}`,
        error.stack
      );
      return { error: error.message };
    }
  }
);
