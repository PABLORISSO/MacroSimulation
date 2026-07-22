const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let ipimSeriesCache = null;
let ipimFullCache = null;

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function getFieldVariant(row, variants) {
  for (const k of variants) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] !== undefined && row[k] !== "") {
      return row[k];
    }
  }
  return undefined;
}

function formatMonthLabel(fecha) {
  if (!fecha) return "";
  const [year, month] = fecha.split("-");
  return `${year}-${month}`;
}

async function fetchIpimJson(pathname) {
  const response = await fetch(`${API_URL}${pathname}`);
  if (!response.ok) {
    throw new Error(`No se pudo obtener IPIM (${response.status})`);
  }
  return response.json();
}

async function loadCsv() {
  if (!ipimFullCache) {
    ipimFullCache = fetchIpimJson("/api/ipim/full")
      .then((json) => json?.datos || [])
      .catch((error) => {
        ipimFullCache = null;
        throw error;
      });
  }
  return ipimFullCache;
}

function parseCsvValue(value) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();

  if (
    !text ||
    text === "///" ||
    text === "-" ||
    text === " - " ||
    text.toLowerCase() === "s" ||
    text.includes("///")
  ) {
    return null;
  }

  const normalized = text.replace(",", ".");
  const n = Number(normalized);
  return Number.isNaN(n) ? null : n;
}

function normalizeRow(row) {
  return {
    fecha: row.fecha,
    anio: row.anio,
    mes: row.mes,

    ipi_manufacturero: parseCsvValue(
      getFieldVariant(row, ["ipi_manufacturero", "ipim", "ipi", "IPI Manufacturero"])
    ),
    ipi_var_mensual: parseCsvValue(getFieldVariant(row, ["ipi_var_mensual"])),

    alimentos_bebidas: parseCsvValue(
      getFieldVariant(row, ["alimentos_bebidas", "Alimentos y bebidas"])
    ),
    alimentos_bebidas_var_mensual: parseCsvValue(
      getFieldVariant(row, ["alimentos_bebidas_var_mensual"])
    ),

    productos_tabaco: parseCsvValue(
      getFieldVariant(row, ["productos_tabaco", "Productos de tabaco"])
    ),
    productos_tabaco_var_mensual: parseCsvValue(
      getFieldVariant(row, ["productos_tabaco_var_mensual"])
    ),

    productos_textiles: parseCsvValue(
      getFieldVariant(row, ["productos_textiles", "Productos textiles"])
    ),
    productos_textiles_var_mensual: parseCsvValue(
      getFieldVariant(row, ["productos_textiles_var_mensual"])
    ),

    prendas_vestir_cuero_calzado: parseCsvValue(
      getFieldVariant(row, ["prendas_vestir_cuero_calzado", "Prendas de vestir, cuero y calzado"])
    ),
    prendas_vestir_cuero_calzado_var_mensual: parseCsvValue(
      getFieldVariant(row, ["prendas_vestir_cuero_calzado_var_mensual"])
    ),

    madera_papel_edicion_impresion: parseCsvValue(
      getFieldVariant(row, ["madera_papel_edicion_impresion", "Madera, papel, edición e impresión"])
    ),
    madera_papel_edicion_impresion_var_mensual: parseCsvValue(
      getFieldVariant(row, ["madera_papel_edicion_impresion_var_mensual"])
    ),

    refinacion_petroleo_coque_combustible_nuclear: parseCsvValue(
      getFieldVariant(row, [
        "refinacion_petroleo_coque_combustible_nuclear",
        "Refinación del petróleo, coque y combustible nuclear",
      ])
    ),
    refinacion_petroleo_coque_combustible_nuclear_var_mensual: parseCsvValue(
      getFieldVariant(row, ["refinacion_petroleo_coque_combustible_nuclear_var_mensual"])
    ),

    sustancias_productos_quimicos: parseCsvValue(
      getFieldVariant(row, ["sustancias_productos_quimicos", "Sustancias y productos químicos"])
    ),
    sustancias_productos_quimicos_var_mensual: parseCsvValue(
      getFieldVariant(row, ["sustancias_productos_quimicos_var_mensual"])
    ),

    productos_caucho_plastico: parseCsvValue(
      getFieldVariant(row, ["productos_caucho_plastico", "Productos de caucho y plástico"])
    ),
    productos_caucho_plastico_var_mensual: parseCsvValue(
      getFieldVariant(row, ["productos_caucho_plastico_var_mensual"])
    ),

    productos_minerales_no_metalicos: parseCsvValue(
      getFieldVariant(row, ["productos_minerales_no_metalicos", "Productos minerales no metálicos"])
    ),
    productos_minerales_no_metalicos_var_mensual: parseCsvValue(
      getFieldVariant(row, ["productos_minerales_no_metalicos_var_mensual"])
    ),

    industrias_metalicas_basicas: parseCsvValue(
      getFieldVariant(row, ["industrias_metalicas_basicas", "Industrias metálicas básicas"])
    ),
    industrias_metalicas_basicas_var_mensual: parseCsvValue(
      getFieldVariant(row, ["industrias_metalicas_basicas_var_mensual"])
    ),

    productos_metal: parseCsvValue(
      getFieldVariant(row, ["productos_metal", "Productos metal", "Productos_metal", "Productos de metal"])
    ),
    productos_metal_var_mensual: parseCsvValue(getFieldVariant(row, ["productos_metal_var_mensual"])),

    maquinaria_equipo: parseCsvValue(
      getFieldVariant(row, ["maquinaria_equipo", "Maquinaria y equipo"])
    ),
    maquinaria_equipo_var_mensual: parseCsvValue(getFieldVariant(row, ["maquinaria_equipo_var_mensual"])),

    otros_equipos_aparatos_instrumentos: parseCsvValue(
      getFieldVariant(row, ["otros_equipos_aparatos_instrumentos", "Otros equipos, aparatos e instrumentos"])
    ),
    otros_equipos_aparatos_instrumentos_var_mensual: parseCsvValue(
      getFieldVariant(row, ["otros_equipos_aparatos_instrumentos_var_mensual"])
    ),

    vehiculos_automotores_autopartes: parseCsvValue(
      getFieldVariant(row, [
        "vehiculos_automotores_autopartes",
        "Vehículos automotores, carrocerías, remolques y autopartes",
      ])
    ),
    vehiculos_automotores_autopartes_var_mensual: parseCsvValue(
      getFieldVariant(row, ["vehiculos_automotores_autopartes_var_mensual"])
    ),

    otro_equipo_transporte: parseCsvValue(
      getFieldVariant(row, ["otro_equipo_transporte", "Otro equipo de transporte"])
    ),
    otro_equipo_transporte_var_mensual: parseCsvValue(
      getFieldVariant(row, ["otro_equipo_transporte_var_mensual"])
    ),

    muebles_colchones_otras_manufactureras: parseCsvValue(
      getFieldVariant(row, [
        "muebles_colchones_otras_manufactureras",
        "Muebles y colchones, y otras industrias manufactureras",
      ])
    ),
    muebles_colchones_otras_manufactureras_var_mensual: parseCsvValue(
      getFieldVariant(row, ["muebles_colchones_otras_manufactureras_var_mensual"])
    ),
  };
}

