import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { getTipoCambio } from "../../services/exchangeRateService";
import { getInflacion } from "../../services/inflationService";
import { getDolares } from "../../services/dolarApiService";

function toMonth(fecha) {
  if (!fecha) return null;
  return String(fecha).slice(0, 7);
}

function getVariationPct(inicio, fin) {
  if (!Number.isFinite(inicio) || !Number.isFinite(fin) || inicio === 0) return null;
  return ((fin / inicio - 1) * 100);
}

function formatSignedPct(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

function formatSignedPoints(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
}

function formatCurrencyNoDecimals(value) {
  if (value === null || value === undefined || value === "") return "—";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "—";
  return `$${numberValue.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function TipoCambioVsInflacionSection() {
  const [data, setData] = useState([]);
  const [dolares, setDolares] = useState(null);
  const [latestMayorista, setLatestMayorista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [tipoCambioPayload, inflacionPayload, dolaresPayload] = await Promise.all([
          getTipoCambio({ desde: "2020-01-01", frecuencia: "diaria", limit: 4000 }),
          getInflacion(),
          getDolares().catch(() => null),
        ]);

        const tipoCambio = Array.isArray(tipoCambioPayload?.datos)
          ? tipoCambioPayload.datos
          : [];
        const inflacion = Array.isArray(inflacionPayload?.datos)
          ? inflacionPayload.datos
          : [];

        setDolares(dolaresPayload);
        setLatestMayorista(
          tipoCambio.length ? Number(tipoCambio[tipoCambio.length - 1]?.valor) : null
        );

        const ultimoMayoristaPorMes = new Map();
        tipoCambio.forEach((item) => {
          const month = toMonth(item.fecha);
          const valor = Number(item.valor);
          if (!month || !Number.isFinite(valor)) return;
          ultimoMayoristaPorMes.set(month, valor);
        });

        const mensualInflacion = new Map();
        inflacion.forEach((item) => {
          const month = toMonth(item.fecha);
          const val = Number(item.inflacionMensual);
          if (!month || !Number.isFinite(val)) return;
          mensualInflacion.set(month, val);
        });

        const mesesComunes = [...mensualInflacion.keys()]
          .filter((m) => ultimoMayoristaPorMes.has(m))
          .sort();

        const ultimosMeses = mesesComunes.slice(-36);
        if (!ultimosMeses.length) {
          setData([]);
          setLoading(false);
          return;
        }

        const baseDolar = ultimoMayoristaPorMes.get(ultimosMeses[0]);
        let factorInflacion = 1;

        const serie = ultimosMeses.map((mes) => {
          const inflacionMensual = mensualInflacion.get(mes);
          const dolar = ultimoMayoristaPorMes.get(mes);

          factorInflacion *= 1 + inflacionMensual / 100;

          const indiceInflacion = Number((factorInflacion * 100).toFixed(2));
          const indiceDolar = Number(((dolar / baseDolar) * 100).toFixed(2));
          const tipoCambioRealAprox = Number(((indiceDolar / indiceInflacion) * 100).toFixed(2));

          return {
            mes,
            indiceInflacion,
            indiceDolar,
            tipoCambioRealAprox,
          };
        });

        setData(serie);
      } catch (e) {
        setError("No se pudo cargar el gráfico Dólar vs inflación acumulada.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const option = useMemo(() => {
    const labels = data.map((d) => d.mes);
    const dolar = data.map((d) => d.indiceDolar);
    const inflacion = data.map((d) => d.indiceInflacion);

    const devaluacionIndex = dolar.reduce(
      (bestIdx, value, idx, arr) => {
        if (idx === 0) return bestIdx;
        const jump = value - arr[idx - 1];
        if (jump > bestIdx.jump) return { idx, jump };
        return bestIdx;
      },
      { idx: 0, jump: -Infinity }
    ).idx;

    const erosionIndex = data.reduce(
      (bestIdx, item, idx) => {
        const gap = item.indiceInflacion - item.indiceDolar;
        return gap > bestIdx.gap ? { idx, gap } : bestIdx;
      },
      { idx: 0, gap: -Infinity }
    ).idx;

    return {
      backgroundColor: "#fff",
      title: {
        text: "Dólar mayorista vs inflación (índice base 100)",
        subtext: "Comparación de índices base 100",
        left: "center",
        textStyle: { fontSize: 16, fontWeight: "bold" },
      },
      legend: {
        top: 45,
        data: ["Dólar mayorista", "IPC acumulado"],
      },
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          if (!params?.length) return "";
          const month = params[0].axisValue;
          const rows = params
            .map((p) => `${p.marker} ${p.seriesName}: ${Number(p.value).toFixed(2)}`)
            .join("<br/>");
          return `<strong>${month}</strong><br/>${rows}`;
        },
      },
      grid: {
        left: "8%",
        right: "5%",
        top: "22%",
        bottom: "14%",
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: "value",
        axisLabel: { formatter: "{value}" },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      series: [
        {
          name: "Dólar mayorista",
          type: "line",
          smooth: false,
          showSymbol: false,
          data: dolar,
          lineStyle: { width: 2.5, color: "#2563eb" },
          markPoint: {
            symbolSize: 18,
            data: labels[devaluacionIndex]
              ? [
                  {
                    coord: [labels[devaluacionIndex], dolar[devaluacionIndex]],
                    value: "Devaluación inicial",
                    label: {
                      formatter: "Devaluación inicial",
                      color: "#1e3a8a",
                      fontSize: 11,
                      backgroundColor: "#eff6ff",
                      padding: [3, 6],
                      borderRadius: 4,
                    },
                    itemStyle: { color: "#1d4ed8" },
                  },
                ]
              : [],
          },
        },
        {
          name: "IPC acumulado",
          type: "line",
          smooth: false,
          showSymbol: false,
          data: inflacion,
          lineStyle: { width: 2.5, color: "#dc2626" },
          markPoint: {
            symbolSize: 18,
            data: labels[erosionIndex]
              ? [
                  {
                    coord: [labels[erosionIndex], inflacion[erosionIndex]],
                    value: "Erosión inflacionaria",
                    label: {
                      formatter: "Erosión inflacionaria",
                      color: "#7f1d1d",
                      fontSize: 11,
                      backgroundColor: "#fff1f2",
                      padding: [3, 6],
                      borderRadius: 4,
                    },
                    itemStyle: { color: "#b91c1c" },
                  },
                ]
              : [],
          },
        },
      ],
    };
  }, [data]);

  const tcrOption = useMemo(() => {
    const labels = data.map((d) => d.mes);
    const tcrAprox = data.map((d) => d.tipoCambioRealAprox);

    return {
      backgroundColor: "#fff",
      title: {
        text: "Tipo de cambio real (aprox.) — índice base 100",
        subtext: "TCR aprox. = índice del dólar mayorista / índice acumulado del IPC",
        left: "center",
        textStyle: { fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        valueFormatter: (v) => (v != null ? v.toFixed(2) : "—"),
      },
      grid: {
        left: "8%",
        right: "5%",
        top: "22%",
        bottom: "14%",
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: "value",
        axisLabel: { formatter: "{value}" },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      series: [
        {
          name: "Tipo de cambio real (aprox.)",
          type: "line",
          smooth: false,
          showSymbol: false,
          data: tcrAprox,
          lineStyle: { width: 2.5, color: "#16a34a" },
          markLine: {
            silent: true,
            symbol: "none",
            data: [
              {
                yAxis: 100,
                lineStyle: { color: "#94a3b8", type: "dashed", width: 1.25 },
                label: { formatter: "Base 100", color: "#64748b" },
              },
            ],
          },
        },
      ],
    };
  }, [data]);

  // Análisis de CORTO PLAZO - últimos 12 meses (PRINCIPAL)
  const shortTermAnalysis = useMemo(() => {
    if (!data.length) return null;

    const ultimos12 = data.slice(-12);
    if (ultimos12.length < 2) return null;

    const inicio = ultimos12[0];
    const fin = ultimos12[ultimos12.length - 1];

    const varDolarPct = getVariationPct(inicio.indiceDolar, fin.indiceDolar);
    const varInflacionPct = getVariationPct(inicio.indiceInflacion, fin.indiceInflacion);
    const varTcrPct = getVariationPct(inicio.tipoCambioRealAprox, fin.tipoCambioRealAprox);
    const apreciacion = Number.isFinite(varTcrPct) ? varTcrPct < 0 : varInflacionPct > varDolarPct;

    return {
      varDolarPct,
      varInflacionPct,
      varTcrPct,
      apreciacion,
      tcr: fin.tipoCambioRealAprox,
      periodo: `${inicio.mes} a ${fin.mes}`,
    };
  }, [data]);

  // Análisis de LARGO PLAZO - últimos 36 meses (CONTEXTO)
  const longTermAnalysis = useMemo(() => {
    if (!data.length) return null;

    const inicio = data[0];
    const fin = data[data.length - 1];

    const varDolarPct = getVariationPct(inicio.indiceDolar, fin.indiceDolar);
    const varInflacionPct = getVariationPct(inicio.indiceInflacion, fin.indiceInflacion);
    const varTcrPct = getVariationPct(inicio.tipoCambioRealAprox, fin.tipoCambioRealAprox);

    return {
      varDolarPct,
      varInflacionPct,
      varTcrPct,
      periodo: `${inicio.mes} a ${fin.mes}`,
    };
  }, [data]);

  const tcrReading = useMemo(() => {
    if (!shortTermAnalysis) return "El tipo de cambio real muestra una tendencia descendente tras la devaluación inicial.";
    if (Number.isFinite(shortTermAnalysis.varTcrPct) && shortTermAnalysis.varTcrPct < 0) {
      return "El TCR se aprecia en el último año, reflejando pérdida de competitividad cambiaria.";
    }
    return "El tipo de cambio real muestra una tendencia descendente tras la devaluación inicial.";
  }, [shortTermAnalysis]);

  // Última variación mensual
  const ultimaVariacion = useMemo(() => {
    if (!data.length || data.length < 2) return null;

    const penultimo = data[data.length - 2];
    const ultimo = data[data.length - 1];

    const varDolar = ultimo.indiceDolar - penultimo.indiceDolar;
    const varInflacion = ultimo.indiceInflacion - penultimo.indiceInflacion;

    return {
      mes: ultimo.mes,
      varDolar,
      varInflacion,
      varTcr: (ultimo.tipoCambioRealAprox - penultimo.tipoCambioRealAprox),
    };
  }, [data]);

  const officialValue = Number(dolares?.oficial?.venta);
  const referenciaBrecha = Number.isFinite(officialValue) ? officialValue : latestMayorista;
  const referenciaLabel = Number.isFinite(officialValue) ? "oficial" : "mayorista";

  if (loading) return <div className="message">Cargando comparación dólar vs inflación...</div>;
  if (error) return <div className="message error">{error}</div>;
  if (!data.length) return <div className="message">No hay datos suficientes para comparar.</div>;

  return (
    <>
      <section aria-labelledby="tipo-cambio-principales-cotizaciones-title">
        <header className="module-section-header">
          <h2 id="tipo-cambio-principales-cotizaciones-title" className="module-section-title">
            Principales cotizaciones
          </h2>
        </header>

        <div className="module-kpi-grid module-kpi-grid--five">
          {[
            { label: "Oficial", data: dolares?.oficial },
            { label: "MEP", data: dolares?.mep },
            { label: "CCL", data: dolares?.ccl },
            { label: "Blue", data: dolares?.blue },
            { label: "Mayorista (BCRA)", valor: latestMayorista },
          ].map(({ label, data: cotizacion, valor }) => {
            const venta = cotizacion?.venta ?? valor;
            const compra = cotizacion?.compra ?? null;
            const isLibre = ["MEP", "CCL", "Blue"].includes(label);
            const ventaNum = Number(venta);
            const brecha = Number.isFinite(ventaNum) && Number.isFinite(referenciaBrecha) && isLibre
              ? ((ventaNum / referenciaBrecha) - 1) * 100
              : null;
            return (
              <article className="module-kpi-card module-kpi-card--compact" key={label}>
                <span className="module-kpi-label">{label}</span>
                <strong className="module-kpi-value">
                  {formatCurrencyNoDecimals(venta)}
                </strong>
                <span className="module-kpi-foot">
                  {isLibre ? "Mercado libre" : "Mercado oficial"}
                </span>
                <span className="module-kpi-foot">
                  {Number.isFinite(brecha)
                    ? `${brecha > 0 ? "+" : ""}${brecha.toFixed(1)}% vs ${referenciaLabel}`
                    : isLibre
                    ? "—"
                    : compra != null
                    ? `Compra ${formatCurrencyNoDecimals(compra)}`
                    : "ARS por USD"}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="module-chart-card chart-section">
        <ReactECharts
          option={option}
          style={{ height: "var(--module-chart-height, 420px)", width: "100%" }}
        />
        <p className="tcr-reading">{tcrReading}</p>
        <ReactECharts
          option={tcrOption}
          style={{
            height: "var(--module-chart-height, 420px)",
            width: "100%",
            marginTop: 16,
          }}
        />
      </section>
    </>
  );
}

export default TipoCambioVsInflacionSection;
