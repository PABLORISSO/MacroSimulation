import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  getIpimGeneral,
  getIpimHeatmapData,
  getUltimoDatoIpim,
  getAnnualVariationFromIpimCsv,
} from "../../services/ipimServices";
import "../../styles/macro-module.css";

function IpimSection() {
  const [serie, setSerie] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [ultimoDato, setUltimoDato] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [annualData, setAnnualData] = useState(null);
  const [error, setError] = useState("");

  async function loadData() {
    setIsLoading(true);
    setError("");

    try {
      const [serieData, heatmapDataRes, ultimoData, annualDataRes] =
        await Promise.all([
          getIpimGeneral(),
          getIpimHeatmapData(),
          getUltimoDatoIpim(),
          getAnnualVariationFromIpimCsv(),
        ]);

      setSerie(serieData);
      setHeatmapData(heatmapDataRes);
      setUltimoDato(ultimoData);
      setAnnualData(annualDataRes);
    } catch (err) {
      console.error("IPIM loadData error:", err);
      setError(err?.message ? String(err.message) : String(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const labels = serie.map((d) => d.label);
  const valoresOriginal = serie.map((d) => d.serieOriginal);
  const valoresDesestacionalizada = serie.map(
    (d) => d.serieDesestacionalizada
  );
  const valoresTendencia = serie.map((d) => d.serieTendenciaCiclo);

  const heatmapMonths = heatmapData?.months ?? [];
  const heatmapSectors = heatmapData?.sectors ?? [];
  const heatmapValues = heatmapData?.values ?? [];
  const heatmapMaxAbs = heatmapData?.maxAbs ?? 5;
  const heatmapExpansionShare = heatmapData?.expansionShare ?? null;
  const heatmapLatestMonth = heatmapData?.latestMonth ?? null;

  const latestSectorGrowth = useMemo(() => {
    if (
      !heatmapMonths.length ||
      !heatmapSectors.length ||
      !heatmapValues.length
    ) {
      return [];
    }

    const latestMonthIndex = heatmapMonths.length - 1;

    return heatmapValues
      .filter(([monthIndex]) => monthIndex === latestMonthIndex)
      .map(([, sectorIndex, value]) => ({
        sector: heatmapSectors[sectorIndex],
        value,
      }))
      .sort((a, b) => (b.value ?? -999) - (a.value ?? -999));
  }, [heatmapMonths, heatmapSectors, heatmapValues]);

  const variacionAcumuladaAnual = useMemo(() => {
    if (!serie.length) return null;

    const ultimo = serie[serie.length - 1];

    if (!ultimo?.fecha || !Number.isFinite(ultimo?.valor)) {
      return null;
    }

    const year = ultimo.fecha.slice(0, 4);

    const firstYearPoint = serie.find(
      (p) => p?.fecha?.startsWith(year) && Number.isFinite(p?.valor)
    );

    if (!firstYearPoint || !firstYearPoint.valor) {
      return null;
    }

    return (ultimo.valor / firstYearPoint.valor - 1) * 100;
  }, [serie]);

  function formatVariation(val) {
    if (!Number.isFinite(Number(val))) return "N/D";

    const numericValue = Number(val);
    const sign = numericValue > 0 ? "+" : "";

    return `${sign}${numericValue.toFixed(2)}%`;
  }

  function formatMonthYear(fecha) {
    if (!fecha) return "N/D";

    const [y, m] = String(fecha).split("-");

    if (!y || !m) return String(fecha);

    const date = new Date(Number(y), Number(m) - 1, 1);

    return date.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
  }

  function getInteranualFoot(val) {
    if (!Number.isFinite(Number(val))) return "sin datos comparables";

    return Number(val) >= 0
      ? "el índice aumenta frente al año previo"
      : "el índice cae frente al año previo";
  }

  function getAcumuladoFoot(val) {
    if (!Number.isFinite(Number(val))) return "sin datos acumulados";

    return Number(val) >= 0
      ? "acumula crecimiento en el año"
      : "permanece en terreno negativo";
  }

  function getKpiToneClass(value) {
    if (!Number.isFinite(Number(value))) return "";

    return Number(value) >= 0
      ? "module-kpi-card--positive"
      : "module-kpi-card--negative";
  }

  const interanual = annualData?.varAnual;
  const acumulado =
    annualData?.varAcumuladaAnual ?? variacionAcumuladaAnual;

  const chartOptionPrincipal = {
    backgroundColor: "transparent",
    title: {
      text: "Evolución del nivel general",
      subtext: "Serie original, desestacionalizada y tendencia-ciclo",
      left: 0,
      top: 0,
      textStyle: {
        fontSize: 28,
        fontWeight: 800,
        color: "#0f172a",
      },
      subtextStyle: {
        color: "#64748b",
        fontSize: 13,
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0f172a",
      borderWidth: 0,
      padding: 12,
      textStyle: {
        color: "#ffffff",
        fontSize: 13,
      },
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "rgba(15,23,42,0.22)",
          width: 1,
        },
      },
      valueFormatter: (value) =>
        Number.isFinite(value) ? Number(value).toFixed(2) : "N/D",
    },
    legend: {
      top: 36,
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
      left: 46,
      right: 24,
      top: 112,
      bottom: 46,
    },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "rgba(148,163,184,0.28)",
        },
      },
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
      max: 150,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(148,163,184,0.09)",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "Original",
        type: "line",
        smooth: false,
        showSymbol: false,
        data: valoresOriginal,
        z: 1,
        lineStyle: {
          width: 2,
          color: "rgba(100,116,139,0.14)",
        },
        areaStyle: {
          color: "rgba(100,116,139,0.02)",
        },
        emphasis: {
          focus: "series",
          lineStyle: {
            width: 3,
            color: "rgba(100,116,139,0.35)",
          },
        },
      },
      {
        name: "Desestacionalizada",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: valoresDesestacionalizada,
        z: 2,
        lineStyle: {
          width: 2.5,
          color: "rgba(37,99,235,0.68)",
        },
        emphasis: {
          focus: "series",
          lineStyle: {
            width: 3.5,
            color: "#2563eb",
          },
        },
      },
      {
        name: "Tendencia-ciclo",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: valoresTendencia,
        z: 3,
        lineStyle: {
          width: 5.5,
          color: "#020617",
        },
        emphasis: {
          focus: "series",
          lineStyle: {
            width: 6.5,
          },
        },
        markArea: {
          silent: true,
          itemStyle: {
            color: "rgba(15,23,42,0.045)",
          },
          label: {
            position: "insideTop",
            distance: 12,
            color: "rgba(100,116,139,0.75)",
            fontSize: 10,
          },
          data: [
            [
              {
                name: "COVID-19",
                xAxis: "2020-03",
              },
              {
                xAxis: "2020-07",
              },
            ],
            [
              {
                name: "Recesión industrial",
                xAxis: "2023-12",
              },
              {
                xAxis: "2024-06",
              },
            ],
          ],
        },
      },
    ],
  };

  const sectorBarsOption = {
    backgroundColor: "transparent",
    title: {
      text: "Desempeño sectorial",
      subtext: heatmapLatestMonth
        ? `${formatMonthYear(heatmapLatestMonth)} | variación interanual`
        : "Variación interanual",
      left: 0,
      top: 0,
      textStyle: {
        fontSize: 28,
        fontWeight: 800,
        color: "#0f172a",
      },
      subtextStyle: {
        color: "#64748b",
        fontSize: 13,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#0f172a",
      borderWidth: 0,
      padding: [12, 14],
      textStyle: {
        color: "#ffffff",
        fontSize: 13,
      },
      formatter: (params) => {
        const point = params?.[0];

        if (!point) return "";

        return `${point.name}<br/>${formatMonthYear(
          heatmapLatestMonth
        )}<br/>${formatVariation(point.value)} interanual`;
      },
    },
    grid: {
      left: 190,
      right: 42,
      top: 102,
      bottom: 24,
    },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#64748b",
        formatter: (value) => `${value}%`,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(148,163,184,0.14)",
          type: "dashed",
        },
      },
    },
    yAxis: {
      type: "category",
      data: latestSectorGrowth.map((item) => item.sector),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: "#334155",
        fontSize: 12,
      },
    },
    series: [
      {
        type: "bar",
        data: latestSectorGrowth.map((item) => ({
          value: Number(item.value?.toFixed?.(2) ?? item.value),
          itemStyle: {
            color: item.value >= 0 ? "#1d4ed8" : "#991b1b",
            borderRadius: 0,
          },
        })),
        barWidth: 20,
        label: {
          show: true,
          position: "right",
          color: "#1f2937",
          formatter: ({ value }) => formatVariation(value),
        },
      },
    ],
  };

  const heatmapOption = {
    backgroundColor: "transparent",
    tooltip: {
      position: "top",
      backgroundColor: "#0f172a",
      borderWidth: 0,
      padding: [12, 14],
      extraCssText:
        "border-radius: 14px; box-shadow: 0 18px 40px rgba(15,23,42,0.28);",
      textStyle: {
        color: "#ffffff",
        fontSize: 13,
      },
      formatter: (params) => {
        const [monthIndex, sectorIndex, value] = params.value;
        const month = heatmapMonths[monthIndex];
        const sector = heatmapSectors[sectorIndex];

        return `${sector}<br/>${formatMonthYear(month)}<br/>${formatVariation(
          value
        )} interanual`;
      },
    },
    grid: {
      left: 170,
      right: 28,
      top: 16,
      bottom: 50,
    },
    xAxis: {
      type: "category",
      data: heatmapMonths,
      splitArea: { show: false },
      axisLine: {
        lineStyle: {
          color: "rgba(148,163,184,0.24)",
        },
      },
      axisTick: { show: false },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
        interval: 0,
        formatter: (value) => {
          const [year, month] = String(value).split("-");
          const date = new Date(Number(year), Number(month) - 1, 1);

          return date.toLocaleDateString("es-AR", {
            month: "short",
            year: "2-digit",
          });
        },
      },
    },
    yAxis: {
      type: "category",
      data: heatmapSectors,
      splitArea: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: "#334155",
        fontSize: 12,
        width: 150,
        overflow: "truncate",
      },
    },
    visualMap: {
      min: -heatmapMaxAbs,
      max: heatmapMaxAbs,
      calculable: false,
      orient: "horizontal",
      left: 0,
      bottom: 0,
      itemWidth: 180,
      itemHeight: 10,
      text: ["Mejora", "Caída"],
      textStyle: {
        color: "#64748b",
        fontSize: 12,
      },
      inRange: {
        color: ["#991b1b", "#f3f4f6", "#1d4ed8"],
      },
    },
    series: [
      {
        name: "Difusión sectorial",
        type: "heatmap",
        data: heatmapValues,
        progressive: 1000,
        itemStyle: {
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.55)",
          borderRadius: 4,
        },
        emphasis: {
          itemStyle: {
            borderColor: "rgba(255,255,255,0.95)",
            borderWidth: 1.2,
            shadowBlur: 14,
            shadowColor: "rgba(15,23,42,0.18)",
          },
        },
      },
    ],
  };

  return (
    <article className="module-page macro-module macro-module--ipim">
      <section
        className="module-hero ipim-hero"
        style={{ backgroundImage: "url('/images/inflacion-hero.png')" }}
      >
        <div className="module-hero-overlay" />

        <div className="module-hero-content">
          <span>Precios mayoristas</span>

          <h1>Índice de Precios Internos al por Mayor</h1>

          <p>
            Evolución del nivel general, desempeño sectorial y dinámica de los
            precios mayoristas.
          </p>

          <small>
            Último período: {formatMonthYear(ultimoDato?.fecha)}
          </small>
        </div>

        <div className="module-hero-stat">
          <span>Variación interanual</span>
          <strong>{formatVariation(interanual)}</strong>
          <p>IPIM nivel general</p>
          <small>{formatMonthYear(ultimoDato?.fecha)}</small>
        </div>
      </section>

      <main className="module-content ipim-content">
        {isLoading ? (
          <div className="module-meta" role="status">
            Actualizando datos...
          </div>
        ) : null}

        {error ? (
          <div className="module-error" role="alert">
            Error: {String(error)}
          </div>
        ) : null}

        <section
          className="kpi-overlap ipim-kpi-floating"
          aria-label="Indicadores principales del IPIM"
        >
          <div className="module-kpi-grid">
            <article
              className="module-kpi-card module-kpi-card--compact"
              tabIndex={0}
            >
              <span className="module-kpi-label">Nivel IPIM</span>

              <strong className="module-kpi-value">
                {ultimoDato?.valor !== undefined
                  ? Number(ultimoDato.valor).toFixed(2)
                  : "N/D"}
              </strong>

              <span className="module-kpi-foot">
                {formatMonthYear(ultimoDato?.fecha)}
              </span>
            </article>

            <article
              className={`module-kpi-card module-kpi-card--primary module-kpi-card--compact ${getKpiToneClass(
                interanual
              )}`}
              tabIndex={0}
            >
              <span className="module-kpi-label">Interanual</span>

              <strong className="module-kpi-value">
                {formatVariation(interanual)}
              </strong>

              <span className="module-kpi-foot">
                {getInteranualFoot(interanual)}
              </span>
            </article>

            <article
              className={`module-kpi-card module-kpi-card--compact ${getKpiToneClass(
                acumulado
              )}`}
              tabIndex={0}
            >
              <span className="module-kpi-label">Acumulado anual</span>

              <strong className="module-kpi-value">
                {formatVariation(acumulado)}
              </strong>

              <span className="module-kpi-foot">
                {getAcumuladoFoot(acumulado)}
              </span>
            </article>
          </div>
        </section>

        <section
          className="module-section"
          aria-labelledby="ipim-main-chart-title"
        >
          <header className="module-section-header">
            <div>
              <p className="module-eyebrow">Nivel general</p>

              <h2
                id="ipim-main-chart-title"
                className="module-section-title"
              >
                Evolución del IPIM
              </h2>

              <p className="module-section-subtitle">
                Serie original, desestacionalizada y tendencia-ciclo.
              </p>
            </div>
          </header>

          <div className="module-chart-card">
            <ReactECharts
              option={chartOptionPrincipal}
              style={{
                height: "var(--module-chart-height, 420px)",
                width: "100%",
              }}
            />

            <div className="module-insight">
              <span className="module-insight-label">Lectura rápida</span>

              <p>
                La evolución reciente debe leerse junto con la tendencia-ciclo y
                la composición sectorial. Una mejora de algunos sectores no
                implica necesariamente una recuperación general del índice.
              </p>
            </div>
          </div>
        </section>

        <section
          className="module-section"
          aria-labelledby="ipim-sector-bars-title"
        >
          <header className="module-section-header">
            <div>
              <p className="module-eyebrow">Nivel 1</p>

              <h2
                id="ipim-sector-bars-title"
                className="module-section-title"
              >
                ¿Qué sectores crecieron más?
              </h2>

              <p className="module-section-subtitle">
                Ranking por variación interanual del último período disponible.
              </p>
            </div>
          </header>

          <div className="module-chart-card">
            <ReactECharts
              option={sectorBarsOption}
              style={{
                height: "var(--module-chart-height-lg, 560px)",
                width: "100%",
              }}
            />
          </div>
        </section>

        <section
          className="module-section"
          aria-labelledby="ipim-heatmap-title"
        >
          <div className="module-chart-card">
            <header className="module-section-header">
              <div>
                <p className="module-eyebrow">Nivel 3</p>

                <h2
                  id="ipim-heatmap-title"
                  className="module-section-title"
                >
                  ¿Cómo evolucionó cada sector?
                </h2>

                <p className="module-section-subtitle">
                  Últimos 24 meses. Azul indica mejora y rojo indica caída.
                </p>
              </div>

              <div className="module-mini-kpi">
                <span className="module-mini-kpi-label">
                  Sectores en expansión
                </span>

                <strong className="module-mini-kpi-value">
                  {Number.isFinite(heatmapExpansionShare)
                    ? `${heatmapExpansionShare}%`
                    : "N/D"}
                </strong>

                <span className="module-mini-kpi-foot">
                  {heatmapLatestMonth
                    ? formatMonthYear(heatmapLatestMonth)
                    : "sin último corte"}
                </span>
              </div>
            </header>

            <ReactECharts
              option={heatmapOption}
              style={{
                height: "var(--module-chart-height-xl, 680px)",
                width: "100%",
              }}
            />
          </div>
        </section>
      </main>
    </article>
  );
}

export default IpimSection;