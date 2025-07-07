import { promises as fs } from "fs";
import { appendQuarantineLog } from "../utils/config.js";
import { UnquarantineStrategy } from "../types/strategies.js";
import { QuarantineRecord } from "../types/interfaces.js";

export class WindowsUnquarantineStrategy implements UnquarantineStrategy {
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

export class LinuxUnquarantineStrategy implements UnquarantineStrategy {
  async unquarantine(
    quarantinedPath: string,
    originalPath: string
  ): Promise<void> {
    await fs.chmod(quarantinedPath, "0644");
    await fs.rename(quarantinedPath, originalPath);
    const record: QuarantineRecord = {
      originalPath,
      quarantinedPath,
      timestamp: new Date().toISOString(),
    };
    await appendQuarantineLog(record, "unquarantine");
  }
}

export class MacOSUnquarantineStrategy implements UnquarantineStrategy {
  async unquarantine(
    quarantinedPath: string,
    originalPath: string
  ): Promise<void> {
    await fs.chmod(quarantinedPath, "0644");
    await fs.rename(quarantinedPath, originalPath);
    const record: QuarantineRecord = {
      originalPath,
      quarantinedPath,
      timestamp: new Date().toISOString(),
    };
    await appendQuarantineLog(record, "unquarantine");
  }
}
