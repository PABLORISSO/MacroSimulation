const API_URL = "http://localhost:3000";

export async function getIndicadores() {
  const response = await fetch(`${API_URL}/api/indicadores`);

  if (!response.ok) {
    throw new Error("Error al obtener indicadores");
  }

  return response.json();
}