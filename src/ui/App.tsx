import React, { useState, useEffect } from "react";
import { Header, Sidebar, Dashboard } from "./components";

import "./App.css";
import { Threat } from "./components/subcomponents";

const ipcRenderer = window.require
  ? window.require("electron").ipcRenderer
  : null;

interface Vulnerability {
  id: string;
  software: string;
  description: string;
  cvss: number;
  impact: string;
  recommendation: string;
}

interface VulnerabilityReportsProps {
  theme: "light" | "dark";
  checkVulnerabilities: () => void;
  handleVulnerabilityClick: (vulnerability: Vulnerability) => void;
}

interface ScanResultsProps {
  theme: "light" | "dark";
  startScan: () => void;
  showToast: (message: string, type: "success" | "warning" | "error") => void;
}

interface SettingsProps {
  theme: "light" | "dark";
}

interface VulnerabilityModalProps {
  theme: "light" | "dark";
  vulnerability: Vulnerability | null;
  onClose: () => void;
}

interface ToastNotificationProps {
  show: boolean;
  message: string;
  type: "success" | "warning" | "error";
  onClose: () => void;
}

// Sidebar Component

// SecurityChart Component

// VulnerabilityReports Component
const VulnerabilityReports: React.FC<VulnerabilityReportsProps> = ({
  theme,
  checkVulnerabilities,
  handleVulnerabilityClick,
}) => {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Vulnerability Reports</h2>
        <p
          className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
        >
          View and analyze detected software vulnerabilities
        </p>
      </div>
      <div
        className={`rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        } p-6 mb-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">
              Latest Vulnerability Check
            </h3>
            <p
              className={`text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              July 3, 2025 10:45 AM
            </p>
          </div>
          <button
            onClick={checkVulnerabilities}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap"
          >
            <i className="fas fa-sync-alt mr-2"></i>Recheck
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
                  Software Checked
                </p>
                <p className="font-semibold mt-1">156</p>
              </div>
              <div>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Check Duration
                </p>
                <p className="font-semibold mt-1">3m 45s</p>
              </div>
              <div>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Vulnerabilities Found
                </p>
                <p className="font-semibold mt-1 text-yellow-600">2</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Detected Vulnerabilities</h4>
            <div
              className={`rounded-lg ${
                theme === "light"
                  ? "border border-gray-200"
                  : "border border-gray-700"
              } overflow-hidden`}
            >
              <div
                className={`${
                  theme === "light" ? "bg-gray-50" : "bg-gray-700"
                } p-4 border-b ${
                  theme === "light" ? "border-gray-200" : "border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">CVE-2025-1234</p>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Low Risk
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      } mt-1`}
                    >
                      Chrome Browser v115.0.5790.110
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleVulnerabilityClick({
                        id: "CVE-2025-1234",
                        software: "Chrome Browser v115.0.5790.110",
                        description:
                          "Cross-site scripting vulnerability in browser rendering engine that could allow an attacker to execute arbitrary code in the context of the affected web browser.",
                        cvss: 3.5,
                        impact:
                          "This vulnerability could potentially allow attackers to execute malicious scripts, steal sensitive information, or manipulate webpage content.",
                        recommendation:
                          "Update to the latest version of Chrome Browser. Enable automatic updates to prevent future vulnerabilities.",
                      })
                    }
                    className="text-blue-600 hover:text-blue-700 font-medium !rounded-button whitespace-nowrap"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
                <div className="mt-2">
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Cross-site scripting vulnerability in browser rendering
                    engine
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === "light" ? "bg-gray-100" : "bg-gray-600"
                      }`}
                    >
                      CVSS: 3.5
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === "light" ? "bg-gray-100" : "bg-gray-600"
                      }`}
                    >
                      Web Browser
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`${
                  theme === "light" ? "bg-gray-50" : "bg-gray-700"
                } p-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">CVE-2025-5678</p>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Low Risk
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      } mt-1`}
                    >
                      PDF Reader v22.001.20117
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleVulnerabilityClick({
                        id: "CVE-2025-5678",
                        software: "PDF Reader v22.001.20117",
                        description:
                          "Memory corruption vulnerability in PDF parsing module",
                        cvss: 3.2,
                        impact:
                          "This vulnerability could allow attackers to crash the application or execute arbitrary code.",
                        recommendation:
                          "Update to the latest version of PDF Reader.",
                      })
                    }
                    className="text-blue-600 hover:text-blue-700 font-medium !rounded-button whitespace-nowrap"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
                <div className="mt-2">
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Memory corruption vulnerability in PDF parsing module
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === "light" ? "bg-gray-100" : "bg-gray-600"
                      }`}
                    >
                      CVSS: 3.2
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === "light" ? "bg-gray-100" : "bg-gray-600"
                      }`}
                    >
                      PDF Software
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        } p-6`}
      >
        <h3 className="text-xl font-semibold mb-4">Check History</h3>
        <div className="space-y-4">
          {[
            {
              date: "July 2, 2025",
              time: "15:30",
              vulnerabilities: 2,
              status: "Low Risk",
            },
            {
              date: "July 1, 2025",
              time: "09:15",
              vulnerabilities: 0,
              status: "Secure",
            },
            {
              date: "June 30, 2025",
              time: "14:45",
              vulnerabilities: 1,
              status: "Low Risk",
            },
          ].map((check, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                theme === "light" ? "bg-gray-50" : "bg-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i
                    className={`fas fa-circle text-xs mr-2 ${
                      check.vulnerabilities === 0
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  ></i>
                  <div>
                    <p className="font-medium">{check.date}</p>
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {check.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      check.vulnerabilities === 0
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {check.status}
                  </p>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {check.vulnerabilities} vulnerabilities found
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ScanResults Component
const ScanResults: React.FC<ScanResultsProps> = ({
  theme,
  startScan,
  showToast,
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
              July 3, 2025 10:45 AM
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
                <p className="font-semibold mt-1">45,678</p>
              </div>
              <div>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Scan Duration
                </p>
                <p className="font-semibold mt-1">5m 23s</p>
              </div>
              <div>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Threats Found
                </p>
                <p className="font-semibold mt-1 text-red-600">2</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Detected Threats</h4>
            <Threat
              threatName="Suspicious file"
              theme={theme}
              showToast={showToast}
              filePath="C:/Users/Downloads/setup.exe"
            />
            <Threat
              threatName="Malware Detected"
              theme={theme}
              showToast={showToast}
              filePath="C:/Users/AppData/Local/Temp/temp_file.dll"
            />
          </div>
        </div>
      </div>
      <div
        className={`rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        } p-6`}
      >
        <h3 className="text-xl font-semibold mb-4">Scan History</h3>
        <div className="space-y-4">
          {[
            {
              date: "July 2, 2025",
              time: "15:30",
              threats: 0,
              status: "Clean",
            },
            {
              date: "July 1, 2025",
              time: "09:15",
              threats: 1,
              status: "Threat Found",
            },
            {
              date: "June 30, 2025",
              time: "14:45",
              threats: 0,
              status: "Clean",
            },
          ].map((scan, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                theme === "light" ? "bg-gray-50" : "bg-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i
                    className={`fas fa-circle text-xs mr-2 ${
                      scan.threats === 0 ? "text-green-500" : "text-red-500"
                    }`}
                  ></i>
                  <div>
                    <p className="font-medium">{scan.date}</p>
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {scan.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      scan.threats === 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {scan.status}
                  </p>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {scan.threats} threats found
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Settings Component
const Settings: React.FC<SettingsProps> = ({ theme }) => {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb- circonst2">Settings</h2>
        <p
          className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
        >
          Configure your antivirus preferences and scanning options
        </p>
      </div>
      <div
        className={`rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        } p-6 mb-6`}
      >
        <h3 className="text-xl font-semibold mb-4">Scan Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Scan Directory
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value="C:/Users"
                readOnly
                className={`flex-1 px-4 py-2 rounded-md ${
                  theme === "light"
                    ? "bg-gray-50 border border-gray-200"
                    : "bg-gray-700 border border-gray-600"
                }`}
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap">
                <i className="fas fa-folder-open mr-2"></i>Browse
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Scan Frequency
            </label>
            <div
              className={`grid grid-cols-3 gap-3 p-1 rounded-md ${
                theme === "light" ? "bg-gray-100" : "bg-gray-700"
              }`}
            >
              <button
                className={`px-4 py-2 rounded !rounded-button whitespace-nowrap ${
                  theme === "light"
                    ? "bg-white shadow-sm text-gray-900"
                    : "bg-gray-800 shadow text-white"
                }`}
              >
                Manual
              </button>
              <button className="px-4 py-2 rounded opacity-50 !rounded-button whitespace-nowrap">
                Daily
              </button>
              <button className="px-4 py-2 rounded opacity-50 !rounded-button whitespace-nowrap">
                Weekly
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              File Types to Scan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Executables (.exe)",
                "Documents (.doc, .pdf)",
                "Archives (.zip, .rar)",
                "All Files",
              ].map((type, index) => (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-md ${
                    theme === "light"
                      ? "bg-gray-50 border border-gray-200"
                      : "bg-gray-700 border border-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={index === 0 || index === 3}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    readOnly
                  />
                  <span className="ml-2 text-sm">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        } p-6`}
      >
        <h3 className="text-xl font-semibold mb-4">Advanced Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Real-time Protection</h4>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Monitor system changes in real-time
              </p>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative ${
                theme === "light" ? "bg-blue-600" : "bg-blue-500"
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Cloud Protection</h4>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Use cloud database for enhanced detection
              </p>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative ${
                theme === "light" ? "bg-blue-600" : "bg-blue-500"
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6 space-x-3">
        <button
          className={`px-4 py-2 rounded-md ${
            theme === "light"
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-gray-700 hover:bg-gray-600"
          } !rounded-button whitespace-nowrap`}
        >
          Reset to Default
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap">
          Save Changes
        </button>
      </div>
    </div>
  );
};

// VulnerabilityModal Component
const VulnerabilityModal: React.FC<VulnerabilityModalProps> = ({
  theme,
  vulnerability,
  onClose,
}) => {
  if (!vulnerability) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`max-w-2xl w-full mx-4 rounded-lg ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        } shadow-xl`}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">{vulnerability.id}</h3>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                } mt-1`}
              >
                {vulnerability.software}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"
              } !rounded-button whitespace-nowrap`}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {vulnerability.description}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">CVSS Score</h4>
              <div className="flex items-center">
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    vulnerability.cvss < 4
                      ? "bg-yellow-100 text-yellow-800"
                      : vulnerability.cvss < 7
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {vulnerability.cvss.toFixed(1)}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Potential Impact</h4>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {vulnerability.impact}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommended Actions</h4>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {vulnerability.recommendation}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ToastNotification Component
const ToastNotification: React.FC<ToastNotificationProps> = ({
  show,
  message,
  type,
  onClose,
}) => {
  return (
    <div
      className={`fixed bottom-6 right-6 max-w-md transition-all duration-300 transform ${
        show
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`rounded-lg shadow-lg p-4 flex items-start ${
          type === "success"
            ? "bg-green-50 border-l-4 border-green-500"
            : type === "warning"
            ? "bg-yellow-50 border-l-4 border-yellow-500"
            : "bg-red-50 border-l-4 border-red-500"
        }`}
      >
        <div className="flex-shrink-0 mr-3">
          <i
            className={`fas ${
              type === "success"
                ? "fa-check-circle text-green-500"
                : type === "warning"
                ? "fa-exclamation-triangle text-yellow-500"
                : "fa-times-circle text-red-500"
            } text-lg`}
          ></i>
        </div>
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              type === "success"
                ? "text-green-800"
                : type === "warning"
                ? "text-yellow-800"
                : "text-red-800"
            }`}
          >
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-500 cursor-pointer !rounded-button whitespace-nowrap"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

// Define types matching main.ts
interface Threat {
  file: string;
  threat: string;
}

interface Vulnerability {
  id: string;
  description: string;
}

interface ErrorResponse {
  error: string;
}

interface ScanProgress {
  percentage: number;
  scannedFiles?: number;
  totalFiles?: number;
}

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [scanStatus, setScanStatus] = useState<
    "protected" | "scanning" | "checking" | "completed"
  >("protected");
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [notificationType, setNotificationType] = useState<
    "success" | "warning" | "error"
  >("success");
  const [showVulnerabilityModal, setShowVulnerabilityModal] =
    useState<boolean>(false);
  const [selectedVulnerability, setSelectedVulnerability] =
    useState<Vulnerability | null>(null);
  const [scanResults, setScanResults] = useState<Threat[]>([]);
  const [vulnResults, setVulnResults] = useState<Vulnerability[]>([]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const startScan = async () => {
    setScanStatus("scanning");
    setScanProgress(0);
    if (ipcRenderer && ipcRenderer.removeAllListeners) {
      ipcRenderer.removeAllListeners("scan-progress");
      ipcRenderer.on("scan-progress", (_event: any, progress: ScanProgress) => {
        setScanProgress(progress.percentage);
      });
    }
    setScanResults([]);

    try {
      const dir: string | null = await ipcRenderer.invoke("select-directory");
      if (!dir) {
        setScanStatus("protected");
        showToast("No directory selected", "warning");
        return;
      }

      const results: Threat[] | ErrorResponse = await ipcRenderer.invoke(
        "scan-directory",
        dir
      );

      setScanStatus("completed");

      if ("error" in results) {
        showToast(`Scan failed: ${results.error}`, "error");
      } else {
        setScanResults(results);
        showToast(
          results.length
            ? `${results.length} threat${results.length > 1 ? "s" : ""} found`
            : "Scan completed. No threats found!",
          results.length ? "warning" : "success"
        );
      }
    } catch (error: any) {
      setScanStatus("protected");
      showToast(`Scan error: ${error.message}`, "error");
    }
  };

  const checkVulnerabilities = async () => {
    setScanStatus("checking");
    setScanProgress(0);
    setVulnResults([]);

    try {
      const results: Vulnerability[] | ErrorResponse = await ipcRenderer.invoke(
        "check-vulnerabilities"
      );
      setScanStatus("completed");

      if ("error" in results) {
        showToast(`Vulnerability check failed: ${results.error}`, "error");
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
      setScanStatus("protected");
      showToast(`Vulnerability check error: ${error.message}`, "error");
    }
  };

  const showToast = (
    message: string,
    type: "success" | "warning" | "error"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleVulnerabilityClick = (vulnerability: Vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setShowVulnerabilityModal(true);
  };

  // Listen for progress updates from main process
  useEffect(() => {
    const handleProgress = (
      _event: Electron.IpcRendererEvent,
      progress: ScanProgress
    ) => {
      setScanProgress(progress.percentage);
    };

    ipcRenderer.on("scan-progress", handleProgress);

    return () => {
      ipcRenderer.removeListener("scan-progress", handleProgress);
    };
  }, []);

  return (
    <div
      className={`min-h-screen w-screen h-full ${
        theme === "light"
          ? "bg-gray-50 text-gray-900"
          : "bg-gray-900 text-gray-100"
      }`}
    >
      <Header theme={theme} toggleTheme={toggleTheme} />
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
        />
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "dashboard" && (
            <Dashboard
              theme={theme}
              scanStatus={scanStatus}
              scanProgress={scanProgress}
              startScan={startScan}
              checkVulnerabilities={checkVulnerabilities}
              showToast={showToast}
            />
          )}
          {activeTab === "vulnerability" && (
            <VulnerabilityReports
              theme={theme}
              checkVulnerabilities={checkVulnerabilities}
              handleVulnerabilityClick={handleVulnerabilityClick}
              // vulnerabilities={vulnResults} // Pass vulnResults to display
            />
          )}
          {activeTab === "scan-results" && (
            <ScanResults
              theme={theme}
              startScan={startScan}
              showToast={showToast}
              // scanResults={scanResults} // Pass scanResults to display
            />
          )}
          {activeTab === "settings" && <Settings theme={theme} />}
          {activeTab !== "dashboard" &&
            activeTab !== "vulnerability" &&
            activeTab !== "scan-results" &&
            activeTab !== "settings" && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <i className="fas fa-tools text-5xl mb-4 text-blue-600"></i>
                  <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
                  <p
                    className={`${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    This section is under development
                  </p>
                </div>
              </div>
            )}
        </main>
      </div>
      {showVulnerabilityModal && (
        <VulnerabilityModal
          theme={theme}
          vulnerability={selectedVulnerability}
          onClose={() => setShowVulnerabilityModal(false)}
        />
      )}
      <ToastNotification
        show={showNotification}
        message={notificationMessage}
        type={notificationType}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
};

export default App;
