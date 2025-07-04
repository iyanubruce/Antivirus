// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import "./App.css";

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scanStatus, setScanStatus] = useState("protected");
  const [scanProgress, setScanProgress] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "warning" | "error"
  >("success");
  const [showVulnerabilityModal, setShowVulnerabilityModal] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState<{
    id: string;
    software: string;
    description: string;
    cvss: number;
    impact: string;
    recommendation: string;
  } | null>(null);

  const handleVulnerabilityClick = (vulnerability: {
    id: string;
    software: string;
    description: string;
    cvss: number;
    impact: string;
    recommendation: string;
  }) => {
    setSelectedVulnerability(vulnerability);
    setShowVulnerabilityModal(true);
  };

  // Initialize chart
  useEffect(() => {
    const chartDom = document.getElementById("securityChart");
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        tooltip: {
          trigger: "item",
        },
        legend: {
          top: "5%",
          left: "center",
          textStyle: {
            color: theme === "light" ? "#111827" : "#F9FAFB",
          },
        },
        series: [
          {
            name: "Security Status",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: theme === "light" ? "#fff" : "#1F2937",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: 95, name: "Protected", itemStyle: { color: "#2563EB" } },
              { value: 5, name: "At Risk", itemStyle: { color: "#DC2626" } },
            ],
          },
        ],
      };
      myChart.setOption(option);
      window.addEventListener("resize", () => {
        myChart.resize();
      });
      return () => {
        myChart.dispose();
        window.removeEventListener("resize", () => {
          myChart.resize();
        });
      };
    }
  }, [theme]);
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const startScan = () => {
    setScanStatus("scanning");
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanStatus("completed");
          showToast("Scan completed. No threats found!", "success");
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };
  const checkVulnerabilities = () => {
    setScanStatus("checking");
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanStatus("completed");
          showToast(
            "Vulnerability check complete. 2 low-risk vulnerabilities found.",
            "warning"
          );
          return 100;
        }
        return prev + 4;
      });
    }, 150);
  };
  const showToast = (
    message: string,
    type: "success" | "warning" | "error"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };
  return (
    <div
      className={`min-h-screen w-full h-full ${
        theme === "light"
          ? "bg-gray-50 text-gray-900"
          : "bg-gray-900 text-gray-100"
      }`}
    >
      {/* Header */}
      <header
        className={`h-16 ${
          theme === "light"
            ? "bg-white border-b border-gray-200"
            : "bg-gray-800 border-b border-gray-700"
        } flex items-center justify-between px-6 shadow-sm`}
      >
        <div className="flex items-center">
          <i className="fas fa-shield-alt text-2xl text-blue-600 mr-3"></i>
          <h1 className="text-xl font-semibold">Electron Antivirus</h1>
        </div>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            theme === "light"
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-gray-700 hover:bg-gray-600"
          } cursor-pointer !rounded-button whitespace-nowrap`}
        >
          <i
            className={`fas ${
              theme === "light" ? "fa-moon" : "fa-sun"
            } text-lg`}
          ></i>
        </button>
      </header>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`w-60 ${
            theme === "light"
              ? "bg-white border-r border-gray-200"
              : "bg-gray-800 border-r border-gray-700"
          } flex-shrink-0`}
        >
          <nav className="py-4">
            <ul>
              {[
                {
                  id: "dashboard",
                  icon: "fa-tachometer-alt",
                  label: "Dashboard",
                },
                {
                  id: "scan-results",
                  icon: "fa-list-alt",
                  label: "Scan Results",
                },
                {
                  id: "vulnerability",
                  icon: "fa-bug",
                  label: "Vulnerability Reports",
                },
                { id: "settings", icon: "fa-cog", label: "Settings" },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full px-6 py-3 cursor-pointer whitespace-nowrap ${
                      activeTab === item.id
                        ? `${
                            theme === "light"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-blue-900 bg-opacity-30 text-blue-400"
                          }`
                        : `${
                            theme === "light"
                              ? "hover:bg-gray-100"
                              : "hover:bg-gray-700"
                          }`
                    }`}
                  >
                    <i
                      className={`fas ${item.icon} w-6 text-center ${
                        activeTab === item.id ? "text-blue-600" : ""
                      }`}
                    ></i>
                    <span className="ml-3">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "dashboard" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Security Dashboard
                </h2>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Monitor and manage your system's security status
                </p>
              </div>
              {/* Status Card */}
              <div
                className={`mb-8 p-6 rounded-lg ${
                  theme === "light"
                    ? "bg-white shadow-sm"
                    : "bg-gray-800 shadow-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">System Status</h3>
                    <p
                      className={`text-xl font-semibold ${
                        scanStatus === "protected" || scanStatus === "completed"
                          ? "text-green-600"
                          : scanStatus === "scanning" ||
                            scanStatus === "checking"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {scanStatus === "protected" && "Protected"}
                      {scanStatus === "scanning" && "Scanning in progress..."}
                      {scanStatus === "checking" &&
                        "Checking vulnerabilities..."}
                      {scanStatus === "completed" && "Scan completed"}
                    </p>
                  </div>
                  <div className="w-16 h-16 relative">
                    {scanStatus === "scanning" || scanStatus === "checking" ? (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="absolute inset-0">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              className="text-gray-200 stroke-current"
                              strokeWidth="8"
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                            ></circle>
                            <circle
                              className="text-blue-600 progress-ring stroke-current"
                              strokeWidth="8"
                              strokeLinecap="round"
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              strokeDasharray="251.2"
                              strokeDashoffset={
                                251.2 - (251.2 * scanProgress) / 100
                              }
                              style={{
                                transition: "stroke-dashoffset 0.5s ease 0s",
                                transform: "rotate(-90deg)",
                                transformOrigin: "50% 50%",
                              }}
                            ></circle>
                          </svg>
                        </div>
                        <span className="text-sm font-medium">
                          {scanProgress}%
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center ${
                          scanStatus === "protected" ||
                          scanStatus === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <i
                          className={`fas ${
                            scanStatus === "protected" ||
                            scanStatus === "completed"
                              ? "fa-check"
                              : "fa-exclamation-triangle"
                          } text-2xl`}
                        ></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div
                  className={`p-6 rounded-lg cursor-pointer transition-transform hover:scale-[1.02] ${
                    theme === "light"
                      ? "bg-white shadow-sm hover:shadow"
                      : "bg-gray-800 shadow-md hover:shadow-lg"
                  } !rounded-button whitespace-nowrap`}
                  onClick={startScan}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                        theme === "light"
                          ? "bg-blue-100"
                          : "bg-blue-900 bg-opacity-30"
                      }`}
                    >
                      <i className="fas fa-shield-alt text-3xl text-blue-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Scan Computer
                    </h3>
                    <p
                      className={`${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      Run a full system scan to detect viruses and malware
                    </p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap">
                      Start Scan
                    </button>
                  </div>
                </div>
                <div
                  className={`p-6 rounded-lg cursor-pointer transition-transform hover:scale-[1.02] ${
                    theme === "light"
                      ? "bg-white shadow-sm hover:shadow"
                      : "bg-gray-800 shadow-md hover:shadow-lg"
                  } !rounded-button whitespace-nowrap`}
                  onClick={checkVulnerabilities}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                        theme === "light"
                          ? "bg-blue-100"
                          : "bg-blue-900 bg-opacity-30"
                      }`}
                    >
                      <i className="fas fa-database text-3xl text-blue-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Check Vulnerabilities
                    </h3>
                    <p
                      className={`${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      Scan for software vulnerabilities against NVD database
                    </p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap">
                      Check Now
                    </button>
                  </div>
                </div>
              </div>
              {/* Security Stats */}
              <div
                className={`rounded-lg ${
                  theme === "light"
                    ? "bg-white shadow-sm"
                    : "bg-gray-800 shadow-md"
                } p-6`}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Security Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <div className="space-y-4">
                      <div
                        className={`p-4 rounded-lg ${
                          theme === "light" ? "bg-gray-50" : "bg-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            Last Scan
                          </span>
                          <span className="font-medium">Today, 10:45 AM</span>
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          theme === "light" ? "bg-gray-50" : "bg-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            Threats Blocked
                          </span>
                          <span className="font-medium">24</span>
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          theme === "light" ? "bg-gray-50" : "bg-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            Vulnerabilities
                          </span>
                          <span className="font-medium">
                            2{" "}
                            <span className="text-yellow-500 text-sm">
                              (Low Risk)
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div
                      id="securityChart"
                      style={{ width: "100%", height: "300px" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "vulnerability" ? (
            <div className="max-w-4xl mx-auto w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Vulnerability Reports
                </h2>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  View and analyze detected software vulnerabilities
                </p>
              </div>
              <div
                className={`rounded-lg ${
                  theme === "light"
                    ? "bg-white shadow-sm"
                    : "bg-gray-800 shadow-md"
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
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          Software Checked
                        </p>
                        <p className="font-semibold mt-1">156</p>
                      </div>
                      <div>
                        <p
                          className={`${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          Check Duration
                        </p>
                        <p className="font-semibold mt-1">3m 45s</p>
                      </div>
                      <div>
                        <p
                          className={`${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
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
                          theme === "light"
                            ? "border-gray-200"
                            : "border-gray-600"
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
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
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
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Cross-site scripting vulnerability in browser
                            rendering engine
                          </p>
                          <div className="mt-2 flex gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                theme === "light"
                                  ? "bg-gray-100"
                                  : "bg-gray-600"
                              }`}
                            >
                              CVSS: 3.5
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                theme === "light"
                                  ? "bg-gray-100"
                                  : "bg-gray-600"
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
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              } mt-1`}
                            >
                              PDF Reader v22.001.20117
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
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Memory corruption vulnerability in PDF parsing
                            module
                          </p>
                          <div className="mt-2 flex gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                theme === "light"
                                  ? "bg-gray-100"
                                  : "bg-gray-600"
                              }`}
                            >
                              CVSS: 3.2
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                theme === "light"
                                  ? "bg-gray-100"
                                  : "bg-gray-600"
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
                  theme === "light"
                    ? "bg-white shadow-sm"
                    : "bg-gray-800 shadow-md"
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
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
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
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
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
          ) : activeTab === "scan-results" ? (
            <div className="max-w-4xl mx-auto w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Scan Results</h2>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  View and manage detected threats from your last scan
                </p>
              </div>
              <div
                className={`rounded-lg ${
                  theme === "light"
                    ? "bg-white shadow-sm"
                    : "bg-gray-800 shadow-md"
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
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          Files Scanned
                        </p>
                        <p className="font-semibold mt-1">45,678</p>
                      </div>
                      <div>
                        <p
                          className={`${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          Scan Duration
                        </p>
                        <p className="font-semibold mt-1">5m 23s</p>
                      </div>
                      <div>
                        <p
                          className={`${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
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
                          theme === "light"
                            ? "border-gray-200"
                            : "border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Suspicious File</p>
                            <p
                              className={`text-sm ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              C:/Users/Downloads/setup.exe
                            </p>
                          </div>
                          <button className="text-red-600 hover:text-red-700 font-medium !rounded-button whitespace-nowrap">
                            <i className="fas fa-shield-alt mr-2"></i>Quarantine
                          </button>
                        </div>
                        <div className="mt-2">
                          <button
                            className={`text-sm ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            } hover:underline !rounded-button whitespace-nowrap`}
                          >
                            <i className="fas fa-info-circle mr-1"></i>View
                            Details
                          </button>
                        </div>
                      </div>
                      <div
                        className={`${
                          theme === "light" ? "bg-gray-50" : "bg-gray-700"
                        } p-4`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Malware Detected</p>
                            <p
                              className={`text-sm ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              C:/Users/AppData/Local/Temp/temp_file.dll
                            </p>
                          </div>
                          <button className="text-red-600 hover:text-red-700 font-medium !rounded-button whitespace-nowrap">
                            <i className="fas fa-shield-alt mr-2"></i>Quarantine
                          </button>
                        </div>
                        <div className="mt-2">
                          <button
                            className={`text-sm ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            } hover:underline !rounded-button whitespace-nowrap`}
                          >
                            <i className="fas fa-info-circle mr-1"></i>View
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-lg ${
                  theme === "light"
                    ? "bg-white shadow-sm"
                    : "bg-gray-800 shadow-md"
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
                              scan.threats === 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          ></i>
                          <div>
                            <p className="font-medium">{scan.date}</p>
                            <p
                              className={`text-sm ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {scan.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              scan.threats === 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {scan.status}
                          </p>
                          <p
                            className={`text-sm ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
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
          ) : activeTab === "settings" ? (
            <div className="max-w-4xl mx-auto w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Settings</h2>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Configure your antivirus preferences and scanning options
                </p>
              </div>
              <div
                className={`rounded-lg ${
                  theme === "light"
                    ? "bg-white shadow-sm"
                    : "bg-gray-800 shadow-md"
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
                  theme === "light"
                    ? "bg-white shadow-sm"
                    : "bg-gray-800 shadow-md"
                } p-6`}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Advanced Settings
                </h3>
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
          ) : (
            activeTab !== "dashboard" && (
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
            )
          )}
        </main>
      </div>

      {/* Vulnerability Modal */}
      {showVulnerabilityModal && selectedVulnerability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`max-w-2xl w-full mx-4 rounded-lg ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            } shadow-xl`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedVulnerability.id}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    } mt-1`}
                  >
                    {selectedVulnerability.software}
                  </p>
                </div>
                <button
                  onClick={() => setShowVulnerabilityModal(false)}
                  className={`p-2 rounded-full ${
                    theme === "light"
                      ? "hover:bg-gray-100"
                      : "hover:bg-gray-700"
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
                    {selectedVulnerability.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">CVSS Score</h4>
                  <div className="flex items-center">
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedVulnerability.cvss < 4
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedVulnerability.cvss < 7
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedVulnerability.cvss.toFixed(1)}
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
                    {selectedVulnerability.impact}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommended Actions</h4>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {selectedVulnerability.recommendation}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVulnerabilityModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 max-w-md transition-all duration-300 transform ${
          showNotification
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`rounded-lg shadow-lg p-4 flex items-start ${
            notificationType === "success"
              ? "bg-green-50 border-l-4 border-green-500"
              : notificationType === "warning"
              ? "bg-yellow-50 border-l-4 border-yellow-500"
              : "bg-red-50 border-l-4 border-red-500"
          }`}
        >
          <div className="flex-shrink-0 mr-3">
            <i
              className={`fas ${
                notificationType === "success"
                  ? "fa-check-circle text-green-500"
                  : notificationType === "warning"
                  ? "fa-exclamation-triangle text-yellow-500"
                  : "fa-times-circle text-red-500"
              } text-lg`}
            ></i>
          </div>
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                notificationType === "success"
                  ? "text-green-800"
                  : notificationType === "warning"
                  ? "text-yellow-800"
                  : "text-red-800"
              }`}
            >
              {notificationMessage}
            </p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-4 text-gray-400 hover:text-gray-500 cursor-pointer !rounded-button whitespace-nowrap"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
export default App;
