export interface ErrorResponse {
  error: string;
}
export interface QuarantineRecord {
  originalPath: string;
  quarantinedPath: string;
  timestamp: string;
  action?: "quarantine" | "unquarantine";
}
export interface ScanProgress {
  percentage: number;
  scannedFiles?: number;
  totalFiles?: number;
}

export interface Signature {
  name: string;
  pattern: string;
  description: string;
  platform: "windows" | "linux" | "macos" | "all";
}

export interface Threat {
  file: string;
  threat: string;
  description: string;
  filePath: string;
}

export interface Vulnerability {
  id: string;
  description: string;
  severity?: string;
  cvssScore?: number;
  affectedComponent?: string;
}

export interface SystemInfo {
  platform: string;
  release: string;
  arch: string;
  nodeVersion: string;
  npmVersion?: string;
  installedPackages: string[];
}

export interface NVDResponse {
  vulnerabilities: {
    cve: {
      id: string;
      descriptions: { lang: string; value: string }[];
      metrics?: {
        cvssMetricV31?: {
          cvssData: {
            baseSeverity?: string;
            baseScore?: number;
          };
        }[];
      };
    };
  }[];
}
