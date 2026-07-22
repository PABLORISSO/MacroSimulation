const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function fetchAI(endpoint, body = {}) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "";
    try {
      const payload = await response.json();
      detail = payload?.detalle || payload?.error || "";
    } catch {
      detail = "";
    }

    const suffix = detail ? `: ${detail}` : "";
    throw new Error(`Backend error ${response.status}${suffix}`);
  }

  return response.json();
}

export async function getAnalisisDolar({ mepActual, mayoristActual } = {}) {
  try {
    return await fetchAI("/api/analisis-dolar", { mepActual, mayoristActual });
  } catch (err) {
    console.error("Error en getAnalisisDolar:", err.message);
    throw err;
  }
}

export async function getAnalisisAgregados() {
  try {
    return await fetchAI("/api/analisis-agregados");
  } catch (err) {
    console.error("Error en getAnalisisAgregados:", err.message);
    throw err;
  }
}

export async function getAnalisisActividad(payload = {}) {
  try {
    return await fetchAI("/api/analisis-actividad", payload);
  } catch (err) {
    console.error("Error en getAnalisisActividad:", err.message);
    throw err;
  }
}

export async function getAnalisisActividadDinamica(payload = {}) {
  try {
    return await fetchAI("/api/analisis-actividad-dinamica", payload);
  } catch (err) {
    console.error("Error en getAnalisisActividadDinamica:", err.message);
    throw err;
  }
}

export async function chatInflacion({ pregunta, contexto = {}, historial = [] } = {}) {
  try {
    return await fetchAI("/api/chat-inflacion", { pregunta, contexto, historial });
  } catch (err) {
    console.error("Error en chatInflacion:", err.message);
    throw err;
  }
}
