import { useEffect, useState } from "react";

function International() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/international/latam")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1>Dashboard Internacional</h1>

      <div className="cards-grid">
        {data.map((pais) => (
          <div
            key={pais.country_code || pais.country}
            className="country-card"
          >
            <h3>{pais.country}</h3>

            <p>
              <strong>PBI:</strong>{" "}
              {pais.pbi
                ? `${(pais.pbi / 1_000_000_000).toFixed(1)} B USD`
                : "N/D"}
            </p>

            <p>
              <strong>PBI per cápita:</strong>{" "}
              {pais.pbi_per_capita
                ? pais.pbi_per_capita.toFixed(0)
                : "N/D"}
            </p>

            <p>
              <strong>Crecimiento:</strong>{" "}
              {pais.crecimiento_pbi
                ? `${pais.crecimiento_pbi.toFixed(1)}%`
                : "N/D"}
            </p>

            <p>
              <strong>Inflación:</strong>{" "}
              {pais.inflacion
                ? `${pais.inflacion.toFixed(1)}%`
                : "N/D"}
            </p>

            <p>
              <strong>Desempleo:</strong>{" "}
              {pais.desempleo
                ? `${pais.desempleo.toFixed(1)}%`
                : "N/D"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default International;