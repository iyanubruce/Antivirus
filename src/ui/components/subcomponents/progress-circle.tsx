import { ProgressCircleProps } from "../interfaces";

const ProgressCircle: React.FC<ProgressCircleProps> = ({ progress }) => {
  return (
    <div className="w-16 h-16 relative">
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
              strokeDashoffset={251.2 - (251.2 * progress) / 100}
              style={{
                transition: "stroke-dashoffset 0.5s ease 0s",
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
              }}
            ></circle>
          </svg>
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
    </div>
  );
};

export default ProgressCircle;
