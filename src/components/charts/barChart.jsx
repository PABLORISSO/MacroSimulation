import React from "react";
import ReactECharts from "echarts-for-react";

function BarChart({
  title,
  labels,
  data,
  highlightColor = "#7a7a7a",
  lineSeries = [],
  extraBarSeries = [],
  seriesName = "Inflación mensual",
  horizontal = false,
  rightAxisLabelFormatter = "{value}%",
  rightAxisName = "",
  darkMode = false,
  variant = "default",
}) {
  const lastIndex = (() => {
    for (let i = data.length - 1; i >= 0; i -= 1) {
      const v = Number(data[i]);
      if (Number.isFinite(v)) return i;
    }
    return data.length - 1;
  })();
  const hasLineSeries = Array.isArray(lineSeries) && lineSeries.length > 0;
  const isInflationMain = variant === "inflation-main";
  const isInflationVariant = variant === "inflation" || isInflationMain;
  const palette = darkMode
    ? {
        barNeutral: "#334155",
        barBorder: "#475569",
        title: "#e2e8f0",
        tooltipBg: "#0f172a",
        tooltipBorder: "#334155",
        tooltipText: "#e2e8f0",
        legend: "#93a4b8",
        axisText: "#93a4b8",
        axisLine: "#334155",
        splitLine: "rgba(148, 163, 184, 0.25)",
        rightAxis: "#2ee6d6",
        label: "#e2e8f0",
        emphasisBar: "#64748b",
        emphasisBorder: "#93a4b8",
      }
    : {
        barNeutral: isInflationVariant ? "#dbeafe" : "#e2e8f0",
        barBorder: isInflationVariant ? "rgba(37, 99, 235, 0.16)" : "#cbd5e1",
        title: isInflationVariant ? "#0f172a" : "#0f172a",
        tooltipBg: isInflationVariant ? "rgba(255,255,255,0.98)" : "#ffffff",
        tooltipBorder: isInflationVariant ? "rgba(148,163,184,0.26)" : "#cbd5e1",
        tooltipText: "#0f172a",
        legend: isInflationVariant ? "#475569" : "#475569",
        axisText: isInflationVariant ? "#334155" : "#334155",
        axisLine: isInflationVariant ? "rgba(148,163,184,0.45)" : "#cbd5e1",
        splitLine: isInflationVariant ? "rgba(148,163,184,0.18)" : "#e2e8f0",
        rightAxis: isInflationVariant ? "#1d4ed8" : "#0b84a5",
        label: "#111827",
        emphasisBar: isInflationVariant ? "#3b82f6" : "#9a9a9a",
        emphasisBorder: isInflationVariant ? "#1d4ed8" : "#2f2f2f",
      };

  const formattedData = data.map((value, index) => {
    const isLast = index === lastIndex;

  const barColor = isInflationMain
  ? (isLast ? "#E53935" : "#0B1736")
  : (isLast ? highlightColor : palette.barNeutral);

return {
  value,
  itemStyle: {
    color: barColor,
    borderColor: "transparent",
    borderWidth: 0,
    shadowBlur: 0,
    borderRadius: isInflationMain ? [3, 3, 0, 0] : undefined,
  },
};
  });

  const formatInflationMonthLabel = (value) => {
    const text = String(value || "");
    const m = text.match(/^(\d{4})-(\d{2})/);
    if (!m) return text;

    const year = m[1];
    const monthIdx = Number(m[2]) - 1;
    const shortMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const mm = shortMonths[monthIdx] || m[2];
    return `${mm}\n${year}`;
  };

  const formatInflationMonthLong = (value) => {
    const text = String(value || "");
    const m = text.match(/^(\d{4})-(\d{2})/);
    if (!m) return text;

    const year = m[1];
    const monthIdx = Number(m[2]) - 1;
    const monthsLong = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const mm = monthsLong[monthIdx] || m[2];
    return `${mm} ${year}`;
  };
  const formatLabel = (v) => {
    if (v === null || v === undefined) return "";
    const num = typeof v === "object" ? v.value : v;
    const n = Number(num);
    if (!Number.isFinite(n)) return "";
    return `${n.toFixed(1).replace('.', ',')}%`;
  };

  const option = {
    backgroundColor: "transparent",

    title: {
      text: title,
      left: isInflationMain ? 2 : "center",
      top: isInflationMain ? 8 : (isInflationVariant ? 8 : 14),
      textStyle: {
        color: palette.title,
        fontSize: isInflationMain ? 18 : (isInflationVariant ? 16 : 18),
        fontWeight: isInflationMain ? 800 : (isInflationVariant ? 800 : "normal"),
        letterSpacing: isInflationVariant ? -0.3 : 0,
      },
    },

    tooltip: horizontal
      ? {
          trigger: 'item',
          backgroundColor: palette.tooltipBg,
          borderColor: palette.tooltipBorder,
          borderWidth: 1,
          textStyle: { color: palette.tooltipText },
          formatter: (params) => {
            const v = params?.value;
            return `${params?.name}: ${Number.isFinite(Number(v)) ? Number(v).toFixed(1).replace('.', ',') + '%' : 'Sin dato'}`;
          },
        }
      : {
          trigger: 'axis',
          backgroundColor: palette.tooltipBg,
          borderColor: palette.tooltipBorder,
          borderWidth: 1,
          textStyle: { color: palette.tooltipText },
          axisPointer: { type: isInflationMain ? 'line' : 'cross' },
          padding: isInflationMain ? [12, 14] : undefined,
          extraCssText: isInflationMain ? "box-shadow:0 14px 36px rgba(15,23,42,0.14); border-radius:12px;" : undefined,
          formatter: isInflationMain
            ? (params) => {
                if (!Array.isArray(params) || !params.length) return "";
                const monthRaw = params[0]?.axisValue;
                const monthLine = formatInflationMonthLong(monthRaw);
                const infl = params.find((p) => p?.seriesName === seriesName);
                const line = params.find((p) => p?.seriesName !== seriesName);
                const formatPct = (v) => {
                  const n = Number(v);
                  return Number.isFinite(n) ? `${n.toFixed(1).replace('.', ',')}%` : "N/D";
                };

                return `${monthLine}<br/><br/>${seriesName} ${formatPct(infl?.value)}<br/><br/>${line?.seriesName || "ITCRM"} ${formatPct(line?.value)}`;
              }
            : undefined,
        },

    legend: {
      top: isInflationMain ? 46 : (isInflationVariant ? 36 : 42),
      left: isInflationMain ? 2 : "center",
      data: isInflationMain
        ? [
            { name: seriesName, icon: 'roundRect' },
            ...lineSeries.map((s) => ({ name: s.name, icon: 'path://M2,6 L22,6' })),
          ]
        : [seriesName, ...extraBarSeries.map((s) => s.name), ...lineSeries.map((s) => s.name)].filter(Boolean),
      icon: isInflationMain ? 'roundRect' : undefined,
      itemWidth: isInflationMain ? 12 : undefined,
      itemHeight: isInflationMain ? 12 : undefined,
      itemGap: isInflationMain ? 18 : undefined,
      textStyle: {
        color: palette.legend,
        fontSize: isInflationMain ? 12 : (isInflationVariant ? 11 : 12),
      },
    },

    grid: horizontal
      ? { left: '18%', right: '6%', bottom: '6%', top: '12%' }
      : isInflationMain
      ? { left: '1.5%', right: '1.5%', bottom: '10%', top: '34%', containLabel: true }
      : isInflationVariant
      ? { left: '4%', right: '4%', bottom: '12%', top: '22%' }
      : { left: '8%', right: '5%', bottom: '18%', top: '28%' },

    xAxis: horizontal
      ? {
          type: 'value',
          axisLabel: { color: palette.axisText, formatter: '{value}%' },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: palette.splitLine, type: isInflationVariant ? 'solid' : 'dashed', width: 1 } },
        }
      : {
          type: 'category',
          data: labels,
          axisLabel: {
            rotate: isInflationVariant ? 0 : 45,
            color: palette.axisText,
            fontSize: isInflationMain ? 10 : (isInflationVariant ? 11 : 12),
            formatter: isInflationMain ? formatInflationMonthLabel : undefined,
            margin: isInflationMain ? 14 : 8,
            lineHeight: isInflationMain ? 14 : undefined,
          },
          axisLine: { show: !isInflationMain, lineStyle: { color: palette.axisLine, width: 1 } },
          axisTick: { show: !isInflationMain, lineStyle: { color: palette.axisLine } },
        },

    yAxis: horizontal
      ? {
          type: 'category',
          data: labels,
          axisLabel: { color: palette.axisText, formatter: (v) => v },
          axisLine: { show: false },
        }
      : hasLineSeries
      ? [
          {
            type: "value",
            min: isInflationMain ? 0 : undefined,
            max: isInflationMain ? 4 : undefined,
            interval: isInflationMain ? 1 : undefined,
            axisLabel: {
              color: palette.axisText,
              formatter: isInflationMain ? '{value}%' : "{value}%",
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: palette.splitLine,
                type: isInflationMain ? "solid" : "dashed",
                width: 1,
              },
            },
          },
          {
            type: "value",
            position: "right",
            name: isInflationMain ? "" : rightAxisName,
            nameTextStyle: {
              color: palette.rightAxis,
              fontSize: 11,
            },
            axisLabel: {
              color: palette.rightAxis,
              formatter: rightAxisLabelFormatter,
              show: !isInflationMain,
            },
            axisLine: {
              show: !isInflationMain,
              lineStyle: {
                color: palette.rightAxis,
              },
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
          },
        ]
        : {
            type: 'value',
            axisLabel: { color: palette.axisText, formatter: isInflationVariant ? '{value}%' : undefined },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: palette.splitLine, type: isInflationVariant ? 'solid' : 'dashed', width: 1 } },
          },

    series: [
      // primary bar
      {
        name: seriesName,
        type: 'bar',
        yAxisIndex: 0,
        data: formattedData,
        label: {
          show: isInflationVariant,
          position: horizontal ? 'right' : 'top',
          formatter: function (params) {
            const val = horizontal ? params?.value : params?.value;
            return formatLabel(val);
          },
          color: palette.label,
          fontWeight: 700,
          fontSize: isInflationMain ? 11 : undefined,
          distance: isInflationMain ? 6 : undefined,
        },
        barWidth: isInflationMain ? 42 : (extraBarSeries && extraBarSeries.length ? '40%' : '58%'),
        barCategoryGap: isInflationMain ? '16%' : undefined,
        emphasis: {
          itemStyle: {
            color: palette.emphasisBar,
            borderColor: palette.emphasisBorder,
            borderWidth: 2,
          },
        },
      },
      // extra bars (grouped)
      ...((extraBarSeries || []).map((serie, si) => ({
        name: serie.name,
        type: 'bar',
        yAxisIndex: 0,
        data: horizontal ? (serie.data || []).map((v) => (v === null || v === undefined ? { value: null } : Number(v))) : (serie.data || []).map((v) => ({ value: v, itemStyle: serie.itemStyle || {} })),
        barWidth: '40%',
        barGap: si === 0 ? '0%' : '-50%',
      })) ),
      // optional line series
      ...lineSeries.map((serie) => ({
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: typeof serie.yAxisIndex === "number" ? serie.yAxisIndex : 1,
        z: 20,
        lineStyle: {
          width: isInflationMain ? 1.8 : (isInflationVariant ? 2.4 : 2.2),
          color: isInflationMain ? "#6EA8FE" : (isInflationVariant ? "#2563eb" : "#1d4ed8"),
          ...(serie.lineStyle || {}),
        },
        symbol: isInflationMain ? 'circle' : serie.symbol,
        symbolSize: isInflationMain ? 5 : serie.symbolSize,
        ...serie,
      })),
    ],
    animation: true,
    animationDuration: isInflationMain ? 780 : 520,
    animationEasing: 'cubicOut',
    animationDurationUpdate: isInflationMain ? 520 : 360,
  };

  const getAriaLabel = () => {
    const dataCount = Array.isArray(data) ? data.length : 0;
    const type = horizontal ? 'horizontal' : 'vertical';
    return `Gráfico de barras ${type} titulado "${title}" con ${dataCount} elementos de datos`;
  };

  return (
    <div style={{ padding: "8px 0" }} role="img" aria-label={getAriaLabel()}>
      <ReactECharts
        option={option}
        style={{
          height: isInflationMain
            ? "510px"
            : (isInflationVariant ? "var(--module-chart-height-lg, 600px)" : "var(--module-chart-height, 420px)"),
          width: "100%",
        }}
      />
    </div>
  );
}

export default React.memo(BarChart, (prevProps, nextProps) => {
  // Custom comparison: only re-render if critical props change
  return (
    prevProps.title === nextProps.title &&
    JSON.stringify(prevProps.labels) === JSON.stringify(nextProps.labels) &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    prevProps.highlightColor === nextProps.highlightColor &&
    prevProps.horizontal === nextProps.horizontal
  );
});