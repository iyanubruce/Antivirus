export interface Signature {
  name: string;
  platform: "windows" | "linux" | "macos" | "all";
  pattern: string;
  description?: string;
}
export interface ScanProgress {
  percentage: number;
  scannedFiles?: number;
  totalFiles?: number;
}
export interface SystemInfo {
  platform: string;
  release: string;
  arch: string;
  nodeVersion: string;
  npmVersion?: string;
  installedPackages?: string[];
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
  installedPackages?: string[];
}

export interface NVDResponse {
  vulnerabilities: Array<{
    cve: {
      id: string;
      descriptions: Array<{
        lang: string;
        value: string;
      }>;
      metrics?: {
        cvssMetricV31?: Array<{
          cvssData: {
            baseScore: number;
            baseSeverity: string;
          };
        }>;
      };
    };
  }>;
}

export interface Vulnerability {
  id: string;
  description: string;
  severity?: string;
  cvssScore?: number;
  affectedComponent?: string;
}

export interface NVDResponse {
  vulnerabilities: Array<{
    cve: {
      id: string;
      descriptions: Array<{
        lang: string;
        value: string;
      }>;
      metrics?: {
        cvssMetricV31?: Array<{
          cvssData: {
            baseScore: number;
            baseSeverity: string;
          };
        }>;
      };
    };
  }>;
}

export interface Threat {
  file: string;
  threat: string;
  description?: string;
  severity?: string;
  filePath?: string; // Optional field for file path
}

export interface ErrorResponse {
  error: string;
}
