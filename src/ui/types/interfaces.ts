export interface Threat {
  file: string;
  threat: string;
  description: string;
  filePath: string;
}

export interface QuarantineRecord {
  originalPath: string;
  quarantinedPath: string;
  timestamp: string;
  action?: "quarantine" | "unquarantine";
}
export interface Vulnerability {
  id: string;
  description: string;
  severity?: string;
  cvssScore?: number;
  affectedComponent?: string;
}
export interface ScanProgress {
  percentage: number;
  scannedFiles?: number;
  totalFiles?: number;
}

export interface ErrorResponse {
  error: string;
}
