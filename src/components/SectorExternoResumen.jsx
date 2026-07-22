import { useEffect, useMemo, useState } from "react";

function formatUSD(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "USD —";
  }

  return `USD ${Number(value).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })} M`;
}

function SectorExternoResumen() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/sector-externo/resumen-balanza-pagos", {
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((payload) => {
        const ordenado = [...payload]
          .map((item) => ({
            ...item,
            anio: Number(item.anio),
            trimestre: Number(item.trimestre),
            saldo_cuenta_corriente: Number(item.saldo_cuenta_corriente),
            cuenta_capital: Number(item.cuenta_capital),
            cuenta_financiera: Number(item.cuenta_financiera),
            saldo_global: Number(item.saldo_global),
          }))
          .sort((a, b) => {
            if (a.anio !== b.anio) return a.anio - b.anio;
            return a.trimestre - b.trimestre;
          });

        setDatos(ordenado);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const ultimo = useMemo(() => {
    if (!datos.length) return null;
    return datos[datos.length - 1];
  }, [datos]);

  if (cargando) {
    return <div className="dashboard-card">Cargando resumen externo...</div>;
  }

  if (error) {
    return <div className="dashboard-card">Error: {error}</div>;
  }

  return (
    <div className="dashboard-card" style={{ marginBottom: 24 }}>
      <h2 className="section-title">
        Resumen Ejecutivo
        </h2>

      <p className="section-text">
        Síntesis de cuenta corriente, cuenta capital, cuenta financiera y saldo global.
      </p>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-label">Cuenta Corriente</div>
          <div className="summary-card-value">
            {formatUSD(ultimo?.saldo_cuenta_corriente)}
          </div>
          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Cuenta Capital</div>
          <div className="summary-card-value">
            {formatUSD(ultimo?.cuenta_capital)}
          </div>
          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Cuenta Financiera</div>
          <div className="summary-card-value">
            {formatUSD(ultimo?.cuenta_financiera)}
          </div>
          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Saldo Global</div>
          <div className="summary-card-value">
            {formatUSD(ultimo?.saldo_global)}
          </div>
          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>
      </div>
    </div>
  );
}

export default SectorExternoResumen;