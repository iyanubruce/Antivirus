import { ipcMain } from "electron";
import { promises as fs } from "fs";
import path from "path";
import {
  quarantineDir,
  QuarantineContext,
  UnquarantineContext,
} from "../utils/config.js";
import { ErrorResponse, QuarantineRecord } from "../types/interfaces.js";

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
        await fs.mkdir(path.dirname(originalPath), { recursive: true });
      }

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
        return [];
      }

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
          return false;
        }
      });

      const resolvedRecords = await Promise.all(activeRecords);
      return resolvedRecords.filter(Boolean);
    } catch (error: any) {
      return { error: `Failed to load quarantine records: ${error.message}` };
    }
  }
);
