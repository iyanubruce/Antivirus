import { useState } from "react";
import { QuarantineRecord, ErrorResponse } from "../types/interfaces";
import path from "path";

const ipcRenderer = window.require
  ? window.require("electron").ipcRenderer
  : null;

export const useQuarantine = () => {
  const [quarantineRecords, setQuarantineRecords] = useState<
    QuarantineRecord[]
  >([]);

  const showToast = (
    message: string,
    type: "success" | "warning" | "error"
  ) => {
    window.dispatchEvent(
      new CustomEvent("showToast", { detail: { message, type } })
    );
  };

  const quarantineFile = async (filePath: string) => {
    try {
      const result: void | ErrorResponse = await ipcRenderer.invoke(
        "quarantine-file",
        filePath
      );
      if (result && "error" in result) {
        showToast(`Failed to quarantine file: ${result.error}`, "error");
      } else {
        showToast(
          `File ${path.basename(filePath)} quarantined successfully`,
          "success"
        );
        await fetchQuarantineRecords();
      }
    } catch (error: any) {
      showToast(`Quarantine error: ${error.message}`, "error");
    }
  };

  const unquarantineFile = async (quarantinedPath: string) => {
    try {
      const result: void | ErrorResponse = await ipcRenderer.invoke(
        "unquarantine-file",
        quarantinedPath
      );
      if (result && "error" in result) {
        showToast(`Failed to unquarantine file: ${result.error}`, "error");
      } else {
        showToast(
          `File ${path.basename(quarantinedPath)} unquarantined successfully`,
          "success"
        );
        await fetchQuarantineRecords();
      }
    } catch (error: any) {
      showToast(`Unquarantine error: ${error.message}`, "error");
    }
  };

  const fetchQuarantineRecords = async () => {
    try {
      const result: QuarantineRecord[] | ErrorResponse =
        await ipcRenderer.invoke("get-quarantine-records");
      if ("error" in result) {
        showToast(
          `Failed to load quarantine records: ${result.error}`,
          "error"
        );
        setQuarantineRecords([]);
      } else {
        setQuarantineRecords(result);
      }
    } catch (error: any) {
      showToast(`Error loading quarantine records: ${error.message}`, "error");
      setQuarantineRecords([]);
    }
  };

  return {
    quarantineRecords,
    quarantineFile,
    unquarantineFile,
    fetchQuarantineRecords,
  };
};
