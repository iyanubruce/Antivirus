import { useState } from "react";
import { Vulnerability, ErrorResponse } from "../types/interfaces";

const ipcRenderer = window.require
  ? window.require("electron").ipcRenderer
  : null;

export const useVulnerabilities = () => {
  const [vulnResults, setVulnResults] = useState<Vulnerability[]>([]);

  const showToast = (
    message: string,
    type: "success" | "warning" | "error"
  ) => {
    window.dispatchEvent(
      new CustomEvent("showToast", { detail: { message, type } })
    );
  };

  const checkVulnerabilities = async () => {
    try {
      const results: Vulnerability[] | ErrorResponse = await ipcRenderer.invoke(
        "check-vulnerabilities"
      );
      if ("error" in results) {
        showToast(`Vulnerability check failed: ${results.error}`, "error");
        setVulnResults([]);
      } else {
        setVulnResults(results);
        showToast(
          results.length
            ? `${results.length} vulnerability${
                results.length > 1 ? "ies" : "y"
              } found`
            : "Vulnerability check complete. No vulnerabilities found.",
          results.length ? "warning" : "success"
        );
      }
    } catch (error: any) {
      showToast(`Vulnerability check error: ${error.message}`, "error");
      setVulnResults([]);
    }
  };

  return { vulnResults, checkVulnerabilities };
};
