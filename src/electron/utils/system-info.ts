import * as os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { SystemInfo, Vulnerability, NVDResponse } from "../types/interfaces";

const execAsync = promisify(exec);

export async function getSystemInfo(): Promise<SystemInfo> {
  const platform = os.platform();
  const release = os.release();
  const arch = os.arch();
  const nodeVersion = process.version;

  let npmVersion: string | undefined;
  let installedPackages: string[] = [];

  try {
    const { stdout: npmOut } = await execAsync("npm --version");
    npmVersion = npmOut.trim();
    const { stdout: packagesOut } = await execAsync(
      "npm list -g --depth=0 --json"
    );
    const packagesData = JSON.parse(packagesOut);
    installedPackages = Object.keys(packagesData.dependencies || {});
  } catch (error) {
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
  const nodeVersion = systemInfo.nodeVersion.replace("v", "");
  queries.push(`cpeName=cpe:2.3:a:nodejs:node.js:${nodeVersion}:*:*:*:*:*:*:*`);

  if (systemInfo.npmVersion) {
    queries.push(
      `cpeName=cpe:2.3:a:npmjs:npm:${systemInfo.npmVersion}:*:*:*:*:*:*:*`
    );
  }

  switch (systemInfo.platform) {
    case "win32":
      queries.push("keywordSearch=windows AND keywordSearch=microsoft");
      break;
    case "darwin":
      queries.push("keywordSearch=macos OR keywordSearch=mac_os");
      break;
    case "linux":
      queries.push("keywordSearch=linux");
      break;
    default:
      queries.push(`keywordSearch=${systemInfo.platform}`);
      break;
  }

  if (systemInfo.installedPackages && systemInfo.installedPackages.length > 0) {
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
    const url = `${baseUrl}?${query}&resultsPerPage=50&startIndex=0`;
    console.log(`Fetching vulnerabilities from: ${url}`);
    const response = await fetch(url, {
      headers,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `NVD API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as NVDResponse;

    if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
      return [];
    }

    return data.vulnerabilities.map((vuln) => {
      const description =
        vuln.cve.descriptions.find((desc) => desc.lang === "en")?.value ||
        vuln.cve.descriptions[0]?.value ||
        "No description available";
      const cvssMetric = vuln.cve.metrics?.cvssMetricV31?.[0];
      const severity = cvssMetric?.cvssData?.baseSeverity;
      const cvssScore = cvssMetric?.cvssData?.baseScore;

      return {
        id: vuln.cve.id,
        description,
        severity,
        cvssScore,
      };
    });
  } catch (error) {
    console.error(
      `Error fetching vulnerabilities for query "${query}":`,
      error
    );
    return [];
  }
}
