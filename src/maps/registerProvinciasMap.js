import * as echarts from "echarts";
import provincias from "./provincias.json";

let geojsonProcesado = null;

function promedioLatitud(coords) {
  let suma = 0;
  let cantidad = 0;

  const recorrer = (arr) => {
    if (!Array.isArray(arr)) return;

    if (
      arr.length >= 2 &&
      typeof arr[0] === "number" &&
      typeof arr[1] === "number"
    ) {
      suma += arr[1];
      cantidad += 1;
      return;
    }

    for (const item of arr) {
      recorrer(item);
    }
  };

  recorrer(coords);
  return cantidad ? suma / cantidad : -90;
}

function quitarAntartida(geojson) {
  const copia = structuredClone(geojson);

  copia.features = (copia.features || [])
    .map((feature) => {
      const geometry = feature?.geometry;
      if (!geometry) return feature;

      if (geometry.type === "MultiPolygon") {
        const multipoligonosFiltrados = (geometry.coordinates || []).filter(
          (polygon) => promedioLatitud(polygon) > -60
        );

        return {
          ...feature,
          geometry: {
            ...geometry,
            coordinates: multipoligonosFiltrados,
          },
        };
      }

      if (geometry.type === "Polygon") {
        if (promedioLatitud(geometry.coordinates) <= -60) {
          return null;
        }
      }

      return feature;
    })
    .filter(
      (feature) =>
        feature &&
        feature.geometry &&
        (!(feature.geometry.type === "MultiPolygon") ||
          feature.geometry.coordinates.length > 0)
    );

  return copia;
}

export function registerProvinciasMap() {
  if (echarts.getMap("argentina-provincias")) {
    return true;
  }

  const esGeojsonValido =
    provincias &&
    typeof provincias === "object" &&
    Array.isArray(provincias.features) &&
    provincias.features.length > 0;

  if (!esGeojsonValido) {
    console.error(
      "El archivo provincias.geojson está vacío o no tiene formato GeoJSON válido."
    );
    return false;
  }

  if (!geojsonProcesado) {
    geojsonProcesado = quitarAntartida(provincias);
  }

  echarts.registerMap("argentina-provincias", geojsonProcesado);
  return true;
}