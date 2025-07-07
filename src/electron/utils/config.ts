import { app } from "electron";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { QuarantineRecord, Signature, Threat } from "../types/interfaces.js";
import {
  QuarantineStrategy,
  ScanStrategy,
  UnquarantineStrategy,
} from "../types/strategies.js";
import {
  WindowsScanStrategy,
  LinuxScanStrategy,
  MacOSScanStrategy,
} from "../strategies/scan.js";
import {
  LinuxQuarantineStrategy,
  MacOSQuarantineStrategy,
  WindowsQuarantineStrategy,
} from "../strategies/quarantine.js";
import {
  LinuxUnquarantineStrategy,
  MacOSUnquarantineStrategy,
  WindowsUnquarantineStrategy,
} from "../strategies/unquarantine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

export const quarantineDir = isDevMode()
  ? path.join(__dirname, "../../quarantine")
  : path.join(app.getPath("userData"), "quarantine");

export async function appendQuarantineLog(
  record: QuarantineRecord,
  action: "quarantine" | "unquarantine" = "quarantine"
) {
  const logPath = path.join(quarantineDir, "quarantine.json");
  let logs: QuarantineRecord[] = [];
  try {
    const data = await fs.readFile(logPath, "utf-8");
    logs = JSON.parse(data);
  } catch {
    logs = [];
  }
  logs.push({ ...record, action });
  try {
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
  } catch (error: any) {
    console.error(`Failed to write quarantine log: ${error.message}`);
    throw error;
  }
}

export class ScanContext {
  private strategy: ScanStrategy;

  constructor(platform: NodeJS.Platform, signatures: Signature[]) {
    switch (platform) {
      case "win32":
        this.strategy = new WindowsScanStrategy(signatures);
        break;
      case "linux":
        this.strategy = new LinuxScanStrategy(signatures);
        break;
      case "darwin":
        this.strategy = new MacOSScanStrategy(signatures);
        break;
      default:
        this.strategy = new WindowsScanStrategy(signatures); // Fallback
    }
  }

  setStrategy(strategy: ScanStrategy) {
    this.strategy = strategy;
  }

  scan(filePath: string, content: Buffer): Threat | null {
    return this.strategy.scan(filePath, content);
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
