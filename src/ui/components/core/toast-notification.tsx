import React from "react";

interface ToastNotificationProps {
  show: boolean;
  message: string;
  type: "success" | "warning" | "error";
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
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
