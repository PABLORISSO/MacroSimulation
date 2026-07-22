import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import "../styles/macro-module.css";
import "../styles/consumo.css";
import { getConsumo } from "../services/consumoService";

const fmt = (v, decimals = 1) =>
  v === null || v === undefined ? "—" : Number(v).toFixed(decimals);

const fmtPct = (v) => {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
};

function KpiCard({ label, value, foot, variant = "default" }) {
  const isNeg = typeof value === "string" && value.startsWith("-");
  const isPos = typeof value === "string" && value.startsWith("+");
  const numColor = isNeg ? "#dc2626" : isPos ? "#16a34a" : "#111827";
  const classes = ["module-kpi-card", "module-kpi-card--compact"];
  if (variant === "primary") classes.push("module-kpi-card--primary");
  if (variant === "auto") {
    if (isNeg) classes.push("module-kpi-card--negative");
    if (isPos) classes.push("module-kpi-card--positive");
  }

  return (
    <div className={classes.join(" ")}>
      <div className="module-kpi-label">{label}</div>
      <div className="module-kpi-value" style={variant === "primary" ? undefined : { color: numColor }}>
        {value}
      </div>
      <div className="module-kpi-foot">{foot}</div>
    </div>
  );
}

export default function ConsumoHogares() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getConsumo()
      .then(setData)
      .catch((e) => setError(e?.message || "Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

  const periodo = data?.periodo || "—";
  const creditoPct = data?.summary?.find((s) => s.id === "credito_consumo")?.value;
  const salarioPct = data?.summary?.find((s) => s.id === "salario_real")?.value;
  const creditoMill = data?.mediosDePago?.credito_mill;
  const creditoSerie = data?.mediosDePagoSerie || [];
  const salarioSerie = data?.salarioSerie || [];

  if (loading) return <p className="consumo-state">Cargando datos de hogares…</p>;
  if (error) return <p className="module-error">{error}</p>;

  const creditOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: creditoSerie.map((r) => r.fecha) },
    yAxis: { type: "value", name: "Millones ARS" },
    series: [
      {
        name: "Crédito (millones)",
        type: "line",
        smooth: true,
        data: creditoSerie.map((r) => r.credito_mill),
      },
    ],
  };

  const salarioOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: salarioSerie.map((r) => r.fecha) },
    yAxis: { type: "value", name: "Valor" },
    series: [
      {
        name: "Salario (BCRA)",
        type: "line",
        smooth: true,
        data: salarioSerie.map((r) => r.valor),
      },
    ],
  };

  return (
    <div className="macro-module consumo-main">
      <section className="module-chart-card consumo-card">
        <div className="consumo-section-head">
          <div>
            <span className="module-eyebrow">Hogares</span>
            <h2 className="consumo-section-title">Consumo de hogares</h2>
            <p className="consumo-section-subtitle">Datos clave sobre salario real y crédito al consumo — {periodo}</p>
          </div>
        </div>

        <div className="consumo-kpi-grid consumo-kpi-grid--3 consumo-kpi-grid--tight">
          <KpiCard label="Salario real" value={fmtPct(salarioPct)} foot="Var. interanual" variant="primary" />
          <KpiCard label="Crédito al consumo (real)" value={fmtPct(creditoPct)} foot="Crecimiento real" variant="auto" />
          <KpiCard label="Crédito (millones)" value={creditoMill ? `$${Number(creditoMill).toLocaleString('es-AR')}` : "—"} foot="Millones de ARS" />
        </div>

        <section className="module-chart-card consumo-card" style={{ marginTop: 16 }}>
          <div className="consumo-section-head">
            <div>
              <span className="module-eyebrow">Serie</span>
              <h2 className="consumo-section-title">Crédito al consumo — serie histórica</h2>
              <p className="consumo-section-subtitle">Crédito declarado en relevamiento de supermercados (millones ARS)</p>
            </div>
          </div>
          <ReactECharts option={creditOption} style={{ height: 320, width: "100%" }} />
          <div style={{ height: 16 }} />
          {salarioSerie.length ? (
            <ReactECharts option={salarioOption} style={{ height: 320, width: "100%" }} />
          ) : (
            <p style={{ padding: "1rem", color: "#999" }}>
              Serie de salario no disponible desde la API del backend. Para importarla, configure `BCRA_SALARIO_VARIABLE_ID` en el backend.
            </p>
          )}
        </section>
      </section>
    </div>
  );
}
