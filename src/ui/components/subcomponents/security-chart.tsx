import * as echarts from "echarts";
import { useEffect, useRef } from "react";

export interface SecurityChartProps {
  theme: "light" | "dark";
  totalFilesScanned: number;
  numberOfThreats: number;
}

const SecurityChart: React.FC<SecurityChartProps> = ({
  theme,
  totalFilesScanned,
  numberOfThreats,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // Cleanup function for the chart
    const initChart = () => {
      if (!chartRef.current) return;

      // Dispose of previous instance if exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }

      // Initialize new chart
      chartInstanceRef.current = echarts.init(chartRef.current);

      // Set options with current data
      const option = {
        animation: false,
        tooltip: { trigger: "item" },
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
            label: { show: false, position: "center" },
            emphasis: {
              label: { show: true, fontSize: 16, fontWeight: "bold" },
            },
            labelLine: { show: false },
            data: [
              {
                value: totalFilesScanned,
                name: "Protected",
                itemStyle: { color: "#2563EB" },
              },
              {
                value: numberOfThreats,
                name: "At Risk",
                itemStyle: { color: "#DC2626" },
              },
            ],
          },
        ],
      };

      chartInstanceRef.current.setOption(option);
    };

    // Initialize chart
    initChart();

    // Handle window resize
    const resizeHandler = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };

    window.addEventListener("resize", resizeHandler);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeHandler);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [theme, totalFilesScanned, numberOfThreats]); // 👈 KEY FIX: Added all dependencies

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }}></div>;
};

export default SecurityChart;
