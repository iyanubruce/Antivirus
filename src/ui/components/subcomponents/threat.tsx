import React, { useState } from "react";
export interface ThreatProps {
  theme: "light" | "dark";
  threatName: string;
  quarantineFile: (filePath: string) => Promise<void>;
  filePath: string;
  showToast: (message: string, type: "success" | "warning" | "error") => void;
}
export const ThreatComponent: React.FC<ThreatProps> = ({
  theme,
  showToast,
  threatName,
  quarantineFile,
  filePath,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleConfirmQuarantine = async () => {
    try {
      console.log("Quarantining file:", filePath); // Debug log
      await quarantineFile(filePath);
      setIsModalOpen(false);
      showToast(`File ${threatName} quarantined successfully`, "success");
    } catch (error: any) {
      showToast(`Failed to quarantine file: ${error.message}`, "error");
      console.error("Quarantine error:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className={`${
        theme === "light" ? "bg-gray-50" : "bg-gray-700"
      } p-4 border rounded-lg ${
        theme === "light" ? "border-gray-200" : "border-gray-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{threatName}</p>
          <p
            className={`text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {filePath}
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="text-red-600 hover:text-red-700 font-medium !rounded-button whitespace-nowrap"
        >
          <i className="fas fa-shield-alt mr-2"></i>Quarantine
        </button>
      </div>
      <div className="mt-2">
        <button
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          } hover:underline !rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-info-circle mr-1"></i>View Details
        </button>
      </div>
      {isModalOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          <div
            className={`${
              theme === "light" ? "bg-white" : "bg-gray-800"
            } max-w-md w-full mx-4 rounded-lg shadow-xl p-6`}
          >
            <h3 className="text-xl font-semibold mb-2">Confirm Quarantine</h3>
            <p
              className={`${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              } mb-4`}
            >
              Are you sure you want to quarantine this file? The file will be
              isolated and become inaccessible to prevent potential threats.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className={`${
                  theme === "light"
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-gray-700 hover:bg-gray-600"
                } px-4 py-2 rounded-md !rounded-button whitespace-nowrap`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmQuarantine}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md !rounded-button whitespace-nowrap"
              >
                Confirm Quarantine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatComponent;
