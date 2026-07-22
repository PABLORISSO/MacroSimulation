import { useEffect, useState } from "react";
import BarChart from "../charts/barChart";
import { getInflacionNucleo } from "../../services/nucleoService";

function InflacionNucleoSection() {
  const [nucleo, setNucleo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getInflacionNucleo()
      .then(setNucleo)
      .catch(() => setError("No se pudo cargar la inflación núcleo."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando inflación núcleo...</div>;
  if (error) return <div>{error}</div>;

  const labels = nucleo.map((d) => d.fecha);
  const data = nucleo.map((d) => d.nucleo);

  return (
    <div>
      {labels.length > 0 && (
        <BarChart
          title="Inflación núcleo"
          labels={labels}
          data={data}
          seriesName="Variación mensual"
        />
      )}
    </div>
  );
}

export default InflacionNucleoSection;