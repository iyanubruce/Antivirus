import React, { useState } from "react";
const ipcRenderer = window.require
  ? window.require("electron").ipcRenderer
  : null;

interface SettingsProps {
  theme: "light" | "dark";
  selectDirectory: () => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  theme,
  selectDirectory,
}) => {
  const [scanDir, setScanDir] = useState<string>("C:/Users");

  const handleBrowse = async () => {
    try {
      const dir: string | null = await ipcRenderer.invoke("select-directory");
      if (dir) {
        setScanDir(dir);
        selectDirectory();
      }
    } catch (error: any) {
      console.error("Error selecting directory:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Settings</h2>
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
                value={scanDir}
                readOnly
                className={`flex-1 px-4 py-2 rounded-md ${
                  theme === "light"
                    ? "bg-gray-50 border border-gray-200"
                    : "bg-gray-700 border border-gray-600"
                }`}
              />
              <button
                onClick={handleBrowse}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap"
              >
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
