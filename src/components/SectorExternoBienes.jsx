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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} M`;
}

function formatPeriodo(periodo) {
  if (!periodo) return "—";
  return String(periodo);
}

function SectorExternoBienes() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let estaMontado = true;

    async function cargarDatos() {
      setCargando(true);
      setError(null);

      try {
        const response = await fetch("/api/sector-externo/bienes", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status} al leer sector externo`);
        }

        const payload = await response.json();

        if (!Array.isArray(payload)) {
          throw new Error("El backend debe devolver un arreglo de datos.");
        }

        const ordenado = [...payload]
          .map((item) => ({
            ...item,
            anio: Number(item.anio),
            trimestre: Number(item.trimestre),
            exportaciones: Number(item.exportaciones),
            importaciones: Number(item.importaciones),
            saldo: Number(item.saldo),
          }))
          .filter(
            (item) =>
              Number.isFinite(item.anio) &&
              Number.isFinite(item.trimestre)
          )
          .sort((a, b) => {
            if (a.anio !== b.anio) return a.anio - b.anio;
            return a.trimestre - b.trimestre;
          });

        if (estaMontado) {
          setDatos(ordenado);
        }
      } catch (err) {
        if (estaMontado) {
          setError(err.message || "No se pudieron cargar los datos.");
        }
      } finally {
        if (estaMontado) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      estaMontado = false;
    };
  }, []);

  const datosOrdenados = useMemo(
    () => datos.filter((item) => Number(item.anio) >= 2018),
    [datos]
  );

  const ultimoPeriodo = datosOrdenados[datosOrdenados.length - 1] || null;

  const datosParaGrafico = useMemo(
    () =>
      datosOrdenados.map((item) => ({
        periodo: formatPeriodo(item.periodo),
        exportaciones:
          item.exportaciones != null ? Number(item.exportaciones) : null,
        importaciones:
          item.importaciones != null ? Number(item.importaciones) : null,
        saldo: item.saldo != null ? Number(item.saldo) : null,
      })),
    [datosOrdenados]
  );

  function getExportImportOption(data) {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter(params) {
          if (!Array.isArray(params)) return "";

          const periodo = params[0]?.axisValue ?? "";

          const lines = params
            .filter((item) => item.value != null)
            .map(
              (item) =>
                `${item.marker} ${item.seriesName}: ${formatUSDShort(
                  item.value
                )}`
            );

          return `<div style="font-size:13px"><strong>${periodo}</strong><br/>${lines.join(
            "<br/>"
          )}</div>`;
        },
      },
      legend: { top: 20 },
      grid: {
        left: 32,
        right: 20,
        bottom: 24,
        top: 60,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.periodo),
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter(value) {
            return `${Number(value).toLocaleString("es-AR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })} M`;
          },
        },
      },
      series: [
        {
          name: "Exportaciones",
          type: "bar",
          data: data.map((item) => item.exportaciones),
          itemStyle: { color: "#2563eb" },
          emphasis: { focus: "series" },
        },
        {
          name: "Importaciones",
          type: "bar",
          data: data.map((item) => item.importaciones),
          itemStyle: { color: "#16a34a" },
          emphasis: { focus: "series" },
        },
      ],
    };
  }

  function getSaldoOption(data) {
    return {
      tooltip: {
        trigger: "axis",
        formatter(params) {
          if (!Array.isArray(params)) return "";

          const point = params[0];

          return `<div style="font-size:13px"><strong>${
            point.axisValue
          }</strong><br/>${point.marker} ${
            point.seriesName
          }: ${formatUSDShort(point.value)}</div>`;
        },
      },
      grid: {
        left: 32,
        right: 20,
        bottom: 24,
        top: 50,
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
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })} M`;
          },
        },
      },
      series: [
        {
          name: "Saldo comercial",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: data.map((item) => item.saldo),
          lineStyle: { width: 3, color: "#334155" },
          emphasis: { focus: "series" },
        },
      ],
    };
  }

  return (
    <section>
      <div className="inflation-header">
        <h1>Comercio Exterior de Bienes</h1>
        <p className="dashboard-subtitle">
          Comercio exterior de bienes. Balanza de Pagos - INDEC.
        </p>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card-label">
              Exportaciones último período
            </div>
            <div className="summary-card-sub">Bienes</div>
            <div className="summary-card-value">
              {formatUSD(ultimoPeriodo?.exportaciones)}
            </div>
            <div className="summary-card-foot">
              {ultimoPeriodo
                ? `Periodo ${formatPeriodo(ultimoPeriodo.periodo)}`
                : "Sin datos"}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-label">
              Importaciones último período
            </div>
            <div className="summary-card-sub">Bienes</div>
            <div className="summary-card-value">
              {formatUSD(ultimoPeriodo?.importaciones)}
            </div>
            <div className="summary-card-foot">
              {ultimoPeriodo
                ? `Periodo ${formatPeriodo(ultimoPeriodo.periodo)}`
                : "Sin datos"}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-label">
              Saldo comercial último período
            </div>
            <div className="summary-card-sub">
              Exportaciones menos importaciones
            </div>
            <div className="summary-card-value">
              {formatUSD(ultimoPeriodo?.saldo)}
            </div>
            <div className="summary-card-foot">
              {ultimoPeriodo
                ? `Periodo ${formatPeriodo(ultimoPeriodo.periodo)}`
                : "Sin datos"}
            </div>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="message">Cargando comercio exterior / bienes...</div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : (
        <>
          <div className="dashboard-card" style={{ marginBottom: 24 }}>
            <h2 className="section-title">Exportaciones e importaciones</h2>
            <p className="section-text">
              Evolución trimestral de exportaciones e importaciones de bienes
              desde 2018.
            </p>

            <div style={{ width: "100%", height: 360 }}>
              <ReactECharts
                option={getExportImportOption(datosParaGrafico)}
                style={{ height: "100%" }}
              />
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="section-title">Saldo comercial</h2>
            <p className="section-text">
              Saldo trimestral del comercio de bienes desde 2018.
            </p>

            <div style={{ width: "100%", height: 360 }}>
              <ReactECharts
                option={getSaldoOption(datosParaGrafico)}
                style={{ height: "100%" }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default SectorExternoBienes;