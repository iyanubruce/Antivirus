import { useState, useEffect } from "react";
import { msToSecondsString } from "../utils/format";
import { Threat, ErrorResponse, ScanProgress } from "../types/interfaces";

const ipcRenderer = window.require
  ? window.require("electron").ipcRenderer
  : null;

export const useScan = () => {
  const [scanStatus, setScanStatus] = useState<
    "protected" | "scanning" | "checking" | "completed"
  >("protected");
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [filesScanned, setFilesScanned] = useState<number>(0);
  const [scanDuration, setScanDuration] = useState<string>("0s");
  const [scanResults, setScanResults] = useState<Threat[]>([]);

  const showToast = (
    message: string,
    type: "success" | "warning" | "error"
  ) => {
    window.dispatchEvent(
      new CustomEvent("showToast", { detail: { message, type } })
    );
  };

  const startScan = async () => {
    setScanStatus("scanning");
    setScanProgress(0);
    setScanResults([]);

    try {
      const dir: string | null = await ipcRenderer.invoke("select-directory");
      if (!dir) {
        setScanStatus("protected");
        showToast("No directory selected", "warning");
        return;
      }

      const result:
        | { totalFiles: number; threats: Threat[]; durationMs: number }
        | ErrorResponse = await ipcRenderer.invoke("scan-directory", dir);

      let results: Threat[] = [];
      let totalFiles: number = 0;
      let duration: number = 0;

      if ("error" in result) {
        results = [];
      } else {
        results = result.threats;
        totalFiles = result.totalFiles;
        duration = result.durationMs;
      }

      setScanStatus("completed");
      setScanResults(results);
      setFilesScanned(totalFiles);
      setScanDuration(msToSecondsString(duration));
      showToast(
        results.length
          ? `${results.length} threat${results.length > 1 ? "s" : ""} found`
          : "Scan completed. No threats found!",
        results.length ? "warning" : "success"
      );
    } catch (error: any) {
      setScanStatus("protected");
      showToast(`Scan error: ${error.message}`, "error");
    }
  };

  useEffect(() => {
    const handleProgress = (_event: any, progress: ScanProgress) => {
      setScanProgress(progress.percentage);
    };

    ipcRenderer?.on("scan-progress", handleProgress);
    return () => {
      ipcRenderer?.removeListener("scan-progress", handleProgress);
    };
  }, []);

  return {
    scanStatus,
    scanProgress,
    filesScanned,
    scanDuration,
    scanResults,
    startScan,
  };
};
