import * as echarts from "echarts";
import { useEffect } from "react";

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
  useEffect(() => {
    const chartDom = document.getElementById("securityChart");
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        tooltip: { trigger: "item" },
        legend: {
          top: "5%",
          left: "center",
          textStyle: { color: theme === "light" ? "#111827" : "#F9FAFB" },
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
                value: totalFilesScanned - numberOfThreats,
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
      myChart.setOption(option);
      window.addEventListener("resize", () => myChart.resize());
      return () => {
        myChart.dispose();
        window.removeEventListener("resize", () => myChart.resize());
      };
    }
  }, [theme]);

  return (
    <div id="securityChart" style={{ width: "100%", height: "300px" }}></div>
  );
};

export default SecurityChart;
