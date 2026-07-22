import { useEffect, useState } from "react";
import BarChart from "../charts/barChart.jsx";
import { getTipoCambio } from "../../services/exchangeRateService";

function ExchangeRateSection() {
  const [dataApi, setDataApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTipoCambio()
      .then(setDataApi)
      .catch(() => setError("No se pudo cargar tipo de cambio."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando tipo de cambio...</div>;
  if (error) return <div>{error}</div>;
  if (!dataApi) return <div>No hay datos de tipo de cambio.</div>;

  const labels = dataApi?.datos?.map((d) => d.fecha.slice(0, 7)) || [];
  const data = dataApi?.datos?.map((d) => d.valor) || [];

  return (
    <section className="dashboard-card">
      <h2>Tipo de cambio oficial</h2>

      <div className="data-box">
        <span>Último valor</span>
        <strong>
          ${dataApi?.ultimoDato?.valor?.toLocaleString("es-AR") ?? "N/D"}
        </strong>
      </div>

      <BarChart
        title="Tipo de cambio oficial"
        labels={labels}
        data={data}
        highlightColor="#111111"
      />
    </section>
  );
}

export default ExchangeRateSection;