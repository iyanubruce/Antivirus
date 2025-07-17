import React, { useState } from "react";

interface QuarantineProps {
  theme: "light" | "dark";
  showToast: (message: string, type: "success" | "warning" | "error") => void;
  threatName: string;
  unQuarantineFile: (filePath: string) => Promise<void>;
  filePath: string;
}

const Quarantine: React.FC<QuarantineProps> = ({
  theme,
  showToast,
  threatName,
  unQuarantineFile,
  filePath,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleConfirmUnquarantine = async () => {
    try {
      await unQuarantineFile(filePath);
      setIsModalOpen(false);
      showToast(`File ${threatName} un-quarantined successfully`, "success");
    } catch (error: any) {
      showToast(`Failed to unquarantine file: ${error.message}`, "error");
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
          <i className="fas fa-shield-alt mr-2"></i>Unquarantine
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
            <h3 className="text-xl font-semibold mb-2">Confirm Unquarantine</h3>
            <p
              className={`${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              } mb-4`}
            >
              Are you sure you want to unquarantine this file? The file will be
              restored to its original location.
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
                onClick={handleConfirmUnquarantine}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md !rounded-button whitespace-nowrap"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quarantine;
