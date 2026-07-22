import ReactECharts from "echarts-for-react";

function LineChart({ title, labels = [], data = [], series = [] }) {
  const chartSeries =
    Array.isArray(series) && series.length > 0
      ? series.map((s) => ({
          type: "line",
          smooth: true,
          showSymbol: false,
          ...s,
        }))
      : [
          {
            name: title || "Serie",
            data,
            type: "line",
            smooth: true,
            showSymbol: false,
          },
        ];

  const option = {
    title: {
      text: title,
    },
    tooltip: {
      trigger: "axis",
      formatter(params) {
        const date = params[0]?.axisValue ?? "";
        const lines = params
          .filter((p) => p.value != null)
          .map((p) => {
            const val = Number(p.value);
            const formatted = Number.isFinite(val)
              ? val.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "—";
            return `${p.marker} ${p.seriesName}&nbsp;&nbsp;<strong>${formatted}</strong>`;
          });
        return `<div style="font-size:13px"><strong>${date}</strong><br/>${lines.join("<br/>")}</div>`;
      },
    },
    legend: {
      top: 28,
    },
    grid: {
      left: 40,
      right: 20,
      bottom: 40,
      top: 70,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: labels,
    },
    yAxis: {
      type: "value",
    },
    series: chartSeries,
  };

  return <ReactECharts option={option} style={{ height: "var(--module-chart-height, 420px)" }} />;
}

export default LineChart;