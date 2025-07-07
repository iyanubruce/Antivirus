import { Threat, Signature } from "../types/interfaces.js";
import { ScanStrategy } from "../types/strategies.js";

export class WindowsScanStrategy implements ScanStrategy {
  private signatures: Signature[];

  constructor(signatures: Signature[]) {
    this.signatures = signatures.filter(
      (sig) => sig.platform === "windows" || sig.platform === "all"
    );
  }

  scan(filePath: string, content: Buffer): Threat | null {
    for (const sig of this.signatures) {
      const regex = new RegExp(sig.pattern, "i");
      if (regex.test(content.toString("utf-8"))) {
        return {
          file: filePath,
          threat: sig.name,
          description: sig.description,
          filePath: filePath,
        };
      }
    }
    return null;
  }
}

export class LinuxScanStrategy implements ScanStrategy {
  private signatures: Signature[];

  constructor(signatures: Signature[]) {
    this.signatures = signatures.filter(
      (sig) => sig.platform === "linux" || sig.platform === "all"
    );
  }

  scan(filePath: string, content: Buffer): Threat | null {
    for (const sig of this.signatures) {
      const regex = new RegExp(sig.pattern, "i");
      if (regex.test(content.toString("utf-8"))) {
        return {
          file: filePath,
          threat: sig.name,
          description: sig.description,
          filePath: filePath,
        };
      }
    }
    return null;
  }
}

export class MacOSScanStrategy implements ScanStrategy {
  private signatures: Signature[];

  constructor(signatures: Signature[]) {
    this.signatures = signatures.filter(
      (sig) => sig.platform === "macos" || sig.platform === "all"
    );
  }

  scan(filePath: string, content: Buffer): Threat | null {
    for (const sig of this.signatures) {
      const regex = new RegExp(sig.pattern, "i");
      if (regex.test(content.toString("utf-8"))) {
        return {
          file: filePath,
          threat: sig.name,
          description: sig.description,
          filePath: filePath,
        };
      }
    }
    return null;
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
        this.strategy = new WindowsScanStrategy(signatures);
    }
  }

  setStrategy(strategy: ScanStrategy) {
    this.strategy = strategy;
  }

  scan(filePath: string, content: Buffer): Threat | null {
    return this.strategy.scan(filePath, content);
  }
}
