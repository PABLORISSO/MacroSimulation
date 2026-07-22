import { useEffect, useState } from "react";
import BarChart from "../charts/barChart.jsx";
import { getReserves } from "../../services/reserveService";

function ReserveSection() {
  const [dataApi, setDataApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getReserves()
      .then(setDataApi)
      .catch(() => setError("No se pudieron cargar las reservas."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando reservas...</div>;
  if (error) return <div>{error}</div>;
  if (!dataApi) return <div>No hay datos de reservas.</div>;

  const labels = dataApi?.datos?.map((d) => d.fecha.slice(0, 7)) || [];
  const data = dataApi?.datos?.map((d) => d.valor) || [];

  return (
    <section className="dashboard-card">
      <h2>Reservas</h2>

      <div className="data-box">
        <span>Último valor</span>
        <strong>
          {dataApi?.ultimoDato?.valor?.toLocaleString("es-AR") ?? "N/D"}
        </strong>
      </div>

      <BarChart
        title="Reservas internacionales"
        labels={labels}
        data={data}
        highlightColor="#2563eb"
      />
    </section>
  );
}

export default ReserveSection;