export async function getIpimRawData() {
  const rows = await loadCsv();
  return rows
    .map(normalizeRow)
    .filter((row) => row.fecha && row.ipi_manufacturero !== null);
}

async function getIpimSeriesFromCsv() {
  if (!ipimSeriesCache) {
    ipimSeriesCache = fetchIpimJson("/api/ipim/variaciones")
      .then((json) => json?.datos || [])
      .catch((error) => {
        ipimSeriesCache = null;
        throw error;
      });
  }

  const rows = await ipimSeriesCache;
  return rows
    .map((r) => {
      const fecha = r.fecha;
      const serieOriginal = parseNumber(r.serie_original ?? r.ipim);
      const serieDesestacionalizada = parseNumber(
        r.serie_desestacionalizada ?? r.serie_original ?? r.ipim
      );
      const serieTendenciaCiclo = parseNumber(r.serie_tendencia_ciclo);
      const serieOriginalYoy = parseNumber(r.serie_original_yoy);
      const serieOriginalYtdYoy = parseNumber(r.serie_original_ytd_yoy);
      const serieDesestacionalizadaMom = parseNumber(r.serie_desestacionalizada_mom);

      return {
        fecha,
        serieOriginal,
        serieDesestacionalizada,
        serieTendenciaCiclo,
        serieOriginalYoy,
        serieOriginalYtdYoy,
        serieDesestacionalizadaMom,
      };
    })
    .filter((r) => r.fecha && r.serieOriginal !== null);
}

export async function getIpimGeneral() {
  const rows = await getIpimSeriesFromCsv();

  return rows.map((row, index) => {
    const anterior = rows[index - 1];
    const baseActual = row.serieDesestacionalizada;
    const baseAnterior = anterior?.serieDesestacionalizada;
    const varMensual =
      index === 0 || baseActual === null || baseAnterior === null || baseAnterior === 0
        ? null
        : Number((((baseActual - baseAnterior) / baseAnterior) * 100).toFixed(2));

    return {
      fecha: row.fecha,
      label: formatMonthLabel(row.fecha),
      valor: row.serieOriginal,
      serieOriginal: row.serieOriginal,
      serieDesestacionalizada: row.serieDesestacionalizada,
      serieTendenciaCiclo: row.serieTendenciaCiclo,
      varMensual,
    };
  });
}

