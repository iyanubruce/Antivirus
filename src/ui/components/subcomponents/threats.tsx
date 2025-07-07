import React from "react";
import { ThreatProps } from "../interfaces";
const Threats: React.FC<ThreatProps> = ({
  theme,
  showToast,
  threatName,
  filePath,
}) => {
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
            {/* C:/Users/Downloads/setup.exe */}
          </p>
        </div>

        <button
          onClick={() => {
            const modal = document.createElement("div");
            modal.className = `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`;
            modal.innerHTML = `
      <div class="${
        theme === "light" ? "bg-white" : "bg-gray-800"
      } max-w-md w-full mx-4 rounded-lg shadow-xl p-6">
        <h3 class="text-xl font-semibold mb-2">Confirm Quarantine</h3>
        <p class="${
          theme === "light" ? "text-gray-600" : "text-gray-400"
        } mb-4">
          Are you sure you want to quarantine this file? The file will be isolated and become inaccessible to prevent potential threats.
        </p>
        <div class="flex justify-end space-x-3">
          <button id="cancelQuarantine" class="${
            theme === "light"
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-gray-700 hover:bg-gray-600"
          } px-4 py-2 rounded-md !rounded-button whitespace-nowrap">Cancel</button>
          <button id="confirmQuarantine" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md !rounded-button whitespace-nowrap">Confirm Quarantine</button>
        </div>
      </div>
    `;
            document.body.appendChild(modal);

            const handleQuarantine = () => {
              modal.remove();
              showToast("File has been successfully quarantined", "success");
            };

            const handleCancel = () => {
              modal.remove();
            };

            document
              .getElementById("confirmQuarantine")
              ?.addEventListener("click", handleQuarantine);
            document
              .getElementById("cancelQuarantine")
              ?.addEventListener("click", handleCancel);
          }}
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
    </div>
  );
};

export default Threats;
