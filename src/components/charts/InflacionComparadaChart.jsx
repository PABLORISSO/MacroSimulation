import React from "react";
import ReactECharts from "echarts-for-react";
import inflacionComparada from "../../data/inflacionComparada.json";

function InflacionComparadaChart() {
  const ultimo = inflacionComparada.fechas.length - 1;

  const armarSerie = (nombre, data) => ({
    name: nombre,
    type: "line",
    data,
    smooth: true,
    symbol: "circle",
    symbolSize: 8,
    lineStyle: {
      width: 2.5
    },
    emphasis: {
      focus: "series"
    },
    markPoint: {
      symbolSize: 42,
      data: [
        {
          coord: [inflacionComparada.fechas[ultimo], data[ultimo]],
          value: data[ultimo]
        }
      ],
      label: {
        formatter: ({ value }) => `${value}%`
      }
    }
  });

  const option = {
    backgroundColor: "#ffffff",
    title: {
      text: "Inflación mensual",
      subtext: "Nivel general, núcleo y regulados",
      left: "center",
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222"
      },
      subtextStyle: {
        color: "#666"
      }
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => `${value}%`
    },
    legend: {
      top: 55
    },
    grid: {
      left: "8%",
      right: "5%",
      top: 95,
      bottom: 55
    },
    xAxis: {
      type: "category",
      data: inflacionComparada.fechas,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%"
      },
      splitLine: {
        show: true
      }
    },
    series: [
      armarSerie("Nivel general", inflacionComparada.nivel_general),
      armarSerie("Núcleo", inflacionComparada.nucleo),
      armarSerie("Regulados", inflacionComparada.regulados)
    ]
  };

  return (
    <div style={{ width: "100%" }}>
      <ReactECharts option={option} style={{ height: "460px", width: "100%" }} />
    </div>
  );
}

export default InflacionComparadaChart;