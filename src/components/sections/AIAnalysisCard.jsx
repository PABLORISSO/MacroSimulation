import { useEffect, useState } from "react";
import { getAnalisisDolar } from "../../services/aiAnalysisService";

function AIAnalysisCard({ mepActual, mayoristActual }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        if (!mepActual || !mayoristActual) {
          setLoading(false);
          return;
        }

        const data = await getAnalisisDolar({
          mepActual,
          mayoristActual,
        });

        if (!isMounted) return;
        setAnalysis(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(`Error al generar análisis: ${err.message}`);
        setAnalysis(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    setLoading(true);
    load();

    return () => {
      isMounted = false;
    };
  }, [mepActual, mayoristActual]);

  if (!mepActual || !mayoristActual) {
    return (
      <section className="dashboard-card ai-analysis-card">
        <h2 className="section-title">💡 Análisis Económico</h2>
        <div className="message">Esperando datos de cotización...</div>
      </section>
    );
  }

  return (
    <section className="dashboard-card ai-analysis-card">
      <h2 className="section-title">💡 Análisis Económico</h2>

      {loading ? (
        <div className="message">Generando análisis con IA...</div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : analysis ? (
        <>
          <div className="analysis-content">
            <p className="analysis-text">{analysis?.analisis}</p>
          </div>

          {analysis?.datos && (
            <div className="analysis-metrics">
              <div className="metric-item">
                <span className="metric-label">MEP:</span>
                <strong>${analysis.datos.mepActual?.toFixed(2)}</strong>
                <small className={analysis.datos.varMep >= 0 ? "positive" : "negative"}>
                  {analysis.datos.varMep >= 0 ? "+" : ""}
                  {analysis.datos.varMep?.toFixed(2)}%
                </small>
              </div>
              <div className="metric-item">
                <span className="metric-label">Mayorista:</span>
                <strong>${analysis.datos.mayoristActual?.toFixed(2)}</strong>
                <small className={analysis.datos.varMayorist >= 0 ? "positive" : "negative"}>
                  {analysis.datos.varMayorist >= 0 ? "+" : ""}
                  {analysis.datos.varMayorist?.toFixed(2)}%
                </small>
              </div>
              <div className="metric-item">
                <span className="metric-label">Brecha:</span>
                <strong>{analysis.datos.brecha?.toFixed(2)}%</strong>
              </div>
            </div>
          )}

          <p className="analysis-footer">
            Análisis generado por IA el {new Date(analysis?.timestamp).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
            {analysis?.fromCache ? " · desde caché (se actualiza cada día)" : " · recién generado"}
          </p>
        </>
      ) : null}
    </section>
  );
}

export default AIAnalysisCard;
