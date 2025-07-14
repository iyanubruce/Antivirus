import { ipcMain } from "electron";
import {
  getSystemInfo,
  buildCPEQueries,
  fetchVulnerabilities,
} from "../utils/system-info.js";
import { ErrorResponse, Vulnerability } from "../types/interfaces.js";
import { appendScanResult } from "../utils/config.js";

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
      const lastScanTime = Date.now().toLocaleString();
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
