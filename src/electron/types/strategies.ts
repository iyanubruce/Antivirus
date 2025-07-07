import { Threat } from "./interfaces.js";

export interface QuarantineStrategy {
  quarantine(filePath: string): Promise<void>;
}

export interface UnquarantineStrategy {
  unquarantine(quarantinedPath: string, originalPath: string): Promise<void>;
}

export interface ScanStrategy {
  scan(filePath: string, content: Buffer): Threat | null;
}
