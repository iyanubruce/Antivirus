import { promises as fs } from "fs";
import path from "path";
import { appendQuarantineLog, quarantineDir } from "../utils/config.js";
import { QuarantineStrategy } from "../types/strategies.js";
import { QuarantineRecord } from "../types/interfaces.js";

export class WindowsQuarantineStrategy implements QuarantineStrategy {
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

export class LinuxQuarantineStrategy implements QuarantineStrategy {
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
    await fs.chmod(destPath, "0400");
    const record: QuarantineRecord = {
      originalPath: filePath,
      quarantinedPath: destPath,
      timestamp,
    };
    await appendQuarantineLog(record);
  }
}

export class MacOSQuarantineStrategy implements QuarantineStrategy {
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
    await fs.chmod(destPath, "0400");
    const record: QuarantineRecord = {
      originalPath: filePath,
      quarantinedPath: destPath,
      timestamp,
    };
    await appendQuarantineLog(record);
  }
}
