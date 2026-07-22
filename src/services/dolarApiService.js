const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const DOLAR_API_BASE = "https://dolarapi.com/v1/dolares";
const ARG_DATOS_BASE = "https://api.argentinadatos.com/v1/cotizaciones/dolares";

async function tryFetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar ${url}`);
  }
  return response.json();
}

export async function getDolares() {
  try {
    return await tryFetchJson(`${API_URL}/api/dolares/cotizaciones`);
  } catch {
    // Fallback: consumo directo si backend no está levantado
    const [oficial, blue, mep, ccl, mayorista] = await Promise.allSettled([
      tryFetchJson(`${DOLAR_API_BASE}/oficial`),
      tryFetchJson(`${DOLAR_API_BASE}/blue`),
      tryFetchJson(`${DOLAR_API_BASE}/bolsa`),
      tryFetchJson(`${DOLAR_API_BASE}/contadoconliqui`),
      tryFetchJson(`${DOLAR_API_BASE}/mayorista`),
    ]);

    return {
      oficial: oficial.status === "fulfilled" ? oficial.value : null,
      blue: blue.status === "fulfilled" ? blue.value : null,
      mep: mep.status === "fulfilled" ? mep.value : null,
      ccl: ccl.status === "fulfilled" ? ccl.value : null,
      mayorista: mayorista.status === "fulfilled" ? mayorista.value : null,
    };
  }
}

export async function getHistoricoMep() {
  try {
    return await tryFetchJson(`${API_URL}/api/dolares/historico/mep`);
  } catch {
    return tryFetchJson(`${ARG_DATOS_BASE}/bolsa`);
  }
}

export async function getHistoricoCcl() {
  try {
    return await tryFetchJson(`${API_URL}/api/dolares/historico/ccl`);
  } catch {
    return tryFetchJson(`${ARG_DATOS_BASE}/contadoconliqui`);
  }
}
