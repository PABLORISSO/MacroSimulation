import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

import { registerProvinciasMap } from "../../maps/registerProvinciasMap";
import { regionPorProvincia } from "../../maps/regiones";

function MapaInflacion() {
  const [data, setData] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const ok = registerProvinciasMap();
    setMapReady(ok);

    if (!ok) return;

    fetch("/inflacion_regiones.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudo cargar inflacion_regiones.json");
        }
        return res.json();
      })
      .then((json) => {
        console.log("DATA:", json);
        setData(json);
      })
      .catch((err) => console.error("Error cargando JSON:", err));
  }, []);

  if (!mapReady) {
    return <div>No se pudo cargar el mapa de provincias.</div>;
  }

  if (!data) {
    return <div>Cargando mapa...</div>;
  }

  const valoresPorRegion = data?.valores || data || {};

  const seriesData = Object.entries(regionPorProvincia).map(
    ([provincia, region]) => ({
      name: provincia,
      region,
      value: valoresPorRegion[region] ?? 0,
    })
  );

  const option = {
    backgroundColor: "#ffffff",

    title: {
      text: data?.mes
        ? `Inflación por región (${data.mes})`
        : "Inflación por región",
      left: "center",
      top: 12,
      textStyle: {
        color: "#1f1f1f",
        fontSize: 18,
        fontWeight: "bold",
      },
    },

    tooltip: {
      trigger: "item",
      backgroundColor: "#f8f8f8",
      borderColor: "#d9d9d9",
      borderWidth: 1,
      textStyle: {
        color: "#222222",
        fontSize: 13,
      },
      formatter: (params) => {
        const region = params.data?.region || "Sin región";
        const valor = params.data?.value ?? "Sin dato";

        return `
          <div style="min-width:140px;">
            <div style="font-weight:700; margin-bottom:4px;">${params.name}</div>
            <div>Región: ${region}</div>
            <div>Inflación: ${valor}%</div>
          </div>
        `;
      },
    },

    visualMap: {
      min: 0,
      max: 30,
      left: 20,
      bottom: 25,
      text: ["Alta", "Baja"],
      calculable: true,
      itemWidth: 14,
      itemHeight: 110,
      inRange: {
        color: ["#ededed", "#bcbcbc", "#7a7a7a"],
      },
      textStyle: {
        color: "#333333",
        fontSize: 12,
      },
    },

    series: [
      {
        name: "Inflación",
        type: "map",
        map: "argentina-provincias",
        nameProperty: "nombre",
        roam: true,
        zoom: 1.12,
        top: 55,

        // 🔥 ACA ESTA EL CAMBIO MAS IMPORTANTE
        label: {
          show: false,
        },

        itemStyle: {
          areaColor: "#f1f1f1",
          borderColor: "#4a4a4a",
          borderWidth: 0.9,
        },

        emphasis: {
          label: {
            show: false,
          },
          itemStyle: {
            areaColor: "#9a9a9a",
            borderColor: "#1f1f1f",
            borderWidth: 1.4,
          },
        },

        select: {
          label: {
            show: false,
          },
          itemStyle: {
            areaColor: "#8a8a8a",
          },
        },

        data: seriesData,
      },
    ],
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "10px 10px 0 10px",
      }}
    >
      <ReactECharts
        option={option}
        style={{ height: "78vh", minHeight: "680px", width: "100%" }}
      />
    </div>
  );
}

export default MapaInflacion;