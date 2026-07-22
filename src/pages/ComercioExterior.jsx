import { useEffect, useMemo, useState } from "react";
import LineChart from "../components/LineChart";
import { getDesgloseComercio } from "../services/comercioExteriorService";
import "../styles/dashboard.css";

function ComercioExterior() {
  const [importaciones, setImportaciones] = useState([]);
  const [exportaciones, setExportaciones] = useState([]);
  const [desglose, setDesglose] = useState({
    impBienes: [],
    impServicios: [],
    expBienes: [],
    expServicios: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modoRango, setModoRango] = useState("ultimos-25");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const params =
          modoRango === "historial-completo"
            ? { desde: 1960, limit: 100 }
            : { desde: 2000, limit: 25 };

        const payload = await getDesgloseComercio(params);

        if (!mounted) return;
        setImportaciones(payload?.importaciones?.total?.datos || []);
        setExportaciones(payload?.exportaciones?.total?.datos || []);
        setDesglose({
          impBienes: payload?.importaciones?.bienes?.datos || [],
          impServicios: payload?.importaciones?.servicios?.datos || [],
          expBienes: payload?.exportaciones?.bienes?.datos || [],
          expServicios: payload?.exportaciones?.servicios?.datos || [],
        });
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(`Error al cargar comercio exterior: ${err.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [modoRango]);

  const labels = useMemo(() => {
    return Array.from(
      new Set([
        ...importaciones.map((d) => d.fecha),
        ...exportaciones.map((d) => d.fecha),
      ])
    ).sort((a, b) => Number(a) - Number(b));
  }, [importaciones, exportaciones]);

  const mapSeries = (rows) => {
    const map = new Map(rows.map((d) => [d.fecha, d.valor]));
    return labels.map((year) => {
      const value = map.get(year);
      return value != null ? Number((value / 1_000_000_000).toFixed(2)) : null;
    });
  };

  const labelsDesglose = useMemo(() => {
    return Array.from(
      new Set([
        ...desglose.impBienes.map((d) => d.fecha),
        ...desglose.impServicios.map((d) => d.fecha),
        ...desglose.expBienes.map((d) => d.fecha),
        ...desglose.expServicios.map((d) => d.fecha),
      ])
    ).sort((a, b) => Number(a) - Number(b));
  }, [desglose]);

  const mapSeriesByLabels = (rows, xLabels) => {
    const map = new Map(rows.map((d) => [d.fecha, d.valor]));
    return xLabels.map((year) => {
      const value = map.get(year);
      return value != null ? Number((value / 1_000_000_000).toFixed(2)) : null;
    });
  };

  const series = [
    {
      name: "Exportaciones (USD miles de millones)",
      data: mapSeries(exportaciones),
      lineStyle: { width: 2, color: "#16a34a" },
      itemStyle: { color: "#16a34a" },
    },
    {
      name: "Importaciones (USD miles de millones)",
      data: mapSeries(importaciones),
      lineStyle: { width: 2, color: "#2563eb" },
      itemStyle: { color: "#2563eb" },
    },
  ];

  const seriesDesglose = [
    {
      name: "Exp. bienes",
      data: mapSeriesByLabels(desglose.expBienes, labelsDesglose),
      lineStyle: { width: 2, color: "#16a34a" },
      itemStyle: { color: "#16a34a" },
    },
    {
      name: "Exp. servicios",
      data: mapSeriesByLabels(desglose.expServicios, labelsDesglose),
      lineStyle: { width: 2, color: "#22c55e", type: "dashed" },
      itemStyle: { color: "#22c55e" },
    },
    {
      name: "Imp. bienes",
      data: mapSeriesByLabels(desglose.impBienes, labelsDesglose),
      lineStyle: { width: 2, color: "#2563eb" },
      itemStyle: { color: "#2563eb" },
    },
    {
      name: "Imp. servicios",
      data: mapSeriesByLabels(desglose.impServicios, labelsDesglose),
      lineStyle: { width: 2, color: "#60a5fa", type: "dashed" },
      itemStyle: { color: "#60a5fa" },
    },
  ];

  const ultimoExp = exportaciones[exportaciones.length - 1] || null;
  const ultimoImp = importaciones[importaciones.length - 1] || null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Comercio Exterior</h1>
        <p className="dashboard-subtitle">
          Importaciones y exportaciones de bienes y servicios (USD corrientes, frecuencia anual). Fuente: World Bank Open Data.
        </p>
        <p className="rate-subtitle">
          Ahora incluye desglose en bienes y servicios para impo/expo.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            className="navbar-logo"
            onClick={() => setModoRango("ultimos-25")}
            style={{ opacity: modoRango === "ultimos-25" ? 1 : 0.7 }}
          >
            Últimos 25 años
          </button>
          <button
            type="button"
            className="navbar-logo"
            onClick={() => setModoRango("historial-completo")}
            style={{ opacity: modoRango === "historial-completo" ? 1 : 0.7 }}
          >
            Historial completo
          </button>
        </div>

        <div className="data-summary">
          <div className="data-box">
            <span className="data-box-label">Última exportación</span>
            <strong className="data-box-value">
              {ultimoExp?.valor != null
                ? `US$ ${(ultimoExp.valor / 1_000_000_000).toLocaleString("es-AR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} B`
                : "—"}
            </strong>
            <p className="rate-subtitle">Año: {ultimoExp?.fecha ?? "—"}</p>
          </div>

          <div className="data-box">
            <span className="data-box-label">Última importación</span>
            <strong className="data-box-value">
              {ultimoImp?.valor != null
                ? `US$ ${(ultimoImp.valor / 1_000_000_000).toLocaleString("es-AR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} B`
                : "—"}
            </strong>
            <p className="rate-subtitle">Año: {ultimoImp?.fecha ?? "—"}</p>
          </div>
        </div>

        {loading ? (
          <div className="message">Cargando comercio exterior...</div>
        ) : error ? (
          <div className="message error">{error}</div>
        ) : (
          <>
            <LineChart
              labels={labels}
              series={series}
              title="Importaciones y exportaciones"
            />
            <LineChart
              labels={labelsDesglose}
              series={seriesDesglose}
              title="Desglose de comercio exterior"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ComercioExterior;
