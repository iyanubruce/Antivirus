import React from "react";
import ThreatComponent from "../subcomponents/threat";
import Quarantine from "../subcomponents/quarantine";
import { Threat, QuarantineRecord } from "../../types/interfaces";

interface ScanResultsProps {
  theme: "light" | "dark";
  quarantineRecords: QuarantineRecord[];
  startScan: () => Promise<void>;
  unquarantineFile: (filePath: string) => Promise<void>;
  quarantineFile: (filePath: string) => Promise<void>;
  totalFiles: number;
  scanDuration: string;
  showToast: (message: string, type: "success" | "warning" | "error") => void;
  setScanResults: (update: Threat[]) => void;
  scanResults: Threat[];
}

export const ScanResults: React.FC<ScanResultsProps> = ({
  theme,
  startScan,
  scanDuration,
  showToast,
  setScanResults,
  totalFiles,
  quarantineFile,
  quarantineRecords,
  unquarantineFile,
  scanResults,
}) => {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Scan Results</h2>
        <p
          className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
        >
          View and manage detected threats from your last scan
        </p>
      </div>
      <div
        className={`rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        } p-6 mb-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Last Scan Details</h3>
            <p
              className={`text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {new Date().toLocaleString()}
            </p>
          </div>
          <button
            onClick={startScan}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap"
          >
            <i className="fas fa-sync-alt mr-2"></i>Rescan
          </button>
        </div>
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              theme === "light" ? "bg-gray-50" : "bg-gray-700"
            }`}
          >
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Files Scanned
                </p>
                <p className="font-semibold mt-1">{totalFiles}</p>
              </div>
              <div>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Scan Duration
                </p>
                <p className="font-semibold mt-1">{scanDuration}</p>
              </div>
              <div>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Threats Found
                </p>
                <p className="font-semibold mt-1 text-red-600">
                  {scanResults.length}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Detected Threats</h4>
            {scanResults.length === 0 ? (
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                No threats detected in the last scan.
              </p>
            ) : (
              scanResults.map((threat) => (
                <ThreatComponent
                  setScanResults={setScanResults}
                  scanResults={scanResults}
                  key={threat.filePath} // Use filePath for uniqueness
                  threatName={threat.threat}
                  theme={theme}
                  showToast={showToast}
                  quarantineFile={quarantineFile}
                  filePath={threat.filePath}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <div
        className={`rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        } p-6`}
      >
        <h3 className="text-xl font-semibold mb-4">Quarantined Files</h3>
        {quarantineRecords.length === 0 ? (
          <p
            className={`text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            No files are currently quarantined.
          </p>
        ) : (
          quarantineRecords
            .filter((record) => record.action === "quarantine")
            .map((record) => (
              <Quarantine
                key={record.quarantinedPath} // Use quarantinedPath for uniqueness
                threatName={record.originalPath.split(/[\\/]/).pop() || ""}
                theme={theme}
                showToast={showToast}
                unQuarantineFile={unquarantineFile}
                filePath={record.quarantinedPath}
              />
            ))
        )}
      </div>
    </div>
  );
};
