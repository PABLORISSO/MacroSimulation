const BACKEND_URL = "http://localhost:3000";

export async function getAgregadosMonetarios({ desde = "2024-01-01", frecuencia = "mensual", limit } = {}) {
  const params = new URLSearchParams({ desde, frecuencia });
  if (limit) params.set("limit", limit);

  try {
    const response = await fetch(`${BACKEND_URL}/api/agregados-monetarios?${params}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Backend error ${response.status}`);
    return response.json();
  } catch (err) {
    console.warn("Backend no disponible para agregados monetarios:", err.message);
    throw err;
  }
}

export async function getCatalogoMonetario() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/agregados-monetarios/catalogo`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Backend error ${response.status}`);
    return response.json();
  } catch (err) {
    console.warn("Backend no disponible para catálogo monetario:", err.message);
    throw err;
  }
}
