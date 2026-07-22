const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getConsumo() {
  const response = await fetch(`${API_URL}/api/consumo?t=${Date.now()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la información de consumo");
  }

  return response.json();
}
