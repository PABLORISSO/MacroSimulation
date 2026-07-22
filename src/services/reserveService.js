const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getReserves() {
  const response = await fetch(`${API_URL}/api/reservas`);

  if (!response.ok) {
    throw new Error("No se pudo obtener reservas");
  }

  return response.json();
}