export async function getUltimoDatoIpim() {
  const data = await getIpimGeneral();
  const ultimo = data[data.length - 1];

  if (!ultimo) return null;

  return {
    fecha: ultimo.fecha,
    valor: ultimo.valor,
    varMensual: ultimo.varMensual,
  };
}

export async function getIPIM() {
  const serie = await getIpimGeneral();

  return {
    datos: serie.map((item) => ({
      fecha: item.fecha,
      ipim: item.valor,
    })),
  };
}

const SECTOR_CONFIG = [
  { nombre: "Alimentos y bebidas", corto: "Alimentos", valorKey: "alimentos_bebidas" },
  { nombre: "Productos de tabaco", corto: "Tabaco", valorKey: "productos_tabaco" },
  { nombre: "Productos textiles", corto: "Textil", valorKey: "productos_textiles" },
  { nombre: "Prendas de vestir, cuero y calzado", corto: "Indumentaria", valorKey: "prendas_vestir_cuero_calzado" },
  { nombre: "Madera, papel, edición e impresión", corto: "Papel y edición", valorKey: "madera_papel_edicion_impresion" },
  { nombre: "Refinación del petróleo", corto: "Refinación", valorKey: "refinacion_petroleo_coque_combustible_nuclear" },
  { nombre: "Sustancias y productos químicos", corto: "Químicos", valorKey: "sustancias_productos_quimicos" },
  { nombre: "Productos de caucho y plástico", corto: "Caucho y plástico", valorKey: "productos_caucho_plastico" },
  { nombre: "Productos minerales no metálicos", corto: "Minerales no metálicos", valorKey: "productos_minerales_no_metalicos" },
  { nombre: "Industrias metálicas básicas", corto: "Metálicas básicas", valorKey: "industrias_metalicas_basicas" },
  { nombre: "Productos de metal", corto: "Metal", valorKey: "productos_metal" },
  { nombre: "Maquinaria y equipo", corto: "Maquinaria", valorKey: "maquinaria_equipo" },
  { nombre: "Vehículos automotores y autopartes", corto: "Automotriz", valorKey: "vehiculos_automotores_autopartes" },
  { nombre: "Otro equipo de transporte", corto: "Transporte", valorKey: "otro_equipo_transporte" },
  { nombre: "Muebles y otras manufactureras", corto: "Muebles", valorKey: "muebles_colchones_otras_manufactureras" },
];

export async function getIpimHeatmapData() {
  const data = await getIpimRawData();
  const rows = data
    .filter((row) => row.fecha)
    .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));

  if (!rows.length) {
    return {
      months: [],
      sectors: [],
      values: [],
      maxAbs: 5,
      expansionShare: null,
      latestMonth: null,
    };
  }

  const yoyRows = rows
    .map((row, index) => {
      if (index < 12) return null;
      return {
        fecha: row.fecha,
        valores: SECTOR_CONFIG.reduce((acc, sector) => {
          const currentValue = row[sector.valorKey];
          const previousYearValue = rows[index - 12]?.[sector.valorKey];

          if (
            currentValue !== null &&
            previousYearValue !== null &&
            Number.isFinite(currentValue) &&
            Number.isFinite(previousYearValue) &&
            previousYearValue !== 0
          ) {
            acc[sector.valorKey] = Number(
              ((((currentValue - previousYearValue) / previousYearValue) * 100).toFixed(2))
            );
          } else {
            acc[sector.valorKey] = null;
          }

          return acc;
        }, {}),
      };
    })
    .filter(Boolean);

  const recentRows = yoyRows.slice(-24);
  const months = recentRows.map((row) => row.fecha);
  const latestRow = recentRows[recentRows.length - 1] ?? null;

  const orderedSectors = [...SECTOR_CONFIG].sort((a, b) => {
    const aVal = latestRow?.valores?.[a.valorKey];
    const bVal = latestRow?.valores?.[b.valorKey];
    return (bVal ?? -999) - (aVal ?? -999);
  });

  const sectors = orderedSectors.map((sector) => sector.corto);
  const values = [];

  orderedSectors.forEach((sector, sectorIndex) => {
    recentRows.forEach((row, monthIndex) => {
      const yoyValue = row.valores[sector.valorKey];
      if (yoyValue !== null && Number.isFinite(yoyValue)) {
        values.push([monthIndex, sectorIndex, yoyValue]);
      }
    });
  });

  const maxAbs = values.length
    ? Math.max(5, Math.ceil(Math.max(...values.map((item) => Math.abs(item[2])))))
    : 5;

  const latestAvailableValues = orderedSectors
    .map((sector) => latestRow?.valores?.[sector.valorKey])
    .filter((value) => Number.isFinite(value));

  const expansionShare = latestAvailableValues.length
    ? Math.round(
        (latestAvailableValues.filter((value) => value > 0).length / latestAvailableValues.length) * 100
      )
    : null;

  return {
    months,
    sectors,
    values,
    maxAbs,
    expansionShare,
    latestMonth: latestRow?.fecha ?? null,
  };
}

