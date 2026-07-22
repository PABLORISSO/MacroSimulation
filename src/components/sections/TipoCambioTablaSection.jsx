import { useEffect, useState, useMemo } from "react";
import { getTipoCambio } from "../../services/exchangeRateService";
import { getDolares } from "../../services/dolarApiService";
import "../../styles/macro-module.css";

function TipoCambioTablaSection() {
  const [data, setData] = useState([]);
  const [dolares, setDolares] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const itemsPorPagina = 20;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [tipoCambioPayload, dolaresPayload] = await Promise.all([
          getTipoCambio({
            desde: "2024-01-01",
            frecuencia: "diaria",
            limit: 5000,
          }),
          getDolares().catch(() => null),
        ]);

        const tipoCambio = Array.isArray(tipoCambioPayload?.datos)
          ? tipoCambioPayload.datos.sort(
              (a, b) => new Date(b.fecha) - new Date(a.fecha)
            )
          : [];

        setData(tipoCambio);
        setDolares(dolaresPayload);
      } catch (e) {
        setError("No se pudo cargar los datos de tipo de cambio.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const datosFiltrados = useMemo(() => {
    if (filtro === "todos") return data;

    const ahora = new Date();
    const desde = new Date(ahora);

    if (filtro === "ultimo-mes") {
      desde.setMonth(desde.getMonth() - 1);
    }

    if (filtro === "ultimo-trimestre") {
      desde.setMonth(desde.getMonth() - 3);
    }

    return data.filter((item) => new Date(item.fecha) >= desde);
  }, [data, filtro]);

  const datosConIndice = useMemo(() => {
    if (!datosFiltrados.length) return [];

    return datosFiltrados.map((item, idx) => {
      const valor = Number(item.valor);
      const valorAnterior = datosFiltrados[idx + 1]?.valor
        ? Number(datosFiltrados[idx + 1].valor)
        : valor;

      const variacion = ((valor - valorAnterior) / valorAnterior) * 100;

      return {
        ...item,
        variacion: Number.isFinite(variacion) ? variacion : 0,
      };
    });
  }, [datosFiltrados]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(datosConIndice.length / itemsPorPagina)
  );

  const bnaVentaRaw = dolares?.venta ?? dolares?.oficial?.venta ?? null;
  const blueRaw =
    dolares?.blue && typeof dolares.blue === "object"
      ? dolares.blue.venta
      : dolares?.blue;
  const mayoristaRaw = data[0]?.valor ?? null;

  const bnaVenta = Number(bnaVentaRaw);
  const blueVenta = Number(blueRaw);
  const mayorista = Number(mayoristaRaw);

  const inicio = (pagina - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const datosPaginados = datosConIndice.slice(inicio, fin);

  const handlePaginaAnterior = () => {
    setPagina((prev) => Math.max(1, prev - 1));
  };

  const handlePaginaSiguiente = () => {
    setPagina((prev) => Math.min(totalPaginas, prev + 1));
  };

  if (loading) {
    return <div className="module-section-subtitle">Cargando datos...</div>;
  }

  if (error) {
    return <div role="alert" className="module-error">{error}</div>;
  }

  return (
    <>
      <section aria-labelledby="tipo-cambio-kpis-title">
        <header className="module-section-header">
          <h2 id="tipo-cambio-kpis-title" className="module-section-title">
            Principales cotizaciones
          </h2>
        </header>

        <div className="module-kpi-grid" aria-label="Cotizaciones principales del dólar">
          {Number.isFinite(bnaVenta) && (
            <article className="module-kpi-card module-kpi-card--compact">
              <p className="module-kpi-label">Dólar BNA</p>
              <p className="module-kpi-foot">Venta oficial</p>
              <strong className="module-kpi-value">${bnaVenta.toFixed(2)}</strong>
              <p className="module-kpi-foot">Último cierre disponible</p>
            </article>
          )}

          {Number.isFinite(blueVenta) && (
            <article className="module-kpi-card module-kpi-card--compact">
              <p className="module-kpi-label">Dólar Blue</p>
              <p className="module-kpi-foot">Referencia informal</p>
              <strong className="module-kpi-value">${blueVenta.toFixed(2)}</strong>
              <p className="module-kpi-foot">Cotización promedio</p>
            </article>
          )}

          {Number.isFinite(mayorista) && (
            <article className="module-kpi-card module-kpi-card--compact">
              <p className="module-kpi-label">Dólar mayorista</p>
              <p className="module-kpi-foot">Comunicación A 3500</p>
              <strong className="module-kpi-value">${mayorista.toFixed(2)}</strong>
              <p className="module-kpi-foot">Serie diaria BCRA</p>
            </article>
          )}
        </div>
      </section>

      <section
        className="module-chart-card"
        aria-labelledby="historico-cotizaciones-title"
      >
        <h2 id="historico-cotizaciones-title" className="module-section-title">
          Histórico de Cotizaciones
        </h2>

        <p className="module-section-subtitle">
          Variación diaria del tipo de cambio mayorista Comunicación A 3500 -
          BCRA.
        </p>

        <nav aria-label="Filtros de período" className="tipo-cambio-tabla-filtros">
          {["todos", "ultimo-mes", "ultimo-trimestre"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFiltro(f);
                setPagina(1);
              }}
              className={`monetaria-filter-btn${filtro === f ? " active" : ""}`}
            >
              {f === "todos"
                ? "Todos"
                : f === "ultimo-mes"
                ? "Último mes"
                : "Último trimestre"}
            </button>
          ))}
        </nav>

        <div className="tipo-cambio-tabla-shell">
          <table className="tipo-cambio-tabla">
            <caption className="tipo-cambio-tabla-caption">
              Histórico de cotizaciones del tipo de cambio mayorista.
            </caption>

            <thead>
              <tr>
                <th scope="col">
                  Fecha
                </th>

                <th scope="col" className="tipo-cambio-tabla-num">
                  Valor ARS
                </th>

                <th scope="col" className="tipo-cambio-tabla-num">
                  Variación %
                </th>
              </tr>
            </thead>

            <tbody>
              {datosPaginados.map((item, idx) => (
                <tr
                  key={`${item.fecha}-${idx}`}
                  className={idx % 2 === 0 ? "tipo-cambio-tabla-row-even" : "tipo-cambio-tabla-row-odd"}
                >
                  <td>
                    {new Date(item.fecha).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>

                  <td className="tipo-cambio-tabla-num tipo-cambio-tabla-mono">
                    ${Number(item.valor).toFixed(2)}
                  </td>

                  <td
                    className={`tipo-cambio-tabla-num tipo-cambio-tabla-mono ${
                      item.variacion > 0
                        ? "tipo-cambio-tabla-var-up"
                        : item.variacion < 0
                        ? "tipo-cambio-tabla-var-down"
                        : "tipo-cambio-tabla-var-flat"
                    }`}
                  >
                    {item.variacion > 0 ? "+" : ""}
                    {item.variacion.toFixed(4)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer
          aria-label="Paginación de la tabla"
          className="tipo-cambio-tabla-paginacion"
        >
          <p className="tipo-cambio-tabla-resumen">
            Mostrando {datosConIndice.length ? inicio + 1 : 0} a{" "}
            {Math.min(fin, datosConIndice.length)} de {datosConIndice.length}{" "}
            registros
          </p>

          <div className="tipo-cambio-tabla-actions">
            <button
              type="button"
              onClick={handlePaginaAnterior}
              disabled={pagina === 1}
              className="tipo-cambio-tabla-btn"
            >
              ← Anterior
            </button>

            <span
              aria-current="page"
              className="tipo-cambio-tabla-page"
            >
              {pagina} / {totalPaginas}
            </span>

            <button
              type="button"
              onClick={handlePaginaSiguiente}
              disabled={pagina === totalPaginas}
              className="tipo-cambio-tabla-btn"
            >
              Siguiente →
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}

export default TipoCambioTablaSection;
