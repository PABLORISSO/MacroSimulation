import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";
import BarChart from "../charts/barChart.jsx";
import ErrorBoundary from "../ErrorBoundary.jsx";
import {
  getInflacion,
  getInflacionCategorias,
  getInflacionRegionesInteranual,
  getInteranualNivelGeneralConceptos,
} from "../../services/inflationService";
import { getITCRM } from "../../services/itcrmService";
import "../../styles/macro-module.css";


function formatPeriodo(fecha) {
  const s = String(fecha || "").trim();
  if (!s) return "";
  if (/^\d{6}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
  return s;
}

function InflationSection() {
  const [inflacion, setInflacion] = useState(null);
  const [itcrm, setItcrm] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getInflacion()
      .then(setInflacion)
      .catch(() => setError("No se pudo cargar inflación."));

    getITCRM({ frecuencia: "mensual" })
      .then((payload) => {
        const datos = Array.isArray(payload?.datos) ? payload.datos : [];
        setItcrm(datos);
      })
      .catch(() => setItcrm([]));
  }, []);

  if (error) return <div role="alert">Error: {error}</div>;
  if (!inflacion) return <div role="status">Cargando datos de inflación...</div>;

  const allLabels = inflacion?.datos?.map((d) => d.fecha.slice(0, 7)) || [];
  const allData = inflacion?.datos?.map((d) => d.inflacionMensual) || [];

  const allInteranual = (inflacion?.datos || []).map((d, idx, arr) => {
    const fromApi = Number(d?.inflacionInteranual);
    if (Number.isFinite(fromApi)) return Number(fromApi.toFixed(2));
    if (idx < 11) return null;

    let factor = 1;
    for (let i = idx - 11; i <= idx; i += 1) {
      const mensual = Number(arr[i]?.inflacionMensual);
      if (!Number.isFinite(mensual)) return null;
      factor *= 1 + mensual / 100;
    }

    return Number(((factor - 1) * 100).toFixed(2));
  });

  const VISIBLE = 12;
  const start = Math.max(0, allLabels.length - VISIBLE);

  const labelsMensuales = allLabels.slice(start);
  const dataMensual = allData.slice(start);
  const interanual = allInteranual.slice(start);

  const primerMesVisible = labelsMensuales[0] || null;

  const itcrmMensual = (Array.isArray(itcrm) ? itcrm : [])
    .map((item) => ({
      fecha: String(item?.fecha || "").slice(0, 10),
      valor: Number(item?.valor),
    }))
    .filter((d) => d.fecha && Number.isFinite(d.valor));

  const itcrmMensualMap = new Map();

  for (const d of itcrmMensual) {
    const mes = d.fecha.slice(0, 7);
    if (primerMesVisible && mes < primerMesVisible) continue;
    itcrmMensualMap.set(mes, Number(d.valor.toFixed(2)));
  }

  const labels = labelsMensuales;

  const inflacionMensualMap = new Map(
    labelsMensuales.map((mes, idx) => [mes, Number(dataMensual[idx])])
  );

  const data = labels.map((mes) => {
    const v = inflacionMensualMap.get(mes);
    return Number.isFinite(v) ? v : null;
  });

  const itcrmSeries = labels.map((mes) => {
    const v = itcrmMensualMap.get(mes);
    return Number.isFinite(v) ? v : null;
  });

  const lastIndex = (inflacion?.datos || []).length - 1;

  const lastFecha =
    inflacion?.ultimoDato?.fecha || inflacion?.datos?.[lastIndex]?.fecha || null;

  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  let subtitleDate = "";

  if (lastFecha) {
    const [y, m] = lastFecha.split("-");
    const mm = Number(m) - 1;
    const monthName = monthNames[mm] || m;
    subtitleDate = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${y}`;
  }

  const ultimoMensual = Number(inflacion?.ultimoDato?.inflacionMensual ?? NaN);
  const ultimoInteranual = Number(interanual[interanual.length - 1]);

  let ultimoAcumulada = null;

  if (lastFecha && Array.isArray(inflacion?.datos)) {
    const [y] = lastFecha.split("-");
    const datos = inflacion.datos;
    const startIdx = datos.findIndex((d) => d.fecha && d.fecha.startsWith(y));
    const endIdx = datos.length - 1;

    if (startIdx >= 0 && endIdx >= startIdx) {
      let factor = 1;
      let ok = true;

      for (let i = startIdx; i <= endIdx; i += 1) {
        const m = Number(datos[i]?.inflacionMensual);

        if (!Number.isFinite(m)) {
          ok = false;
          break;
        }

        factor *= 1 + m / 100;
      }

      if (ok) ultimoAcumulada = (factor - 1) * 100;
    }
  }

  const formatPct = (v, decimals = 1) => {
    if (v === null || v === undefined || !Number.isFinite(Number(v))) {
      return "N/D";
    }

    return Number(v).toFixed(decimals).replace(".", ",");
  };

  const getKpiToneClass = (v) => {
    if (!Number.isFinite(Number(v))) return "";
    return Number(v) >= 0
      ? "module-kpi-card--positive"
      : "module-kpi-card--negative";
  };

  const showSecondaryCharts = true;
  const showBottomInflationInfo = true;

  return (
    <article className="module-page macro-module macro-module--inflacion">
      <section
        className="module-hero inflation-hero"
        style={{ backgroundImage: "url('/images/inflacion-hero.png')" }}
      >
        <div className="module-hero-overlay" />

        <div className="module-hero-content">
          <span>Precios</span>
          <h1>Índice de Precios al Consumidor</h1>
          <p>
            Evolución mensual, categorías, regiones y componentes del nivel general
            de precios.
          </p>
          <small>Último período: {subtitleDate || "N/D"}</small>
        </div>

        <div className="module-hero-stat">
          <span>Último dato</span>
          <strong>{formatPct(ultimoMensual)}%</strong>
          <p>Variación mensual</p>
          <small>{subtitleDate || "N/D"}</small>
        </div>
      </section>

      <main className="module-content inflation-content">
      <section className="kpi-overlap inflacion-kpi-floating" aria-label="Indicadores principales">
  <div className="module-kpi-grid">
    <article
      className={`module-kpi-card ${getKpiToneClass(ultimoMensual)}`}
      tabIndex={0}
    >
      <span className="module-kpi-label">% mensual</span>
      <strong className="module-kpi-value">{formatPct(ultimoMensual)}</strong>
      <span className="module-kpi-foot">{subtitleDate}</span>
    </article>

    <article
      className={`module-kpi-card module-kpi-card--primary ${getKpiToneClass(
        ultimoInteranual
      )}`}
      tabIndex={0}
    >
      <span className="module-kpi-label">% interanual</span>
      <strong className="module-kpi-value">{formatPct(ultimoInteranual)}</strong>
      <span className="module-kpi-foot">{subtitleDate}</span>
    </article>

    <article
      className={`module-kpi-card ${getKpiToneClass(ultimoAcumulada)}`}
      tabIndex={0}
    >
      <span className="module-kpi-label">% acumulada</span>
      <strong className="module-kpi-value">{formatPct(ultimoAcumulada)}</strong>
      <span className="module-kpi-foot">{subtitleDate}</span>
    </article>
  </div>
</section>

        <section className="module-section inflacion-main-chart" aria-labelledby="inflacion-mensual-title">
          <header className="module-section-header">
            <h2 id="inflacion-mensual-title" className="module-section-title">
              Inflación mensual e ITCRM
            </h2>
          </header>

          <div className="module-chart-card">
            <BarChart
              title="Inflación mensual (%)"
              labels={labels}
              data={data}
              highlightColor="#dc2626"
              variant="inflation-main"
              lineSeries={[
                {
                  name: "ITCRM",
                  data: itcrmSeries,
                  yAxisIndex: 1,
                  showSymbol: true,
                  symbol: "circle",
                  symbolSize: 6,
                  lineStyle: { color: "#6EA8FE", width: 2.8 },
                },
              ]}
              rightAxisLabelFormatter="{value}"
            />
          </div>
        </section>

        <section className="module-ai-card">
          <div className="module-ai-icon">🧠</div>
          <div className="module-ai-grid">
            <span>Análisis IA</span>
            <p>
              La inflación mensual desaceleró por segundo mes consecutivo, ubicándose
              en {formatPct(ultimoMensual)}% en {subtitleDate || "el último período"}.
            </p>
            <p>
              La inflación núcleo se mantiene por encima del nivel general, mientras
              que los precios estacionales muestran mayor volatilidad.
            </p>
            <p>
              Alimentos y bebidas no alcohólicas continúa siendo una de las categorías
              con mayores aumentos del mes.
            </p>
          </div>
        </section>

        {showSecondaryCharts && (
          <div className="inflacion-secondary-grid">
            <ErrorBoundary>
              <CategoriasChartHolder />
            </ErrorBoundary>

            <ErrorBoundary>
              <RegionesInteranualHolder />
            </ErrorBoundary>
          </div>
        )}

        {showBottomInflationInfo && (
          <>
            <div className="inflacion-bottom-grid">
              <ErrorBoundary>
                <NivelGeneralInteranualConceptosHolder />
              </ErrorBoundary>

              <aside className="inflacion-side-stack" aria-label="Información adicional">
                <section className="inflacion-info-card" aria-labelledby="inflacion-metodologia-title">
                  <h3 id="inflacion-metodologia-title">Metodología</h3>
                  <p>
                    El IPC mide la variación promedio de los precios minoristas de un
                    conjunto de bienes y servicios que representan el consumo de los
                    hogares urbanos.
                  </p>
                  <a
                    href="https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver metodología completa
                  </a>
                </section>

                <section className="inflacion-info-card" aria-labelledby="inflacion-fuente-title">
                  <h3 id="inflacion-fuente-title">Fuente de datos</h3>
                  <p>INDEC - Índice de Precios al Consumidor</p>
                  <a
                    href="https://www.indec.gob.ar"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    indec.gob.ar
                  </a>
                </section>
              </aside>
            </div>

            <p className="inflacion-footnote" role="note">
              Los datos corresponden a la medición oficial del INDEC. Pueden existir
              diferencias por redondeo.
            </p>
          </>
        )}
      </main>
    </article>
  );
}

function CategoriasChartHolder() {
  const [cats, setCats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getInflacionCategorias()
      .then(setCats)
      .catch(() => setErr("No se pudieron cargar categorías"));
  }, []);

  if (err) return <div role="alert">Error: {err}</div>;
  if (!cats) return <div role="status">Cargando componentes...</div>;

  const VISIBLE = 12;
  const labels = cats.labels || [];
  const start = Math.max(0, labels.length - VISIBLE);
  const visibleLabels = labels.slice(start);

  const series = cats.series || [];
  if (!series.length) return null;

  const getSerie = (name) => {
    const found = series.find((s) =>
      String(s.name || "").toLowerCase().includes(name.toLowerCase())
    );

    return found ? found.data.slice(start).map((v) => Number(v)) : [];
  };

  const nucleo = getSerie("núcleo");
  const regulados = getSerie("regulados");
  const estacionales = getSerie("estacional");

  const last = (arr) => {
    const v = arr[arr.length - 1];
    return Number.isFinite(v) ? v : null;
  };

  const formatValue = (v) =>
    Number.isFinite(v) ? `${v.toFixed(1).replace(".", ",")}%` : "N/D";

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0f172a",
      borderWidth: 0,
      padding: 12,
      textStyle: {
        color: "#ffffff",
        fontSize: 13,
      },
      valueFormatter: (value) =>
        Number.isFinite(value)
          ? `${Number(value).toFixed(1).replace(".", ",")}%`
          : "N/D",
    },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 18,
      itemHeight: 8,
      textStyle: {
        color: "#64748b",
        fontSize: 13,
        fontWeight: 600,
      },
    },
    grid: {
      left: 44,
      right: 28,
      top: 58,
      bottom: 42,
    },
    xAxis: {
      type: "category",
      data: visibleLabels,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "rgba(148,163,184,0.35)",
        },
      },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
        formatter: (value) => {
          const [y, m] = String(value).split("-");
          const meses = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
          ];
          return `${meses[Number(m) - 1] || m}\n${y}`;
        },
      },
    },
    yAxis: {
      type: "value",
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
        formatter: "{value}%",
      },
      splitLine: {
        lineStyle: {
          color: "rgba(148,163,184,0.14)",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "Núcleo",
        type: "line",
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        data: nucleo,
        lineStyle: {
          width: 3.5,
          color: "#0f172a",
        },
        itemStyle: {
          color: "#0f172a",
        },
      },
      {
        name: "Regulados",
        type: "line",
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        data: regulados,
        lineStyle: {
          width: 3,
          color: "#22c55e",
        },
        itemStyle: {
          color: "#22c55e",
        },
      },
      {
        name: "Estacionales",
        type: "line",
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        data: estacionales,
        lineStyle: {
          width: 3,
          color: "#60a5fa",
        },
        itemStyle: {
          color: "#60a5fa",
        },
      },
    ],
  };

  return (
    <section className="module-section" aria-labelledby="componentes-inflacion-title">
      <header className="module-section-header">
        <div>
          <h2 id="componentes-inflacion-title" className="module-section-title">
            Componentes de la inflación
          </h2>
          <p className="module-section-subtitle">
            Evolución mensual de núcleo, regulados y estacionales.
          </p>
        </div>
      </header>

      <div className="module-chart-card">
        <div className="componentes-kpi-row">
          <article className="componentes-kpi">
            <span>Núcleo</span>
            <strong>{formatValue(last(nucleo))}</strong>
          </article>

          <article className="componentes-kpi">
            <span>Regulados</span>
            <strong>{formatValue(last(regulados))}</strong>
          </article>

          <article className="componentes-kpi">
            <span>Estacionales</span>
            <strong>{formatValue(last(estacionales))}</strong>
          </article>
        </div>

        <ReactECharts
          option={option}
          style={{ height: "360px", width: "100%" }}
        />
      </div>
    </section>
  );
}

function RegionesInteranualHolder() {
  const [payload, setPayload] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getInflacionRegionesInteranual()
      .then(setPayload)
      .catch(() => setErr("No se pudieron cargar regiones interanuales"));
  }, []);

  if (err) return <div role="alert">Error: {err}</div>;
  if (!payload) return <div role="status">Cargando regiones interanuales...</div>;

  const items = payload.items || [];
  if (!items.length) return <div role="status">No hay datos interanuales por regiones.</div>;

  const labels = items.map((it) =>
    (it.region || "").replace(/^Regi(o|ó)n\s*/i, "").trim()
  );

  const data = items.map((it) =>
    Number.isFinite(Number(it.valor)) ? Number(it.valor) : null
  );

  return (
    <section className="module-section" aria-labelledby="regiones-interanual-title">
      <header className="module-section-header">
        <h2 id="regiones-interanual-title" className="module-section-title">
          Nivel general interanual por región
        </h2>
      </header>

      <div className="module-chart-card">
        <BarChart
          title={`Nivel general (interanual) por región — ${formatPeriodo(
            payload.fecha
          )}`}
          labels={labels}
          data={data}
          highlightColor="#0b84a5"
          variant="inflation"
          seriesName="Interanual"
        />
      </div>
    </section>
  );
}

function NivelGeneralInteranualConceptosHolder() {
  const [payload, setPayload] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getInteranualNivelGeneralConceptos()
      .then(setPayload)
      .catch(() => setErr("No se pudieron cargar conceptos interanuales"));
  }, []);

  if (err) return <div role="alert">Error: {err}</div>;
  if (!payload) return <div role="status">Cargando conceptos interanuales...</div>;

  const items = payload.items || [];
  if (!items.length) return <div role="status">No hay datos disponibles.</div>;

  const labels = items.map((it) => it.concepto || "");

  const data = items.map((it) =>
    Number.isFinite(Number(it.valor)) ? Number(it.valor) : null
  );

  return (
    <section className="module-section" aria-labelledby="conceptos-interanual-title">
      <header className="module-section-header">
        <h2 id="conceptos-interanual-title" className="module-section-title">
          Nivel general interanual por concepto
        </h2>
      </header>

      <div className="module-chart-card">
        <BarChart
          horizontal
          title={`Nivel general (interanual) — por concepto — ${formatPeriodo(
            payload.fecha
          )}`}
          labels={labels}
          data={data}
          highlightColor="#dc2626"
          darkMode
          variant="inflation"
          seriesName="Interanual"
        />
      </div>
    </section>
  );
}

export default InflationSection;