export async function getSectoresUltimoMes() {
  const data = await getIpimRawData();
  const ultimo = data[data.length - 1];

  if (!ultimo) return [];

  const ultimoYm = ultimo.fecha?.slice(0, 7);
  const ultimoYear = Number(ultimoYm?.slice(0, 4));
  const ultimoMonth = ultimoYm?.slice(5, 7);
  const targetYm = ultimoYear
    ? `${String(ultimoYear - 1).padStart(4, "0")}-${ultimoMonth}`
    : null;

  const anualRow = targetYm
    ? data.find((r) => r.fecha?.slice(0, 7) === targetYm)
    : null;

  return SECTOR_CONFIG.map((sector) => {
    const valor = ultimo[sector.valorKey];

    let varAnual = null;
    if (anualRow) {
      const valorAnual = anualRow[sector.valorKey];
      if (valorAnual !== null && valor !== null && valorAnual !== 0) {
        varAnual = Number((((valor - valorAnual) / valorAnual) * 100).toFixed(2));
      }
    }

    return {
      sector: sector.nombre,
      fecha: ultimo.fecha,
      valor,
      varMensual: valor, // en este CSV el valor YA es la variación mensual
      varAnual,
    };
  })
    .filter((item) => item.valor !== null)
    .sort((a, b) => (b.varMensual ?? -999) - (a.varMensual ?? -999));
}

export async function getSerieSector(valorKey, varKey = null) {
  const data = await getIpimRawData();

  return data.map((row) => ({
    fecha: row.fecha,
    label: formatMonthLabel(row.fecha),
    valor: row[valorKey],
    varMensual: varKey ? row[varKey] : null,
  }));
}

export function getResumenActividad(sectores) {
  if (!sectores?.length) return "Sin datos disponibles.";

  const positivos = sectores.filter((s) => (s.varMensual ?? 0) > 0).length;
  const negativos = sectores.filter((s) => (s.varMensual ?? 0) < 0).length;

  if (positivos >= 11) return "Mejora bastante generalizada entre sectores.";
  if (negativos >= 11) return "Caída bastante generalizada entre sectores.";
  if (positivos > negativos) return "Rebote parcial, pero no uniforme.";
  if (negativos > positivos) return "Debilidad sectorial predominante.";
  return "Panorama mixto, sin señal clara.";
}

export async function getAnnualVariationFromIpimCsv() {
  const series = await getIpimSeriesFromCsv();
  const rows = series.filter((r) => r.fecha && r.serieOriginal !== null);
  if (!rows.length) return null;

  const ultimo = rows[rows.length - 1];

  return {
    fecha: ultimo.fecha,
    valor: ultimo.serieOriginal,
    varAnual: ultimo.serieOriginalYoy,
    varAcumuladaAnual: ultimo.serieOriginalYtdYoy,
  };
}

export async function getMonthlyVariationFromIpimCsv() {
  const series = await getIpimSeriesFromCsv();
  const rows = series.filter((r) => r.fecha && r.serieDesestacionalizada !== null);
  if (!rows.length) return null;

  const ultimo = rows[rows.length - 1];

  return {
    fecha: ultimo.fecha,
    valor: ultimo.serieDesestacionalizada,
    varMensual: ultimo.serieDesestacionalizadaMom,
  };
}

export async function getSectoresMovimientoNivel() {
  const data = await getIpimRawData();
  if (data.length < 2) return [];

  const ultimo = data[data.length - 1];
  const anterior = data[data.length - 2];

  return SECTOR_CONFIG.map((sector) => {
    const valUlt = ultimo[sector.valorKey];
    const valAnt = anterior[sector.valorKey];
    const varNivel = valAnt === null || valUlt === null ? null : (valUlt - valAnt) / (valAnt === 0 ? 1 : valAnt) * 100;

    return {
      sector: sector.nombre,
      fecha: ultimo.fecha,
      valor: valUlt,
      varNivel: varNivel === null ? null : Number(varNivel.toFixed(2)),
      varAbs: valUlt === null || valAnt === null ? null : Number((valUlt - valAnt).toFixed(2)),
    };
  });
}