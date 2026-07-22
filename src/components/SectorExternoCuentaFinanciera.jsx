import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";

function formatUSD(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "USD —";
  }

  return `USD ${Number(value).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })} M`;
}

function formatUSDShort(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Number(value).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })} M`;
}

function SectorExternoCuentaFinanciera() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/sector-externo/cuenta-financiera")
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Error ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        const ordenado = [...data]
          .map((item) => ({
            ...item,
            anio: Number(item.anio),
            trimestre: Number(item.trimestre),
            cuenta_financiera: Number(item.cuenta_financiera),
            inversion_directa: Number(item.inversion_directa),
            inversion_cartera: Number(item.inversion_cartera),
            otra_inversion: Number(item.otra_inversion),
            activos_reserva: Number(item.activos_reserva),
          }))
          .sort((a, b) => {
            if (a.anio !== b.anio) return a.anio - b.anio;
            return a.trimestre - b.trimestre;
          });

        setDatos(ordenado);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  const ultimo = useMemo(() => {
    if (!datos.length) return null;
    return datos[datos.length - 1];
  }, [datos]);

  const datosDesde2018 = useMemo(
  () => datos.filter((item) => Number(item.anio) >= 2018),
  [datos]
);

const serieHistorica = useMemo(
  () =>
    datosDesde2018.map((item) => ({
      periodo: item.periodo,
      cuentaFinanciera: item.cuenta_financiera,
    })),
  [datosDesde2018]
);


function getHistoricoOption(data) {
  return {
    tooltip: {
      trigger: "axis",
      formatter(params) {
        const p = params?.[0];
        if (!p) return "";
        return `<strong>${p.axisValue}</strong><br/>${p.marker} Cuenta financiera: ${formatUSDShort(
          p.value
        )}`;
      },
    },
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 30,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.periodo),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter(value) {
          return `${Number(value).toLocaleString("es-AR", {
            maximumFractionDigits: 0,
          })} M`;
        },
      },
    },
    series: [
      {
        name: "Cuenta financiera",
        type: "line",
        smooth: false,
        showSymbol: false,
        data: data.map((item) => item.cuentaFinanciera),
        lineStyle: {
          width: 3,
          color: "#0f172a",
        },
        emphasis: {
          focus: "series",
        },
      },
    ],
  };
}


  if (cargando) {
    return (
      <div className="dashboard-card">
        Cargando cuenta financiera...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card">
        Error: {error}
      </div>
    );
  }

return (
  <section style={{ marginBottom: 32 }}>
    <div className="dashboard-card" style={{ marginBottom: 24 }}>
      <h2 className="section-title">Cuenta Financiera</h2>

      <p className="section-text">
        Flujos financieros con el exterior.
      </p>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-label">Cuenta Financiera</div>

          <div className="summary-card-value">
            {formatUSD(ultimo?.cuenta_financiera)}
          </div>

          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Inversión Directa</div>

          <div className="summary-card-value">
            {formatUSD(ultimo?.inversion_directa)}
          </div>

          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Inversión de Cartera</div>

          <div className="summary-card-value">
            {formatUSD(ultimo?.inversion_cartera)}
          </div>

          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Otra Inversión</div>

          <div className="summary-card-value">
            {formatUSD(ultimo?.otra_inversion)}
          </div>

          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Reservas</div>

          <div className="summary-card-value">
            {formatUSD(ultimo?.activos_reserva)}
          </div>

          <div className="summary-card-foot">{ultimo?.periodo}</div>
        </div>
      </div>
    </div>

    <div className="dashboard-card">
      <h2 className="section-title">
        Evolución de la cuenta financiera
      </h2>

      <p className="section-text">
        Saldo trimestral de la cuenta financiera desde 2018.
      </p>

      <div style={{ width: "100%", height: 360 }}>
        <ReactECharts
          option={getHistoricoOption(serieHistorica)}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  </section>
);
}

export default SectorExternoCuentaFinanciera;