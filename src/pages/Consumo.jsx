import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import "../styles/dashboard.css";
import "../styles/macro-module.css";
import "../styles/consumo.css";
import { getConsumo } from "../services/consumoService";
import ConsumoHogares from "../components/ConsumoHogares";

const fmt = (v, decimals = 1) =>
  v === null || v === undefined ? "—" : Number(v).toFixed(decimals);

const fmtPct = (v) => {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
};

const fmtMill = (v) => {
  if (v === null || v === undefined) return "—";
  return `$${Number(v).toLocaleString("es-AR", { maximumFractionDigits: 0 })} M`;
};

const fmtPesos = (v) => {
  if (v === null || v === undefined) return "—";
  return `$${Math.round(Number(v)).toLocaleString("es-AR")}`;
};

function KpiCard({ label, value, foot, color, variant = "default" }) {
  const isNeg = typeof value === "string" && value.startsWith("-");
  const isPos = typeof value === "string" && value.startsWith("+");
  const numColor = color || (isNeg ? "#dc2626" : isPos ? "#16a34a" : "#111827");
  const classes = ["module-kpi-card", "module-kpi-card--compact"];

  if (variant === "primary") {
    classes.push("module-kpi-card--primary");
  } else if (variant === "auto") {
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

function Consumo() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getConsumo()
      .then(setData)
      .catch((err) => setError(err?.message || "Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

  const periodo = data?.periodo || "—";
  const analysis = data?.analysis || {};
  const mediosDePago = data?.mediosDePago || {};
  const canalDeVenta = data?.canalDeVenta || {};
  const bocas = data?.bocas || {};
  const serie = data?.serieSupermercados || [];
  const resumenAcumulada = data?.summary?.find((s) => s.id === "var_acumulada")?.value;

  return (
    <div className="dashboard-page consumo-page">
      <div className="dashboard-container consumo-container">
        <article className="macro-module macro-module--consumo">
          <header className="module-header consumo-header-page">
            <div className="module-header-main">
              <p className="module-eyebrow">Consumo</p>
              <h1 className="module-title">Consumo</h1>
              <p className="module-summary consumo-subtitle">
                Encuesta de Supermercados del INDEC. Período: <strong>{periodo}</strong>
                {data?.updatedAt && ` — actualizado ${data.updatedAt}`}
              </p>
            </div>
          </header>

          <div className="consumo-tabs">
            {[
              ["overview", "Resumen ejecutivo"],
              ["hogares", "Hogares"],
              ["canal", "Canal y medios de pago"],
              ["serie", "Serie histórica"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTab(id)}
                className={`consumo-tab ${selectedTab === id ? "active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading && <p className="consumo-state">Cargando…</p>}
          {!loading && error && <p className="module-error">{error}</p>}

          {!loading && !error && selectedTab === "overview" && (
            <div className="macro-module consumo-main">
              <section className="consumo-kpi-grid consumo-kpi-grid--4">
              <KpiCard
                label="Interanual"
                value={fmtPct(data?.ultimoDato?.var_yoy)}
                foot="Vs. mismo mes del año previo"
                variant="primary"
              />
              <KpiCard
                label="Intermensual"
                value={fmtPct(analysis.aceleracion_mensual ?? data?.ultimoDato?.var_mom_desest)}
                foot="Serie desestacionalizada"
                variant="auto"
              />
              <KpiCard
                label="Acumulada"
                value={fmtPct(resumenAcumulada)}
                foot={`Acumulado ${periodo?.slice(0, 4)}`}
                variant="auto"
              />
              <KpiCard
                label="Índice"
                value={fmt(data?.ultimoDato?.indice_orig_base2017)}
                foot="Serie original base 2017=100"
              />
              </section>

              <section className="module-chart-card consumo-card consumo-card--compact">
              <div className="consumo-section-head">
                <div>
                  <span className="module-eyebrow">Nivel general</span>
                  <h2 className="consumo-section-title">Ventas a precios constantes</h2>
                  <p className="consumo-section-subtitle">
                    Serie original, desestacionalizada y tendencia-ciclo del índice de ventas reales de supermercados.
                  </p>
                </div>
              </div>

              <ReactECharts
                option={{
                  backgroundColor: "transparent",
                  tooltip: {
                    trigger: "axis",
                    backgroundColor: "#0f172a",
                    borderWidth: 0,
                    padding: 12,
                    textStyle: { color: "#ffffff", fontSize: 13 },
                    axisPointer: {
                      type: "line",
                      lineStyle: { color: "rgba(15,23,42,0.22)", width: 1 },
                    },
                    formatter(params) {
                      const date = params[0]?.axisValue ?? "";
                      const lines = params
                        .filter((p) => p.value != null)
                        .map((p) => `${p.marker} ${p.seriesName}&nbsp;&nbsp;<strong>${Number(p.value).toFixed(1)}</strong>`);
                      return `<div style="font-size:13px"><strong>${date}</strong><br/>${lines.join("<br/>")}</div>`;
                    },
                  },
                  legend: {
                    top: 18,
                    right: 0,
                    itemWidth: 18,
                    itemHeight: 8,
                    data: ["Serie original", "Serie desestacionalizada", "Tendencia-ciclo"],
                    textStyle: { color: "#64748b", fontSize: 13, fontWeight: 600 },
                  },
                  grid: { left: 46, right: 24, top: 84, bottom: 42 },
                  xAxis: {
                    type: "category",
                    data: serie.map((r) => r.fecha),
                    boundaryGap: false,
                    axisTick: { show: false },
                    axisLine: { lineStyle: { color: "rgba(148,163,184,0.28)" } },
                    axisLabel: {
                      color: "#64748b",
                      fontSize: 11,
                      interval: 11,
                      formatter: (value) => String(value).slice(0, 4),
                    },
                  },
                  yAxis: {
                    type: "value",
                    min: 70,
                    axisTick: { show: false },
                    axisLine: { show: false },
                    axisLabel: { show: false },
                    splitLine: {
                      lineStyle: {
                        color: "rgba(148,163,184,0.09)",
                        type: "dashed",
                      },
                    },
                  },
                  series: [
                    {
                      name: "Serie original",
                      type: "line",
                      smooth: false,
                      showSymbol: false,
                      data: serie.map((r) => r.indice_orig),
                      lineStyle: { width: 2, color: "rgba(100,116,139,0.16)" },
                      areaStyle: { color: "rgba(100,116,139,0.02)" },
                    },
                    {
                      name: "Serie desestacionalizada",
                      type: "line",
                      smooth: true,
                      showSymbol: false,
                      data: serie.map((r) => r.indice_desest),
                      lineStyle: { width: 2.5, color: "rgba(37,99,235,0.68)" },
                    },
                    {
                      name: "Tendencia-ciclo",
                      type: "line",
                      smooth: true,
                      showSymbol: false,
                      data: serie.map((r) => r.indice_tend),
                      lineStyle: { width: 5.5, color: "#020617" },
                    },
                  ],
                }}
                style={{ height: 420, width: "100%" }}
              />

              <div className="module-insight consumo-insight">
                <span className="module-insight-label">Lectura rápida</span>
                <p>
                  {analysis.diagnostico && (
                    <>
                      Diagnóstico actual: <strong>{analysis.diagnostico}</strong>. 
                    </>
                  )}
                  {analysis.promedio_3m_mom_desest !== null && analysis.promedio_3m_mom_desest !== undefined && (
                    <>
                      Promedio móvil 3 meses desestacionalizado: <strong>{fmt(analysis.promedio_3m_mom_desest, 2)}%</strong>. 
                    </>
                  )}
                  Base 2017=100. Fuente: INDEC.
                </p>
              </div>
              </section>

              <section className="module-chart-card consumo-card">
              <div className="consumo-section-head">
                <div>
                  <span className="module-eyebrow">Operación</span>
                  <h2 className="consumo-section-title">Indicadores operativos del mes</h2>
                  <p className="consumo-section-subtitle">
                    Ticket promedio, ventas por superficie y red comercial relevada para {periodo}.
                  </p>
                </div>
              </div>
              <div className="consumo-kpi-grid consumo-kpi-grid--3 consumo-kpi-grid--tight">
                <KpiCard label="Ticket promedio" value={fmtPesos(bocas.ticket_promedio)} foot="Pesos corrientes" />
                <KpiCard label="Ventas / m²" value={fmtPesos(bocas.ventas_m2)} foot="Pesos corrientes" />
                <KpiCard label="Bocas de expendio" value={bocas.bocas?.toLocaleString("es-AR") || "—"} foot="Unidades relevadas" />
              </div>
              </section>
            </div>
          )}

          {!loading && !error && selectedTab === "canal" && (
            <div className="macro-module consumo-main">
              <section className="module-chart-card consumo-card">
              <div className="consumo-section-head">
                <div>
                  <span className="module-eyebrow">Medios de pago</span>
                  <h2 className="consumo-section-title">Ventas corrientes por instrumento</h2>
                  <p className="consumo-section-subtitle">
                    Distribución del gasto en supermercados según medio de pago declarado por el relevamiento.
                  </p>
                </div>
              </div>
              <div className="consumo-kpi-grid consumo-kpi-grid--4 consumo-kpi-grid--tight">
                <KpiCard label="Efectivo" value={fmtMill(mediosDePago.efectivo_mill)} foot="Millones de pesos" />
                <KpiCard label="Débito" value={fmtMill(mediosDePago.debito_mill)} foot="Millones de pesos" />
                <KpiCard label="Crédito" value={fmtMill(mediosDePago.credito_mill)} foot="Millones de pesos" />
                <KpiCard label="Otros medios" value={fmtMill(mediosDePago.otros_mill)} foot="QR y billeteras" />
              </div>
              </section>

              <section className="module-chart-card consumo-card">
              <div className="consumo-section-head">
                <div>
                  <span className="module-eyebrow">Canales</span>
                  <h2 className="consumo-section-title">Ventas corrientes por canal</h2>
                  <p className="consumo-section-subtitle">
                    Apertura entre salón de ventas y canales online para el período más reciente.
                  </p>
                </div>
              </div>
              <div className="consumo-kpi-grid consumo-kpi-grid--2 consumo-kpi-grid--tight">
                <KpiCard label="Salón de ventas" value={fmtMill(canalDeVenta.salon_ventas_mill)} foot="Venta presencial" />
                <KpiCard label="Canales online" value={fmtMill(canalDeVenta.online_mill)} foot="E-commerce y delivery" />
              </div>
              </section>
            </div>
          )}

          {!loading && !error && selectedTab === "hogares" && (
            <div className="macro-module consumo-main">
              <ConsumoHogares />
            </div>
          )}

          {!loading && !error && selectedTab === "serie" && (
            <div className="macro-module consumo-main">
              <section className="module-chart-card consumo-card">
              <div className="consumo-section-head">
                <div>
                  <span className="module-eyebrow">Serie histórica</span>
                  <h2 className="consumo-section-title">Cuadro 1 desde enero de 2017</h2>
                  <p className="consumo-section-subtitle">
                    Evolución mensual del índice de ventas reales con variaciones interanuales y desestacionalizadas.
                  </p>
                </div>
              </div>
              <div className="consumo-table-wrap">
                <table className="consumo-table">
                  <thead>
                    <tr>
                      {["Período", "Índice orig.", "Var. YoY", "Acum.", "Índice desest.", "Var. MoM desest."].map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {serie.slice().reverse().map((row, index) => (
                      <tr key={row.fecha} className={index % 2 === 0 ? "" : "alt"}>
                        <td className="consumo-cell-period">{row.fecha}</td>
                        <td>{fmt(row.indice_orig)}</td>
                        <td className={row.var_yoy < 0 ? "negative" : "positive"}>{fmtPct(row.var_yoy)}</td>
                        <td className={row.var_acum < 0 ? "negative" : "positive"}>{fmtPct(row.var_acum)}</td>
                        <td>{fmt(row.indice_desest)}</td>
                        <td className={row.var_mom_desest < 0 ? "negative" : "positive"}>{fmtPct(row.var_mom_desest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="consumo-footnote">Fuente: INDEC — Encuesta de Supermercados, Cuadro 1. Base 2017=100.</p>
              </section>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

export default Consumo;