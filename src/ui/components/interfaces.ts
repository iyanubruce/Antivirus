export interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "light" | "dark";
}

export interface ProgressCircleProps {
  progress: number;
}

export interface SecurityChartProps {
  theme: "light" | "dark";
}

export interface DashboardProps {
  theme: "light" | "dark";
  scanStatus: "protected" | "scanning" | "checking" | "completed";
  scanProgress: number;
  startScan: () => void;
  checkVulnerabilities: () => void;
  showToast: (message: string, type: "success" | "warning" | "error") => void;
}

export interface Vulnerability {
  id: string;
  software: string;
  description: string;
  cvss: number;
  impact: string;
  recommendation: string;
}

export interface VulnerabilityReportsProps {
  theme: "light" | "dark";
  checkVulnerabilities: () => void;
  handleVulnerabilityClick: (vulnerability: Vulnerability) => void;
}

export interface ScanResultsProps {
  theme: "light" | "dark";
  startScan: () => void;
}

export interface SettingsProps {
  theme: "light" | "dark";
}

export interface VulnerabilityModalProps {
  theme: "light" | "dark";
  vulnerability: Vulnerability | null;
  onClose: () => void;
}

export interface ToastNotificationProps {
  show: boolean;
  message: string;
  type: "success" | "warning" | "error";
  onClose: () => void;
}

export interface ThreatProps {
  theme: "light" | "dark";
  threatName: string;
  quarantineFile: (filePath: string) => Promise<void>;
  filePath: string;
  showToast: (message: string, type: "success" | "warning" | "error") => void;
}
export interface QuarantineProps {
  theme: "light" | "dark";
  threatName: string;
  unQuarantineFile: (filePath: string) => Promise<void>;
  filePath: string;
  showToast: (message: string, type: "success" | "warning" | "error") => void;
}

export interface Threat {
  file: string;
  threat: string;
  description?: string;
  severity?: string;
  filePath?: string; // Optional field for file path
}

export interface QuarantineRecord {
  originalPath: string;
  quarantinedPath: string;
  timestamp: string;
  action?: "quarantine" | "unquarantine";
}
