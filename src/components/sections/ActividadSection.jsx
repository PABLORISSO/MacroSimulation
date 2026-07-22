import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { getEmae } from "../../services/emaeService";
import {
  getAnalisisActividad,
  getAnalisisActividadDinamica,
} from "../../services/aiAnalysisService";
import { getEmaeSectores } from "../../services/emaeSectoresService";
import "../../styles/macro-module.css";

function ActividadSection() {
  const [emae, setEmae] = useState(null);
  const [error, setError] = useState("");
  const [resumenIa, setResumenIa] = useState("");
  const [loadingResumenIa, setLoadingResumenIa] = useState(false);
  const [resumenDinamicaIa, setResumenDinamicaIa] = useState("");
  const [loadingResumenDinamicaIa, setLoadingResumenDinamicaIa] = useState(false);
  const [sectores, setSectores] = useState(null);
  const nivelesRef = useRef(null);
  const dinamicaRef = useRef(null);
  const sectoresRef = useRef(null);
  const contribucionRef = useRef(null);

  useEffect(() => {
    getEmae()
      .then(setEmae)
      .catch(() => setError("No se pudo cargar actividad económica."));
  }, []);

  useEffect(() => {
    getEmaeSectores()
      .then((data) => setSectores(data?.sectores || []))
      .catch(() => setSectores([]));
  }, []);

  const ultimo = emae?.ultimoDato;

  useEffect(() => {
    let isMounted = true;

    const cargarResumenIa = async () => {
      if (!ultimo?.fecha) return;

      try {
        setLoadingResumenIa(true);
        const data = await getAnalisisActividad({
          fecha: ultimo.fecha,
          varInteranual: Number(ultimo.varInteranual ?? 0),
          varMensual:
            typeof ultimo.varMensual === "number" ? Number(ultimo.varMensual) : 0,
          varTendencia:
            typeof ultimo.varTendencia === "number" ? Number(ultimo.varTendencia) : 0,
          nivelEmae: Number(ultimo.emae ?? 0),
          nivelDesestacionalizado: Number(ultimo.desestacionalizado ?? 0),
          nivelTendencia: Number(ultimo.tendencia ?? 0),
        });

        if (!isMounted) return;
        setResumenIa((data?.analisis || "").replace(/\s+/g, " ").trim());
      } catch {
        if (!isMounted) return;
        setResumenIa("No se pudo generar el resumen con IA en este momento.");
      } finally {
        if (isMounted) setLoadingResumenIa(false);
      }
    };

    cargarResumenIa();

    return () => {
      isMounted = false;
    };
  }, [
    ultimo?.fecha,
    ultimo?.varInteranual,
    ultimo?.varMensual,
    ultimo?.varTendencia,
    ultimo?.emae,
    ultimo?.desestacionalizado,
    ultimo?.tendencia,
  ]);

  useEffect(() => {
    let isMounted = true;

    const cargarResumenDinamicaIa = async () => {
      if (!ultimo?.fecha || !emae?.datos?.length) return;

      try {
        setLoadingResumenDinamicaIa(true);
        const historialReciente = emae.datos
          .slice(-6)
          .map((item) => ({
            fecha: item.fecha,
            varMensual:
              typeof item.varMensual === "number"
                ? Number(item.varMensual.toFixed(2))
                : 0,
            varInteranual:
              typeof item.varInteranual === "number"
                ? Number(item.varInteranual.toFixed(2))
                : 0,
          }));

        const data = await getAnalisisActividadDinamica({
          fecha: ultimo.fecha,
          varInteranual: Number(ultimo.varInteranual ?? 0),
          varMensual:
            typeof ultimo.varMensual === "number" ? Number(ultimo.varMensual) : 0,
          historialReciente,
        });

        if (!isMounted) return;
        setResumenDinamicaIa((data?.analisis || "").replace(/\s+/g, " ").trim());
      } catch {
        if (!isMounted) return;
        setResumenDinamicaIa(
          "No se pudo generar el comentario de dinámica con IA en este momento."
        );
      } finally {
        if (isMounted) setLoadingResumenDinamicaIa(false);
      }
    };

    cargarResumenDinamicaIa();

    return () => {
      isMounted = false;
    };
  }, [emae?.datos, ultimo?.fecha, ultimo?.varInteranual, ultimo?.varMensual]);

  if (error) return <div>{error}</div>;
  if (!emae) return <div>Cargando actividad...</div>;

  const datosCompletos = emae.datos || [];
  const datos = datosCompletos.slice(-36);

  if (!datos.length) {
    return <div>No hay datos de actividad para mostrar.</div>;
  }

  const labels = datos.map((d) => d.fecha.slice(0, 7));
  const serieOriginal = datos.map((d) =>
    typeof d.emae === "number" ? Number(d.emae.toFixed(2)) : null
  );
  const serieDesestacionalizada = datos.map((d) =>
    typeof d.desestacionalizado === "number"
      ? Number(d.desestacionalizado.toFixed(2))
      : null
  );
  const serieTendencia = datos.map((d) =>
    typeof d.tendencia === "number" ? Number(d.tendencia.toFixed(2)) : null
  );
  const serieInteranual = datos.map((d) =>
    typeof d.varInteranual === "number" ? Number(d.varInteranual.toFixed(2)) : null
  );
  const serieMensual = datos.map((d) =>
    typeof d.varMensual === "number" ? Number(d.varMensual.toFixed(2)) : null
  );

  const ultimoMes = ultimo?.fecha ? ultimo.fecha.slice(0, 7) : "-";
  const ultimoEmae =
    typeof ultimo?.emae === "number"
      ? ultimo.emae.toFixed(1)
      : "s/d";
  const ultimoDesestacionalizado =
    typeof ultimo?.desestacionalizado === "number"
      ? ultimo.desestacionalizado.toFixed(1)
      : "s/d";
  const ultimoTendencia =
    typeof ultimo?.tendencia === "number"
      ? ultimo.tendencia.toFixed(1)
      : "s/d";
  const ultimaInteranual =
    typeof ultimo?.varInteranual === "number"
      ? `${ultimo.varInteranual.toFixed(1)}%`
      : "s/d";
  const ultimaMensual =
    typeof ultimo?.varMensual === "number"
      ? `${ultimo.varMensual.toFixed(1)}%`
      : "s/d";
  const ultimaTendenciaMensual =
    typeof ultimo?.varTendencia === "number"
      ? `${ultimo.varTendencia.toFixed(1)}%`
      : "s/d";

  const option = {
    backgroundColor: "transparent",
    title: {
      text: "EMAE - Niveles del índice",
      left: "center",
      top: 12,
      textStyle: {
        color: "#2f2f2f",
        fontSize: 18,
        fontWeight: "normal",
      },
    },
    legend: {
      top: 42,
      left: "center",
      data: ["Serie original", "Desestacionalizada", "Tendencia-ciclo"],
      textStyle: {
        color: "#4a4a4a",
        fontSize: 12,
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#f1efe8",
      borderColor: "#8c8c8c",
      borderWidth: 1,
      textStyle: { color: "#333" },
      valueFormatter: (value) => value,
    },
    grid: {
      left: "8%",
      right: "5%",
      bottom: "15%",
      top: "28%",
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: {
        rotate: 45,
        color: "#555",
        fontSize: 12,
      },
      axisLine: { lineStyle: { color: "#7b7b7b", width: 2 } },
      axisTick: { lineStyle: { color: "#7b7b7b" } },
    },
    yAxis: {
      type: "value",
      min: 120,
      max: 170,
      axisLabel: {
        formatter: "{value}",
        color: "#555",
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#d7d3cc", type: "dashed", width: 1 } },
    },
    series: [
      {
        name: "Serie original",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        data: serieOriginal,
        lineStyle: { width: 2, color: "#505372" },
      },
      {
        name: "Desestacionalizada",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        data: serieDesestacionalizada,
        lineStyle: { width: 2, color: "#6f9ceb" },
      },
      {
        name: "Tendencia-ciclo",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        data: serieTendencia,
        lineStyle: { width: 2, color: "#2a9d8f" },
      },
    ],
  };

  const dinamicaOption = {
    backgroundColor: "transparent",
    title: {
      text: "EMAE - Dinámica",
      left: "center",
      top: 12,
      textStyle: {
        color: "#2f2f2f",
        fontSize: 18,
        fontWeight: "normal",
      },
    },
    legend: {
      top: 42,
      left: "center",
      data: ["Var. interanual", "Var. mensual"],
      textStyle: {
        color: "#4a4a4a",
        fontSize: 12,
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#f1efe8",
      borderColor: "#8c8c8c",
      borderWidth: 1,
      textStyle: { color: "#333" },
      valueFormatter: (value) => `${value}%`,
    },
    grid: {
      left: "8%",
      right: "8%",
      bottom: "15%",
      top: "28%",
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: {
        rotate: 45,
        color: "#555",
        fontSize: 12,
      },
      axisLine: { lineStyle: { color: "#7b7b7b", width: 2 } },
      axisTick: { lineStyle: { color: "#7b7b7b" } },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%",
        color: "#555",
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#d7d3cc", type: "dashed", width: 1 } },
    },
    series: [
      {
        name: "Var. interanual",
        type: "bar",
        data: serieInteranual,
        itemStyle: {
          color: "#505372",
        },
      },
      {
        name: "Var. mensual",
        type: "line",
        smooth: false,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        data: serieMensual,
        lineStyle: { width: 2, color: "#d97706" },
      },
    ],
  };

  // Abreviaciones de sectores para el eje Y
  const SECTORES_CORTOS = {
    "Agricultura, ganadería, caza y silvicultura": "Agro",
    "Pesca": "Pesca",
    "Explotación de minas y canteras": "Minería",
    "Industria manufacturera": "Industria",
    "Electricidad, gas y agua": "Electricidad",
    "Construcción": "Construcción",
    "Comercio mayorista, minorista y reparaciones": "Comercio",
    "Hoteles y restaurantes": "Hoteles/Rest.",
    "Transporte y comunicaciones": "Transporte",
    "Intermediación financiera": "Finanzas",
    "Actividades inmobiliarias, empresariales y de alquiler": "Inmobiliario",
    "Administración pública y defensa; planes de seguridad social de afiliación obligatoria": "Adm. Pública",
    "Enseñanza": "Enseñanza",
    "Servicios sociales y de salud": "Salud",
    "Otras actividades de servicios comunitarios, sociales y personales": "Otros servicios",
    "Impuestos netos de subsidios": "Impuestos netos",
  };

  function sectoresOption(data) {
    // data ya viene ordenado por var_interanual desc
    const nombres = data.map((d) => SECTORES_CORTOS[d.sector] || d.sector);
    const valores = data.map((d) =>
      d.var_interanual !== null ? Number(d.var_interanual.toFixed(2)) : null
    );
    const colores = valores.map((v) =>
      v === null ? "#aaa" : v >= 0 ? "#2a9d8f" : "#e76f51"
    );

    const nombresRev = [...nombres].reverse();
    const valoresRev = [...valores].reverse();
    const coloresRev = [...colores].reverse();

    return {
      backgroundColor: "transparent",
      title: {
        text: `EMAE por sector — var. interanual (${emae?.ultimoDato?.fecha?.slice(0, 7) || ""})`,
        left: "center",
        top: 12,
        textStyle: { color: "#2f2f2f", fontSize: 18, fontWeight: "normal" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#f1efe8",
        borderColor: "#8c8c8c",
        borderWidth: 1,
        textStyle: { color: "#333" },
        valueFormatter: (value) => `${value !== null ? value + "%" : "s/d"}`,
      },
      grid: {
        left: "28%",
        right: "8%",
        top: "20%",
        bottom: "6%",
        containLabel: false,
      },
      xAxis: {
        type: "value",
        axisLabel: { formatter: "{value}%" },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: nombresRev,
        axisLabel: { fontSize: 12, color: "#555" },
        axisLine: { lineStyle: { color: "#7b7b7b", width: 2 } },
        axisTick: { lineStyle: { color: "#7b7b7b" } },
      },
      series: [
        {
          name: "Var. interanual",
          type: "bar",
          barWidth: 20,
          data: valoresRev.map((v, i) => ({
            value: v,
            itemStyle: { color: coloresRev[i] },
          })),
          label: {
            show: true,
            position: "insideRight",
            formatter: (params) =>
              params.value !== null ? `${params.value}%` : "",
            color: "#fff",
            fontSize: 11,
          },
          markLine: {
            silent: true,
            data: [{ xAxis: 0 }],
            lineStyle: { color: "#555", width: 1 },
            label: { show: false },
            symbol: "none",
          },
        },
      ],
    };
  }

  function contribucionSectoresOption(data) {
    const totalIndice = data.reduce(
      (acc, d) => acc + (typeof d.indice === "number" ? d.indice : 0),
      0
    );

    const filas = data
      .map((d) => {
        const nombre = SECTORES_CORTOS[d.sector] || d.sector;
        const varInteranual =
          typeof d.var_interanual === "number" ? d.var_interanual : null;
        const peso =
          totalIndice > 0 && typeof d.indice === "number"
            ? d.indice / totalIndice
            : null;
        const contribucion =
          varInteranual !== null && peso !== null
            ? Number((varInteranual * peso).toFixed(3))
            : null;

        return { nombre, varInteranual, peso, contribucion };
      })
      .filter((f) => f.contribucion !== null)
      .sort((a, b) => b.contribucion - a.contribucion);

    const nombres = filas.map((f) => f.nombre);
    const contribuciones = filas.map((f) => f.contribucion);
    const colores = contribuciones.map((v) =>
      v >= 0 ? "#2a9d8f" : "#e76f51"
    );
    const seriesData = contribuciones.map((v, i) => ({
      value: v,
      itemStyle: { color: colores[i] },
      label: {
        position: v >= 0 ? "right" : "left",
      },
    }));

     return {
       backgroundColor: "transparent",
       title: {
         text: `Contribución por sector (${emae?.ultimoDato?.fecha?.slice(0, 7) || ""})`,
         subtext: "contribución = var. interanual × peso",
         left: "center",
         top: 12,
         textStyle: { color: "#2f2f2f", fontSize: 18, fontWeight: "normal" },
       },
       tooltip: {
         trigger: "axis",
         axisPointer: { type: "shadow" },
         backgroundColor: "#f1efe8",
         borderColor: "#8c8c8c",
         borderWidth: 1,
         textStyle: { color: "#333" },
         formatter: (params) => {
           const p = params?.[0];
           if (!p) return "";
           const fila = filas[p.dataIndex];
           return `${p.name}<br/>Contribución: ${Number(p.value).toFixed(3)} p.p.<br/>Var. interanual: ${fila.varInteranual.toFixed(2)}%<br/>Peso: ${(fila.peso * 100).toFixed(2)}%`;
         },
       },
       grid: {
         left: "8%",
         right: "5%",
        top: "22%",
         bottom: "20%",
         containLabel: true,
       },
       xAxis: {
         type: "category",
         name: "Sectores",
         nameLocation: "middle",
         nameGap: 52,
        nameTextStyle: { fontSize: 12, fontWeight: 600, color: "#555" },
         data: nombres,
         axisLabel: {
           rotate: 40,
           fontSize: 12,
          color: "#555",
           width: 120,
           overflow: "truncate",
         },
         axisLine: { lineStyle: { color: "#7b7b7b", width: 2 } },
         axisTick: { lineStyle: { color: "#7b7b7b" } },
       },
       yAxis: {
         type: "value",
         name: "Contribución (p.p.)",
         nameLocation: "middle",
         nameRotate: 90,
         nameGap: 48,
        nameTextStyle: { fontSize: 12, fontWeight: 600, color: "#555" },
         min: -2,
         max: 2,
         axisLabel: { formatter: "{value} p.p." },
         splitLine: { lineStyle: { color: "#d7d3cc", type: "dashed", width: 1 } },
       },
       series: [
         {
           name: "Contribución",
           type: "bar",
           barWidth: 20,
           barCategoryGap: "35%",
           data: seriesData,
           label: {
             show: true,
             distance: 6,
             position: (params) => (params.value >= 0 ? "top" : "bottom"),
             formatter: (params) => `${Number(params.value).toFixed(2)} p.p.`,
             color: "#374151",
             fontSize: 11,
           },
           markLine: {
             silent: true,
             data: [{ yAxis: 0 }],
             lineStyle: { color: "#555", width: 1 },
             label: { show: false },
             symbol: "none",
           },
         },
       ],
     };
  }

  const altSectores = sectores ? Math.max(420, sectores.length * 32 + 80) : 420;

  return (
    <article className="macro-module macro-module--actividad">
      <header className="module-header">
        <div className="module-header-main">
        

          <h1 className="module-title">EMAE</h1>

          <p className="module-summary">
            Nivel de actividad, dinámica reciente y apertura sectorial de la
            economía argentina.
          </p>
        </div>

        <div className="module-meta">
          <small>
            Último dato: <strong>{ultimoMes}</strong>
          </small>
          <small>Fuente: {emae.fuente}</small>
        </div>
      </header>

      <section className="module-section" aria-labelledby="actividad-kpis-title">
        <header className="module-section-header">
          <h2 id="actividad-kpis-title" className="module-section-title">
            Indicadores principales
          </h2>
        </header>

        <div className="module-kpi-grid module-kpi-grid--four">
          <article className="module-kpi-card module-kpi-card--compact">
            <span className="module-kpi-label">EMAE (nivel)</span>
            <strong className="module-kpi-value">{ultimoEmae}</strong>
            <span className="module-kpi-foot">Serie original | base 2004=100</span>
          </article>

          <article className="module-kpi-card module-kpi-card--compact">
            <span className="module-kpi-label">Desestacionalizado</span>
            <strong className="module-kpi-value">{ultimoDesestacionalizado}</strong>
            <span className="module-kpi-foot">Serie sin estacionalidad</span>
          </article>

          <article className="module-kpi-card module-kpi-card--compact">
            <span className="module-kpi-label">Var. interanual</span>
            <strong className="module-kpi-value">{ultimaInteranual}</strong>
            <span className="module-kpi-foot">vs. mismo mes del año previo</span>
          </article>

          <article className="module-kpi-card module-kpi-card--compact">
            <span className="module-kpi-label">Var. mensual desest.</span>
            <strong className="module-kpi-value">{ultimaMensual}</strong>
            <span className="module-kpi-foot">mes a mes sin estacionalidad</span>
          </article>
        </div>
      </section>

      <section className="module-section" aria-labelledby="actividad-niveles-title">
        <header className="module-section-header">
          <h2 id="actividad-niveles-title" className="module-section-title">
            Niveles del índice
          </h2>
        </header>

        <div ref={nivelesRef} className="module-chart-card">
          <ReactECharts
            option={option}
            style={{ height: "var(--module-chart-height-sm, 340px)", width: "100%" }}
          />
        </div>
      </section>

      <section className="module-section" aria-labelledby="actividad-dinamica-title">
        <header className="module-section-header">
          <h2 id="actividad-dinamica-title" className="module-section-title">
            Dinámica reciente
          </h2>
        </header>

        <div ref={dinamicaRef} className="module-chart-card">
          <ReactECharts
            option={dinamicaOption}
            style={{ height: "var(--module-chart-height-sm, 340px)", width: "100%" }}
          />
        </div>
      </section>

      {sectores && sectores.length > 0 && (
        <section className="module-section" aria-labelledby="actividad-sectores-title">
          <header className="module-section-header">
            <h2 id="actividad-sectores-title" className="module-section-title">
              Apertura sectorial
            </h2>
          </header>

          <div ref={sectoresRef} className="module-chart-card">
            <h3 className="module-section-title">Variación interanual por sector</h3>
            <ReactECharts
              option={sectoresOption(sectores)}
              style={{ height: `${altSectores}px`, width: "100%" }}
            />
          </div>

          <div ref={contribucionRef} className="module-chart-card">
            <h3 className="module-section-title">Contribución por sector</h3>
            <ReactECharts
              option={contribucionSectoresOption(sectores)}
              style={{ height: `${altSectores}px`, width: "100%" }}
            />
          </div>
        </section>
      )}
    </article>
  );
}

export default ActividadSection;