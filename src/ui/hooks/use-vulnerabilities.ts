import { useState, useEffect } from "react";
import { Vulnerability, ErrorResponse } from "../types/interfaces";

const ipcRenderer = window.require
  ? window.require("electron").ipcRenderer
  : null;

export const useVulnerabilities = (
  showToast: (message: string, type: "success" | "warning" | "error") => void
) => {
  const [vulnResults, setVulnResults] = useState<Vulnerability[]>([]);
  const [lastScanTime, setLastScanTime] = useState<string>("");
  const [vulnerabilitiesLoading, setVulnerabilitiesLoading] =
    useState<boolean>(false);
  const checkVulnerabilities = async () => {
    try {
      setVulnerabilitiesLoading(true);
      const result: Vulnerability[] | ErrorResponse = await ipcRenderer.invoke(
        "check-vulnerabilities"
      );
      if ("error" in result) {
        showToast(`Vulnerability check failed: ${result.error}`, "error");
        setVulnerabilitiesLoading(false);
        setVulnResults([]);
      } else {
        setVulnResults(result);
        setLastScanTime(new Date().toLocaleString());
        setVulnerabilitiesLoading(false);
        showToast("Vulnerability check completed", "success");
      }
    } catch (error: any) {
      setVulnerabilitiesLoading(false);
      console.error("Vulnerability check error:", error.message, error.stack);
      showToast(`Vulnerability check failed: ${error.message}`, "error");
      setVulnResults([]);
    }
  };

  const fetchLastVulnerabilityScan = async () => {
    try {
      const result:
        | { vulnerabilities: Vulnerability[]; lastScanTime: string }
        | ErrorResponse = await ipcRenderer.invoke(
        "get-last-vulnerability-scan-details"
      );
      if ("error" in result) {
        console.error("Fetch last vulnerability scan error:", result.error);
        showToast(
          `Failed to fetch last scan details: ${result.error}`,
          "error"
        );
        setVulnResults([]);
        setLastScanTime("");
      } else {
        setVulnResults(result.vulnerabilities);
        setLastScanTime(result.lastScanTime);
      }
    } catch (error: any) {
      console.error(
        "Fetch last vulnerability scan error:",
        error.message,
        error.stack
      );
      showToast(`Failed to fetch last scan details: ${error.message}`, "error");
      setVulnResults([]);
      setLastScanTime("");
    }
  };

  useEffect(() => {
    fetchLastVulnerabilityScan();
  }, []);

  return {
    vulnResults,
    lastScanTime,
    checkVulnerabilities,
    fetchLastVulnerabilityScan,
    vulnerabilitiesLoading,
  };
};
