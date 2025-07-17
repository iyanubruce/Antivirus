import React, { useState, useEffect } from "react";
import { Header, Sidebar, Dashboard } from "./components/layout";
import {
  ScanResults,
  VulnerabilityReports,
  // Settings,
  VulnerabilityModal,
  ToastNotification,
} from "./components/core";
import { useScan, useVulnerabilities, useQuarantine } from "./hooks";
import { Vulnerability } from "./types/interfaces";
import "./App.css";

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const showToast = (
    message: string,
    type: "success" | "warning" | "error"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };
  const {
    scanStatus,
    scanProgress,
    filesScanned,
    scanDuration,
    scanResults,
    startScan,
    lastScanTime,
    numberOfPreviousThreats,
    setScanResults,
  } = useScan(showToast);
  const { vulnResults, checkVulnerabilities, vulnerabilitiesLoading } =
    useVulnerabilities(showToast);
  const highestCvssVuln = vulnResults.reduce((max, vuln) => {
    return (vuln.cvssScore || 0) > (max.cvssScore || 0) ? vuln : max;
  }, {} as Vulnerability);

  const {
    quarantineRecords,
    quarantineFile,
    unquarantineFile,
    fetchQuarantineRecords,
  } = useQuarantine();

  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [notificationType, setNotificationType] = useState<
    "success" | "warning" | "error"
  >("success");
  const [showVulnerabilityModal, setShowVulnerabilityModal] =
    useState<boolean>(false);
  const [selectedVulnerability, setSelectedVulnerability] =
    useState<Vulnerability | null>(null);

  const handleVulnerabilityClick = (vulnerability: Vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setShowVulnerabilityModal(true);
  };

  useEffect(() => {
    fetchQuarantineRecords().finally(() => setIsLoading(false));
  }, [fetchQuarantineRecords]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const [showLoading, setShowLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen bg-gray-50 dark:bg-gray-900">
        <div className="neon-loader">
          <div className="neon-loader-ring"></div>
        </div>
      </div>
    );
  }

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
              vulnerabilityDetails={{
                numberOfVulnerabilities: vulnResults.length + 1,
                threatLevel: highestCvssVuln.severity,
                cvsScore: highestCvssVuln.cvssScore,
              }}
              totalFilesScanned={filesScanned}
              numberOfThreats={numberOfPreviousThreats}
              lastScanTime={lastScanTime}
              startScan={startScan}
              checkVulnerabilities={checkVulnerabilities}
              showToast={showToast}
            />
          )}
          {activeTab === "vulnerability" && (
            <VulnerabilityReports
              loading={vulnerabilitiesLoading}
              theme={theme}
              vulnerabilities={vulnResults}
              checkVulnerabilities={checkVulnerabilities}
              handleVulnerabilityClick={handleVulnerabilityClick}
            />
          )}
          {activeTab === "scan-results" && (
            <ScanResults
              setScanResults={setScanResults}
              theme={theme}
              totalFiles={filesScanned}
              scanDuration={scanDuration}
              quarantineFile={quarantineFile}
              unquarantineFile={unquarantineFile}
              quarantineRecords={quarantineRecords}
              startScan={startScan}
              showToast={showToast}
              scanResults={scanResults}
            />
          )}
          {/* {activeTab === "settings" && (
            <Settings theme={theme} selectDirectory={startScan} />
          )} */}
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
