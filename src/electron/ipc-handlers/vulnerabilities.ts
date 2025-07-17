import { ipcMain } from "electron";
import {
  getSystemInfo,
  buildCPEQueries,
  fetchVulnerabilities,
} from "../utils/system-info.js";
import {
  ErrorResponse,
  ScanResult,
  Vulnerability,
} from "../types/interfaces.js";
import { promises as fs } from "fs";
import path from "path";
import { appendScanResult, scanResultsDir } from "../utils/config.js";

ipcMain.handle(
  "check-vulnerabilities",
  async (): Promise<Vulnerability[] | ErrorResponse> => {
    try {
      const systemInfo = await getSystemInfo();
      const queries = buildCPEQueries(systemInfo);
      const apiKey = process.env.NVD_API_KEY || undefined;
      const allVulnerabilities: Vulnerability[] = [];

      for (const query of queries) {
        const vulnerabilities = await fetchVulnerabilities(query, apiKey);
        vulnerabilities.forEach((vuln) => {
          if (query.includes("node.js")) {
            vuln.affectedComponent = `Node.js ${systemInfo.nodeVersion}`;
          } else if (query.includes("npm")) {
            vuln.affectedComponent = `npm ${systemInfo.npmVersion}`;
          } else {
            vuln.affectedComponent = `${systemInfo.platform} ${systemInfo.release}`;
          }
        });
        allVulnerabilities.push(...vulnerabilities);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const uniqueVulnerabilities = allVulnerabilities.filter(
        (vuln, index, self) => index === self.findIndex((v) => v.id === vuln.id)
      );

      uniqueVulnerabilities.sort(
        (a, b) => (b.cvssScore || 0) - (a.cvssScore || 0)
      );
      const lastScanTime = new Date().toISOString();
      appendScanResult({
        time: lastScanTime,
        vulnerabilities: uniqueVulnerabilities,
        action: "vulnerabilityScan",
      });
      return uniqueVulnerabilities;
    } catch (error: any) {
      return { error: (error as Error).message };
    }
  }
);

ipcMain.handle(
  "get-last-vulnerability-scan-details",
  async (): Promise<
    | { vulnerabilities: Vulnerability[]; lastScanTime: number | string }
    | ErrorResponse
  > => {
    const logPath = path.join(scanResultsDir, "scan-results.json");
    try {
      const data = await fs.readFile(logPath, "utf-8");
      const logs: ScanResult[] = JSON.parse(data);

      // Find the latest vulnerability scan
      const lastVulnerabilityScan = [...logs]
        .reverse()
        .find((log) => log.action === "vulnerabilityScan");

      if (!lastVulnerabilityScan) {
        return {
          vulnerabilities: [],
          lastScanTime: Date.now(),
        };
      }

      return {
        vulnerabilities: lastVulnerabilityScan.vulnerabilities || [],
        lastScanTime: lastVulnerabilityScan.time || "no previous scan",
      };
    } catch (error: any) {
      console.error(
        `Failed to read vulnerability scan details: ${error.message}`,
        error.stack
      );
      return { error: error.message };
    }
  }
);
