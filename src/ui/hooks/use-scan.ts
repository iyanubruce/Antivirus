import { useState, useEffect } from "react";
import { msToSecondsString } from "../utils/format";
import { Threat, ErrorResponse, ScanProgress } from "../types/interfaces";

// SAFER IPC HANDLING FOR nodeIntegration: true SETUP
let ipcRenderer: any = null;

// Initialize IPC safely
if (typeof window !== "undefined") {
  try {
    // Try window.require first (Electron < 5)
    if ((window as any).require) {
      ipcRenderer = (window as any).require("electron").ipcRenderer;
    }
    // Try global require (Electron >= 5 with nodeIntegration)
    else if (typeof require !== "undefined") {
      ipcRenderer = require("electron").ipcRenderer;
    }

    if (!ipcRenderer) {
      console.error("SCAN-HOOK: Failed to initialize ipcRenderer");
    }
  } catch (error) {
    console.error("SCAN-HOOK: Error initializing ipcRenderer:", error);
  }
}

export const useScan = (
  showToast: (message: string, type: "success" | "warning" | "error") => void
) => {
  const [scanStatus, setScanStatus] = useState<
    "protected" | "scanning" | "checking" | "completed"
  >("protected");
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [filesScanned, setFilesScanned] = useState<number>(0);
  const [scanDuration, setScanDuration] = useState<string>("0s");
  const [scanResults, setScanResults] = useState<Threat[]>([]);
  const [lastScanTime, setLastScanTime] = useState<string>("");
  const [numberOfPreviousThreats, setNumberOfPreviousThreats] =
    useState<number>(0);

  const startScan = async () => {
    if (!ipcRenderer) {
      showToast("Application is not running in Electron environment", "error");
      return;
    }

    setScanStatus("scanning");
    setScanProgress(0);
    setScanResults([]);
    console.log("SCAN-HOOK: Starting scan process");

    try {
      const dir: string | null = await ipcRenderer.invoke("select-directory");
      if (!dir) {
        setScanStatus("protected");
        showToast("No directory selected", "warning");
        return;
      }
      console.log("SCAN-HOOK: Selected directory:", dir);

      const result:
        | { totalFiles: number; threats: Threat[]; durationMs: number }
        | ErrorResponse = await ipcRenderer.invoke("scan-directory", dir);

      let results: Threat[] = [];
      let totalFiles: number = 0;
      let duration: number = 0;

      if ("error" in result) {
        console.error("SCAN-HOOK: Scan error:", result.error);
        showToast(`Scan error: ${result.error}`, "error");
        setScanStatus("protected");
        return;
      } else {
        setLastScanTime(new Date().toISOString());
        results = result.threats;
        totalFiles = result.totalFiles;
        duration = result.durationMs;
        console.log(
          `SCAN-HOOK: Scan completed. Found ${results.length} threats`
        );
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
      console.error("SCAN-HOOK: Unexpected scan error:", error);
      setScanStatus("protected");
      showToast(`Scan error: ${error.message || "Unknown error"}`, "error");
    }
  };

  const fetchLastScanDetails = async () => {
    if (!ipcRenderer) {
      console.warn("SCAN-HOOK: Cannot fetch scan details - IPC not available");
      return;
    }

    try {
      const result:
        | { totalFiles: number; threats: Threat[]; lastScanTime: string }
        | ErrorResponse = await ipcRenderer.invoke("get-last-scan-details");

      if ("error" in result) {
        console.error(
          "SCAN-HOOK: Failed to fetch last scan details:",
          result.error
        );
        showToast(
          `Failed to fetch last scan details: ${result.error}`,
          "error"
        );
      } else {
        setFilesScanned(result.totalFiles);
        setLastScanTime(result.lastScanTime);
        const number = result.threats.length - 1;
        setNumberOfPreviousThreats(number | 0);
        console.log(
          `SCAN-HOOK: Loaded last scan details. ${result.threats.length} threats found.`
        );
      }
    } catch (error: any) {
      console.error(
        "SCAN-HOOK: Fetch last scan details error:",
        error.message,
        error.stack
      );
      showToast(`Failed to fetch last scan details: ${error.message}`, "error");
      setLastScanTime("");
      setFilesScanned(0);
      setLastScanTime("No scans yet");
      setNumberOfPreviousThreats(0);
    }
  };

  useEffect(() => {
    if (!ipcRenderer) {
      console.warn(
        "SCAN-HOOK: Progress listener not set up - IPC not available"
      );
      return;
    }

    const handleProgress = (_event: any, progress: ScanProgress) => {
      console.log(
        `SCAN-HOOK: Received progress update: ${progress.percentage}%`
      );
      setScanProgress(progress.percentage);
    };

    console.log("SCAN-HOOK: Setting up progress listener");
    ipcRenderer.on("scan-progress", handleProgress);

    return () => {
      console.log("SCAN-HOOK: Cleaning up progress listener");
      ipcRenderer?.removeListener("scan-progress", handleProgress);
    };
  }, []);

  useEffect(() => {
    fetchLastScanDetails();
  }, []);

  return {
    lastScanTime,
    scanStatus,
    scanProgress,
    filesScanned,
    scanDuration,
    numberOfPreviousThreats,
    scanResults,
    startScan,
    setScanResults,
  };
};
