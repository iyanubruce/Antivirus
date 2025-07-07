import * as os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import {
  NVDResponse,
  Signature,
  SystemInfo,
  Threat,
  Vulnerability,
} from "./interfaces";
export function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

const execAsync = promisify(exec);
export const waitForServer = async (url: string) => {
  while (true) {
    try {
      await fetch(url);
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
};
export async function getSystemInfo(): Promise<SystemInfo> {
  const platform = os.platform(); // 'win32', 'darwin', 'linux', etc.
  const release = os.release(); // OS version/release
  const arch = os.arch(); // 'x64', 'arm64', etc.
  const nodeVersion = process.version; // Node.js version (e.g., 'v18.17.0')

  let npmVersion: string | undefined;
  let installedPackages: string[] = [];

  try {
    // Execute npm --version command to get npm version
    const { stdout: npmOut } = await execAsync("npm --version");
    npmVersion = npmOut.trim();

    // Get list of globally installed npm packages
    // This helps identify potentially vulnerable packages
    const { stdout: packagesOut } = await execAsync(
      "npm list -g --depth=0 --json"
    );
    const packagesData = JSON.parse(packagesOut);
    installedPackages = Object.keys(packagesData.dependencies || {});
  } catch (error) {
    // If npm commands fail, continue without npm info
    console.warn("Could not retrieve npm information:", error);
  }

  return {
    platform,
    release,
    arch,
    nodeVersion,
    npmVersion,
    installedPackages,
  };
}

export function buildCPEQueries(systemInfo: SystemInfo): string[] {
  const queries: string[] = [];

  // Node.js vulnerability query
  // Remove the 'v' prefix from Node.js version (e.g., 'v18.17.0' -> '18.17.0')
  const nodeVersion = systemInfo.nodeVersion.replace("v", "");
  queries.push(`cpeName=cpe:2.3:a:nodejs:node.js:${nodeVersion}:*:*:*:*:*:*:*`);

  // NPM vulnerability query
  if (systemInfo.npmVersion) {
    queries.push(
      `cpeName=cpe:2.3:a:npmjs:npm:${systemInfo.npmVersion}:*:*:*:*:*:*:*`
    );
  }

  // Operating system specific queries
  // Different OS platforms require different search approaches
  switch (systemInfo.platform) {
    case "win32":
      // Windows vulnerabilities - use keyword search for broader results
      queries.push("keywordSearch=windows AND keywordSearch=microsoft");
      // You could also use specific Windows version CPE if available
      break;

    case "darwin":
      // macOS vulnerabilities
      queries.push("keywordSearch=macos OR keywordSearch=mac_os");
      // Could add specific macOS version queries here
      break;

    case "linux":
      // Linux vulnerabilities - general Linux kernel and distribution queries
      queries.push("keywordSearch=linux");
      // Could add specific distribution queries (Ubuntu, CentOS, etc.)
      break;

    default:
      // Fallback for other platforms
      queries.push(`keywordSearch=${systemInfo.platform}`);
      break;
  }

  // Optional: Add queries for globally installed packages
  // This would check vulnerabilities in installed npm packages
  if (systemInfo.installedPackages && systemInfo.installedPackages.length > 0) {
    // Limit to first 5 packages to avoid too many API calls
    const topPackages = systemInfo.installedPackages.slice(0, 5);
    topPackages.forEach((packageName) => {
      queries.push(`keywordSearch=${packageName}`);
    });
  }

  return queries;
}

export async function fetchVulnerabilities(
  query: string,
  apiKey?: string
): Promise<Vulnerability[]> {
  const baseUrl = "https://services.nvd.nist.gov/rest/json/cves/2.0";

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "VulnerabilityChecker/1.0",
  };

  if (apiKey) {
    headers["apiKey"] = apiKey;
  }

  try {
    // Build the full URL with query parameters
    const url = `${baseUrl}?${query}&resultsPerPage=50&startIndex=0`;

    console.log(`Fetching vulnerabilities from: ${url}`);

    const response = await fetch(url, {
      headers,
      method: "GET",
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(
        `NVD API error: ${response.status} ${response.statusText}`
      );
    }

    // Parse the JSON response
    const data = (await response.json()) as NVDResponse;

    if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
      return [];
    }

    return data.vulnerabilities.map((vuln) => {
      // Find English description, fallback to first available description
      const description =
        vuln.cve.descriptions.find((desc) => desc.lang === "en")?.value ||
        vuln.cve.descriptions[0]?.value ||
        "No description available";

      // Extract CVSS v3.1 metrics if available
      const cvssMetric = vuln.cve.metrics?.cvssMetricV31?.[0];
      const severity = cvssMetric?.cvssData?.baseSeverity;
      const cvssScore = cvssMetric?.cvssData?.baseScore;

      return {
        id: vuln.cve.id,
        description,
        severity,
        cvssScore,
        // affectedComponent will be added by the caller
      };
    });
  } catch (error) {
    console.error(
      `Error fetching vulnerabilities for query "${query}":`,
      error
    );

    // Return empty array instead of throwing to allow other queries to succeed
    return [];
  }
}

interface ScanProgress {
  percentage: number;
  scannedFiles?: number;
  totalFiles?: number;
}

// Strategy Pattern: Interface for scanning strategies
interface ScanStrategy {
  scan(filePath: string, content: Buffer): Threat | null;
}

// Concrete strategy for Windows-specific signatures
class WindowsScanStrategy implements ScanStrategy {
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

// Concrete strategy for Linux-specific signatures
class LinuxScanStrategy implements ScanStrategy {
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

// Concrete strategy for macOS-specific signatures
class MacOSScanStrategy implements ScanStrategy {
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

// Context for selecting the appropriate strategy
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
