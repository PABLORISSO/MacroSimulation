import { useEffect, useState } from "react";
import LineChart from "../LineChart";
import { getAgregadosMonetarios } from "../../services/monetaryAggregatesService";
import { getAnalisisAgregados } from "../../services/aiAnalysisService";

const SLUGS_GRAFICO = ["base-monetaria", "m2-privado", "m3-privado"];

const COLORES = {
  "base-monetaria": "#2563eb",
  "m2-privado": "#7c3aed",
  "m3-privado": "#db2777",
};

function formatIsoDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = String(isoDate).split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

function AgregadosMonetariosSection() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analisisIA, setAnalisisIA] = useState(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await getAgregadosMonetarios({
          desde: "2025-01-01",
          frecuencia: "diaria",
          limit: 180,
        });

        if (!isMounted) return;
        setSeries(data.series || []);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(`Error al cargar agregados monetarios: ${err.message}`);
        setLoading(false);
      }
    };

    load();
    const intervalId = setInterval(load, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setLoadingIA(true);
    setErrorIA(null);
    getAnalisisAgregados()
      .then((data) => setAnalisisIA(data))
      .catch((err) => {
        console.error("AI agregados error:", err);
        setErrorIA(`No se pudo generar análisis IA: ${err.message}`);
      })
      .finally(() => setLoadingIA(false));
  }, []);

  const seriesGrafico = SLUGS_GRAFICO.map((slug) =>
    series.find((s) => s.slug === slug)
  ).filter((s) => s && Array.isArray(s.datos));

  // Eje de fechas unificado
  const allDates = Array.from(
    new Set(seriesGrafico.flatMap((s) => s.datos.map((d) => d.fecha)))
  ).sort();

  const echartsSerires = seriesGrafico.map((s) => {
    const map = new Map(s.datos.map((d) => [d.fecha, d.valor]));
    return {
      name: s.nombre,
      data: allDates.map((d) => map.get(d) ?? null),
      lineStyle: { width: 2, color: COLORES[s.slug] },
      itemStyle: { color: COLORES[s.slug] },
      showSymbol: false,
    };
  });

  const ultimosDatos = SLUGS_GRAFICO.map((slug) => {
    const serie = series.find((s) => s.slug === slug);
    return serie ? { nombre: serie.nombre, ultimoDato: serie.ultimoDato } : null;
  }).filter(Boolean);

  const ultimaFechaDisponible = series
    .map((s) => s?.ultimoDato?.fecha)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <section className="dashboard-card">
      <h2 className="section-title">Agregados monetarios</h2>
      <p className="section-subtitle">
        Base monetaria, M2 privado y M3 privado en millones de ARS. Fuente: BCRA.
        M3 privado = M2 privado + plazos fijos sector privado.
      </p>
      <p className="rate-subtitle">
        Último dato disponible: {formatIsoDate(ultimaFechaDisponible)} (fuente BCRA).
      </p>

      <div className="data-summary">
        {ultimosDatos.map(({ nombre, ultimoDato }) => (
          <div className="data-box" key={nombre}>
            <span className="data-box-label">{nombre}</span>
            <strong className="data-box-value">
              {ultimoDato?.valor != null
                ? `$${(ultimoDato.valor / 1000).toLocaleString("es-AR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}M`
                : "—"}
            </strong>
            <p className="rate-subtitle">
              {ultimoDato?.fecha ?? ""}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="message">Cargando agregados monetarios...</div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : (
        <LineChart
          labels={allDates}
          data={echartsSerires[0]?.data ?? []}
          title="Agregados monetarios"
          series={echartsSerires}
        />
      )}

      {loadingIA && (
        <div className="message">Generando análisis con IA...</div>
      )}
      {!loadingIA && errorIA && (
        <div className="message error">{errorIA}</div>
      )}
      {!loadingIA && analisisIA && (
        <div className="ai-analysis-inline">
          <p>
            <strong>💡 Análisis IA:</strong> {analisisIA.analisis}
          </p>
          <p className="rate-subtitle">
            {analisisIA.fromCache ? "desde caché" : "recién generado"} ·{" "}
            {formatIsoDate(analisisIA.timestamp?.slice(0, 10))}
          </p>
        </div>
      )}
    </section>
  );
}

export default AgregadosMonetariosSection;
