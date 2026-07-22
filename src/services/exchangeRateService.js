const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getTipoCambio({ desde, frecuencia, limit } = {}) {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (frecuencia) params.set("frecuencia", frecuencia);
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const response = await fetch(
    `${API_URL}/api/tipo-cambio${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el tipo de cambio");
  }

  return response.json();
}
