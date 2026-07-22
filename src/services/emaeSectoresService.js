const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function getEmaeSectores() {
  const res = await fetch(`${API_BASE_URL}/api/emae-sectores`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener EMAE sectores");
  return res.json();
}
