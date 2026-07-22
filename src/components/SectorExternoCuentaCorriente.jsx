import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";

function formatUSD(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "USD —";
  }

    return `USD ${Number(value).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
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

function SectorExternoCuentaCorriente() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const response = await fetch("/api/sector-externo/cuenta-corriente", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status} al leer cuenta corriente`);
        }

        const payload = await response.json();

        const ordenado = [...payload]
          .map((item) => ({
            ...item,
            anio: Number(item.anio),
            trimestre: Number(item.trimestre),
            saldo_bienes: Number(item.saldo_bienes),
            saldo_servicios: Number(item.saldo_servicios),
            saldo_ingreso_primario: Number(item.saldo_ingreso_primario),
            saldo_ingreso_secundario: Number(item.saldo_ingreso_secundario),
            saldo_cuenta_corriente: Number(item.saldo_cuenta_corriente),
          }))
          .sort((a, b) => {
            if (a.anio !== b.anio) return a.anio - b.anio;
            return a.trimestre - b.trimestre;
          });

        setDatos(ordenado);
      } catch (err) {
        setError(err.message || "No se pudo cargar cuenta corriente.");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  const datosDesde2018 = useMemo(
    () => datos.filter((item) => Number(item.anio) >= 2018),
    [datos]
  );

  const ultimo = datosDesde2018[datosDesde2018.length - 1] || null;

  const serieHistorica = useMemo(
    () =>
      datosDesde2018.map((item) => ({
        periodo: item.periodo,
        saldo: item.saldo_cuenta_corriente,
      })),
    [datosDesde2018]
  );

  const waterfallData = useMemo(() => {
    if (!ultimo) return [];

    return [
      { nombre: "Bienes", valor: ultimo.saldo_bienes },
      { nombre: "Servicios", valor: ultimo.saldo_servicios },
      { nombre: "Ingreso primario", valor: ultimo.saldo_ingreso_primario },
      { nombre: "Ingreso secundario", valor: ultimo.saldo_ingreso_secundario },
      { nombre: "Cuenta corriente", valor: ultimo.saldo_cuenta_corriente },
    ];
  }, [ultimo]);

  function getHistoricoOption(data) {
    return {
      tooltip: {
        trigger: "axis",
        formatter(params) {
          const p = params?.[0];
          if (!p) return "";
          return `<strong>${p.axisValue}</strong><br/>${p.marker} Cuenta corriente: ${formatUSDShort(
            p.value
          )}`;
        },
      },
      grid: { left: 40, right: 20, top: 40, bottom: 30, containLabel: true },
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
          name: "Cuenta corriente",
          type: "line",
          smooth: false,
          showSymbol: false,
          data: data.map((item) => item.saldo),
          lineStyle: { width: 3, color: "#0f172a" },
        },
      ],
    };
  }

  function getWaterfallOption(data) {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter(params) {
          const p = params.find((x) => x.seriesName === "Valor");
          if (!p) return "";
          return `<strong>${p.name}</strong><br/>${p.marker} ${formatUSDShort(
            p.value
          )}`;
        },
      },
      grid: { left: 40, right: 20, top: 40, bottom: 30, containLabel: true },
      xAxis: {
        type: "category",
        data: data.map((item) => item.nombre),
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
          name: "Valor",
          type: "bar",
          data: data.map((item) => item.valor),
          itemStyle: {
            color(params) {
              return params.value >= 0 ? "#2563eb" : "#dc2626";
            },
          },
        },
      ],
    };
  }

  if (cargando) {
    return <div className="message">Cargando cuenta corriente...</div>;
  }

  if (error) {
    return <div className="message error">{error}</div>;
  }

  return (
    <section style={{ marginBottom: 32 }}>
      <div className="inflation-header">
        <h2>Cuenta Corriente</h2>
        <p className="dashboard-subtitle">
          Bienes, servicios, ingreso primario e ingreso secundario. Balanza de
          Pagos - INDEC.
        </p>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card-label">Cuenta corriente</div>
            <div className="summary-card-sub">Saldo total</div>
            <div className="summary-card-value">
              {formatUSD(ultimo?.saldo_cuenta_corriente)}
            </div>
            <div className="summary-card-foot">
              {ultimo ? `Periodo ${ultimo.periodo}` : "Sin datos"}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-label">Bienes</div>
            <div className="summary-card-sub">Saldo</div>
            <div className="summary-card-value">
              {formatUSD(ultimo?.saldo_bienes)}
            </div>
            <div className="summary-card-foot">
              {ultimo ? `Periodo ${ultimo.periodo}` : "Sin datos"}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-label">Servicios</div>
            <div className="summary-card-sub">Saldo</div>
            <div className="summary-card-value">
              {formatUSD(ultimo?.saldo_servicios)}
            </div>
            <div className="summary-card-foot">
              {ultimo ? `Periodo ${ultimo.periodo}` : "Sin datos"}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-label">Ingreso primario</div>
            <div className="summary-card-sub">Rentas netas</div>
            <div className="summary-card-value">
              {formatUSD(ultimo?.saldo_ingreso_primario)}
            </div>
            <div className="summary-card-foot">
              {ultimo ? `Periodo ${ultimo.periodo}` : "Sin datos"}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-label">Ingreso secundario</div>
            <div className="summary-card-sub">Transferencias netas</div>
            <div className="summary-card-value">
              {formatUSD(ultimo?.saldo_ingreso_secundario)}
            </div>
            <div className="summary-card-foot">
              {ultimo ? `Periodo ${ultimo.periodo}` : "Sin datos"}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Evolución de la cuenta corriente</h2>
        <p className="section-text">Saldo trimestral desde 2018.</p>
        <div style={{ width: "100%", height: 360 }}>
          <ReactECharts
            option={getHistoricoOption(serieHistorica)}
            style={{ height: "100%" }}
          />
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="section-title">Composición del último trimestre</h2>
        <p className="section-text">
          Aporte de cada componente al saldo de cuenta corriente.
        </p>
        <div style={{ width: "100%", height: 360 }}>
          <ReactECharts
            option={getWaterfallOption(waterfallData)}
            style={{ height: "100%" }}
          />
        </div>
      </div>
    </section>
  );
}

export default SectorExternoCuentaCorriente;