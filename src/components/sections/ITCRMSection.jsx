import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { getITCRM } from "../../services/itcrmService";

function ITCRMSection() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ventana, setVentana] = useState("5y"); // "1y" | "3y" | "5y" | "all"

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getITCRM({ frecuencia: "mensual", limit: 2000 });
        setDatos(res?.datos ?? []);
      } catch (e) {
        setError("No se pudo cargar el ITCRM.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const datosFiltrados = useMemo(() => {
    if (!datos.length) return [];
    if (ventana === "all") return datos;

    const años = ventana === "1y" ? 1 : ventana === "3y" ? 3 : 5;
    const ultimo = new Date(datos[datos.length - 1].fecha);
    const limite = new Date(ultimo);
    limite.setFullYear(limite.getFullYear() - años);

    return datos.filter((d) => new Date(d.fecha) >= limite);
  }, [datos, ventana]);

  const option = useMemo(() => {
    if (!datosFiltrados.length) return {};

    const fechas = datosFiltrados.map((d) => d.fecha.slice(0, 7));
    const valores = datosFiltrados.map((d) => Number(d.valor.toFixed(2)));

    // Línea de referencia: promedio histórico de los datos filtrados
    const promedio =
      Math.round(
        (valores.reduce((a, b) => a + b, 0) / valores.length) * 100
      ) / 100;

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const p = params[0];
          return `${p.name}<br/>ITCRM: <b>${p.value}</b><br/><small style="color:#aaa">Base 17-Dic-2015=100</small>`;
        },
      },
      grid: { left: 60, right: 30, top: 40, bottom: 60 },
      xAxis: {
        type: "category",
        data: fechas,
        axisLabel: {
          color: "#ccc",
          rotate: 30,
          interval: Math.floor(fechas.length / 12),
          formatter: (v) => v,
        },
        axisLine: { lineStyle: { color: "#444" } },
      },
      yAxis: {
        type: "value",
        name: "Índice (17-Dic-2015=100)",
        nameTextStyle: { color: "#aaa", fontSize: 11 },
        axisLabel: { color: "#ccc" },
        splitLine: { lineStyle: { color: "#333" } },
      },
      series: [
        {
          name: "ITCRM",
          type: "line",
          data: valores,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#4ade80", width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(74,222,128,0.25)" },
                { offset: 1, color: "rgba(74,222,128,0.02)" },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: "none",
            data: [
              {
                yAxis: promedio,
                label: {
                  formatter: `Promedio: ${promedio}`,
                  color: "#facc15",
                  position: "insideEndTop",
                },
                lineStyle: { color: "#facc15", type: "dashed", width: 1.5 },
              },
              {
                yAxis: 100,
                label: {
                  formatter: "Base (100)",
                  color: "#94a3b8",
                  position: "insideEndTop",
                },
                lineStyle: { color: "#94a3b8", type: "dotted", width: 1 },
              },
            ],
          },
        },
      ],
    };
  }, [datosFiltrados]);

  const ultimoDato = datos[datos.length - 1];

  return (
    <div className="monetaria-section">
      <h2 className="monetaria-section-title">
        Tipo de Cambio Real Multilateral (ITCRM)
      </h2>
      <p className="monetaria-section-subtitle">
        Índice que mide la competitividad cambiaria de Argentina frente a sus
        principales socios comerciales. Base 17-Dic-2015 = 100. Un valor mayor a
        100 indica que el peso está más depreciado en términos reales que en la
        fecha base.
      </p>

      {ultimoDato && !loading && (
        <div className="monetaria-ultimo-dato" style={{ marginBottom: "1rem" }}>
          <span style={{ color: "#aaa", fontSize: "0.9rem" }}>
            Último dato:{" "}
          </span>
          <strong style={{ color: "#4ade80" }}>
            {Number(ultimoDato.valor).toFixed(2)}
          </strong>
          <span style={{ color: "#aaa", fontSize: "0.85rem", marginLeft: 8 }}>
            ({ultimoDato.fecha.slice(0, 7)})
          </span>
        </div>
      )}

      {/* Selector de ventana */}
      <div className="monetaria-filter-row" style={{ marginBottom: "0.75rem" }}>
        {["1y", "3y", "5y", "all"].map((v) => (
          <button
            key={v}
            className={`monetaria-filter-btn${ventana === v ? " active" : ""}`}
            onClick={() => setVentana(v)}
          >
            {v === "all" ? "Todo" : v.replace("y", " años")}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: "#aaa", padding: "2rem 0" }}>Cargando ITCRM…</p>
      )}
      {error && <p style={{ color: "#f87171" }}>{error}</p>}
      {!loading && !error && datosFiltrados.length > 0 && (
        <ReactECharts option={option} style={{ height: "var(--module-chart-height-sm, 340px)" }} />
      )}

      <p className="monetaria-fuente">
        Fuente: BCRA / datos.gob.ar — Serie 116.4_TCRZE_2015_D_36_4
      </p>
    </div>
  );
}

export default ITCRMSection;
