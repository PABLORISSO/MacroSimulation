const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  if (params.desde) query.set("desde", String(params.desde));
  if (params.hasta) query.set("hasta", String(params.hasta));
  if (params.limit) query.set("limit", String(params.limit));

  const q = query.toString();
  return q ? `?${q}` : "";
}

async function fetchComercio(path, params) {
  const response = await fetch(`${BACKEND_URL}${path}${buildQuery(params)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend error ${response.status}`);
  }

  return response.json();
}

export function getImportaciones(params = {}) {
  return fetchComercio("/api/comercio-exterior/importaciones", params);
}

export function getExportaciones(params = {}) {
  return fetchComercio("/api/comercio-exterior/exportaciones", params);
}

export function getDesgloseComercio(params = {}) {
  return fetchComercio("/api/comercio-exterior/desglose", params);
}
