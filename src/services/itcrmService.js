const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Obtiene el Índice de Tipo de Cambio Real Multilateral (ITCRM).
 * @param {Object} options
 * @param {string} [options.desde]     - Fecha de inicio "YYYY-MM-DD"
 * @param {string} [options.frecuencia] - "diaria" | "mensual"
 * @param {number} [options.limit]
 */
export async function getITCRM({ desde, frecuencia = "mensual", limit } = {}) {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (frecuencia) params.set("frecuencia", frecuencia);
  if (limit) params.set("limit", String(limit));

  const res = await fetch(`${API_BASE}/api/itcrm?${params.toString()}`);
  if (!res.ok) throw new Error(`Error al obtener ITCRM: ${res.status}`);
  return res.json();
}
