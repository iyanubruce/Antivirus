import { DashboardProps } from "./interfaces";
import { ProgressCircle, SecurityChart } from "./subcomponents";

const Dashboard: React.FC<DashboardProps> = ({
  theme,
  scanStatus,
  scanProgress,
  startScan,
  checkVulnerabilities,
  showToast,
}) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Security Dashboard</h2>
        <p
          className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
        >
          Monitor and manage your system's security status
        </p>
      </div>
      <div
        className={`mb-8 p-6 rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium mb-1">System Status</h3>
            <p
              className={`text-xl font-semibold ${
                scanStatus === "protected" || scanStatus === "completed"
                  ? "text-green-600"
                  : scanStatus === "scanning" || scanStatus === "checking"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {scanStatus === "protected" && "Protected"}
              {scanStatus === "scanning" && "Scanning in progress..."}
              {scanStatus === "checking" && "Checking vulnerabilities..."}
              {scanStatus === "completed" && "Scan completed"}
            </p>
          </div>
          <div className="w-16 h-16 relative">
            {scanStatus === "scanning" || scanStatus === "checking" ? (
              <ProgressCircle progress={scanProgress} />
            ) : (
              <div
                className={`w-full h-16 rounded-full flex items-center justify-center ${
                  scanStatus === "protected" || scanStatus === "completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <i
                  className={`fas ${
                    scanStatus === "protected" || scanStatus === "completed"
                      ? "fa-check"
                      : "fa-exclamation-triangle"
                  } text-2xl`}
                ></i>
              </div>
            )}
          </div>
        </div>
      </div>
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
                theme === "light" ? "bg-blue-100" : "bg-blue-900 bg-opacity-30"
              }`}
            >
              <i className="fas fa-shield-alt text-3xl text-blue-600"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Scan Computer</h3>
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
                theme === "light" ? "bg-blue-100" : "bg-blue-900 bg-opacity-30"
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
      <div
        className={`rounded-lg ${
          theme === "light" ? "bg-white shadow-sm" : "bg-gray-800 shadow-md"
        } p-6`}
      >
        <h3 className="text-xl font-semibold mb-4">Security Statistics</h3>
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
                      theme === "light" ? "text-gray-600" : "text-gray-300"
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
                      theme === "light" ? "text-gray-600" : "text-gray-300"
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
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    Vulnerabilities
                  </span>
                  <span className="font-medium">
                    2{" "}
                    <span className="text-yellow-500 text-sm">(Low Risk)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <SecurityChart theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
