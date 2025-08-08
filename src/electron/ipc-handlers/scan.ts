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

const ensureScanResultsDir = async () => {
  try {
    await fs.access(scanResultsDir);
  } catch {
    await fs.mkdir(scanResultsDir, { recursive: true });
  }
};

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
      console.log("SCAN-DIRECTORY: Starting scan process");
      console.log("SCAN-DIRECTORY: Directory to scan:", dir);
      console.log("SCAN-DIRECTORY: Dev mode:", isDevMode());
      console.log(
        "SCAN-DIRECTORY: Scan results will be saved to:",
        scanResultsDir
      );

      if (!dir || typeof dir !== "string") {
        console.error("SCAN-DIRECTORY: Invalid or missing directory path");
        return { error: "Invalid or missing directory path" };
      }

      try {
        await fs.access(dir);
      } catch (err) {
        console.error(`SCAN-DIRECTORY: Directory does not exist: ${dir}`, err);
        return { error: `Directory does not exist: ${dir}` };
      }

      // Ensure scan results directory exists before scanning
      await ensureScanResultsDir();

      const signatures = await loadSignatures();
      const scanContext = new ScanContext(process.platform, signatures);
      const threats: Threat[] = [];

      // Count total files for progress
      let totalFiles = 0;
      const countFiles = async (currentDir: string) => {
        try {
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
        } catch (err) {
          console.warn(
            `SCAN-DIRECTORY: Failed to count files in ${currentDir}:`,
            err
          );
        }
      };
      await countFiles(dir);

      console.log(`SCAN-DIRECTORY: Total files to scan: ${totalFiles}`);

      // Scan files
      let scannedFiles = 0;
      const scanDir = async (currentDir: string) => {
        try {
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

                // CRITICAL FIX: Wrap send in try/catch to prevent scan crashes
                try {
                  const percentage =
                    totalFiles > 0
                      ? Math.min(
                          100,
                          Math.round((scannedFiles / totalFiles) * 100)
                        )
                      : 0;
                  event.sender.send("scan-progress", {
                    percentage,
                    scannedFiles,
                    totalFiles,
                  } as ScanProgress);
                  console.log(
                    `SCAN-DIRECTORY: Progress ${percentage}% (${scannedFiles}/${totalFiles})`
                  );
                } catch (sendError) {
                  console.warn(
                    "SCAN-DIRECTORY: Failed to send progress (renderer not ready):",
                    sendError &&
                      typeof sendError === "object" &&
                      "message" in sendError
                      ? (sendError as any).message
                      : String(sendError)
                  );
                  // Continue scanning - DO NOT return or throw here!
                }
              } catch (error: any) {
                console.warn(
                  `SCAN-DIRECTORY: Failed to scan ${fullPath}: ${error.message}`
                );
              }
            }
          }
        } catch (err) {
          console.warn(
            `SCAN-DIRECTORY: Failed to read directory ${currentDir}:`,
            err
          );
        }
      };

      const start = Date.now();
      await scanDir(dir);
      const durationMs = Date.now() - start;
      const lastScanDate = new Date().toISOString();
      console.log(
        `SCAN-DIRECTORY: Scan completed in ${durationMs}ms with ${threats.length} threats`
      );

      appendScanResult({
        time: lastScanDate,
        threats,
        filesScanned: scannedFiles,
        action: "threatScan",
      });

      return { totalFiles, threats, durationMs };
    } catch (error: any) {
      console.error("SCAN-DIRECTORY: Unexpected error:", error);
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
    try {
      // Ensure directory exists and await the operation
      await ensureScanResultsDir();

      const logPath = path.join(scanResultsDir, "scan-results.json");

      // Check if the file exists before trying to read it
      try {
        await fs.access(logPath);
      } catch {
        // File doesn't exist, return default values
        return {
          totalFiles: 0,
          threats: [],
          lastScanTime: "No scans yet",
        };
      }

      const data = await fs.readFile(logPath, "utf-8");
      const logs: ScanResult[] = JSON.parse(data);

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
