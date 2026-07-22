const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getInflacion() {
  const response = await fetch(`${API_URL}/api/inflacion`);

  if (!response.ok) {
    throw new Error("No se pudo obtener la inflación");
  }

  return response.json();
}

export async function getInflacionCategorias() {
  const response = await fetch(`${API_URL}/api/inflacion/categorias`);

  if (!response.ok) {
    throw new Error("No se pudo obtener las categorías de inflación");
  }

  return response.json();
}

export async function getInflacionRegiones() {
  const response = await fetch(`${API_URL}/api/inflacion/regiones`);
  if (!response.ok) throw new Error('No se pudo obtener regiones');
  return response.json();
}

export async function getInflacionRegionesInteranual() {
  const response = await fetch(`${API_URL}/api/inflacion/regiones/interanual`);
  if (!response.ok) throw new Error('No se pudo obtener regiones interanuales');
  return response.json();
}

export async function getInteranualNivelGeneralConceptos() {
  const response = await fetch(`${API_URL}/api/inflacion/interanual/conceptos`);
  if (!response.ok) throw new Error('No se pudo obtener conceptos interanuales');
  return response.json();
}