import { useEffect, useState } from "react";
import LineChart from "../LineChart";
import { getDolares, getHistoricoMep, getHistoricoCcl } from "../../services/dolarApiService";
import { getTipoCambio } from "../../services/exchangeRateService";
import AIAnalysisCard from "./AIAnalysisCard";
import "../../styles/macro-module.css";

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseLocaleNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;

  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(",", ".")
    : text;

  const n = Number(normalized);
  return Number.isNaN(n) ? null : n;
}

function toIsoDateFromShort(rawDate) {
  const [day, month, year] = String(rawDate).split("/");
  if (!day || !month || !year) return null;
  const fullYear = Number(year) < 100 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseBandasCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const [fechaRaw, infRaw, supRaw] = parseCsvLine(lines[i]);
    const fecha = toIsoDateFromShort(fechaRaw);
    const inf = parseLocaleNumber(infRaw);
    const sup = parseLocaleNumber(supRaw);

    if (!fecha) continue;
    rows.push({ fecha, inf, sup });
  }

  return rows.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

function MonetariaSection() {
  const [exchangeData, setExchangeData] = useState([]);
  const [dolares, setDolares] = useState(null);
  const [mepData, setMepData] = useState([]);
  const [cclData, setCclData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExchangeData = async () => {
      try {
        const [exchangePayload, bandasResponse, dolaresData, mepRaw, cclRaw] = await Promise.all([
          getTipoCambio({ desde: "2025-01-01", frecuencia: "diaria", limit: 600 }),
          fetch("/bandas.csv"),
          getDolares().catch(() => null),
          getHistoricoMep().catch(() => []),
          getHistoricoCcl().catch(() => []),
        ]);

        setDolares(dolaresData);

        const normalizeHistorico = (arr) =>
          Array.isArray(arr)
            ? arr
                .filter((d) => {
                  const year = Number(String(d.fecha).slice(0, 4));
                  return year === 2025 || year === 2026;
                })
                .map((d) => ({ fecha: d.fecha, valor: d.venta ?? d.valor ?? null }))
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            : [];

        setMepData(normalizeHistorico(mepRaw));
        setCclData(normalizeHistorico(cclRaw));

        if (!bandasResponse.ok) {
          throw new Error("Failed to fetch bandas.csv");
        }

        const bandasCsvText = await bandasResponse.text();

        const mayoristaData = (exchangePayload?.datos || [])
          .map((item) => ({
            fecha: item.fecha,
            valor: Number(item.valor),
          }))
          .filter((item) => item.fecha && Number.isFinite(item.valor))
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        const bandasRows = parseBandasCsv(bandasCsvText);
        const bandasMap = new Map(bandasRows.map((row) => [row.fecha, row]));

        const chartData = mayoristaData
          .filter((item) => {
            const year = Number(item.fecha?.slice(0, 4));
            return year === 2025 || year === 2026;
          })
          .map((item) => {
            const bandas = bandasMap.get(item.fecha);
            return {
              ...item,
              inf: bandas?.inf ?? null,
              sup: bandas?.sup ?? null,
            };
          });

        setExchangeData(chartData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading exchange data:", err);
        setError(`Error: ${err.message}`);
        setLoading(false);
      }
    };

    loadExchangeData();
  }, []);

  const latestRate = exchangeData.length > 0 ? exchangeData[exchangeData.length - 1].valor : null;

  const allDates =
    exchangeData.length > 0
      ? exchangeData.map((d) => d.fecha)
      : Array.from(new Set([...mepData.map((d) => d.fecha), ...cclData.map((d) => d.fecha)])).sort();

  const buildSerie = (arr) => {
    const map = new Map(arr.map((d) => [d.fecha, d.valor]));
    return allDates.map((d) => map.get(d) ?? null);
  };

  const chartLabels = allDates;
  const chartValues = buildSerie(exchangeData);
  const infValues = buildSerie(exchangeData.map((d) => ({ fecha: d.fecha, valor: d.inf })));
  const supValues = buildSerie(exchangeData.map((d) => ({ fecha: d.fecha, valor: d.sup })));
  const mepValues = buildSerie(mepData);
  const cclValues = buildSerie(cclData);

  return (
    <section className="module-section">
      <header className="module-section-header">
        <div>
          <h2 className="module-section-title">Política monetaria</h2>
          <p className="module-section-subtitle">
            Seguimiento de la base monetaria, tipos de cambio financieros y
            brechas de mercado.
          </p>
        </div>
      </header>

      <div className="module-kpi-grid">
        <article className="module-kpi-card module-kpi-card--compact">
          <span className="module-kpi-label">Dólar MEP</span>
          <strong className="module-kpi-value">
            ${Number(dolares?.mep?.venta || mepData[mepData.length - 1]?.valor).toFixed(2)}
          </strong>
          <span className="module-kpi-foot">Cotización de cierre</span>
        </article>

        <article className="module-kpi-card module-kpi-card--compact">
          <span className="module-kpi-label">Dólar CCL</span>
          <strong className="module-kpi-value">
            ${Number(dolares?.ccl?.venta || cclData[cclData.length - 1]?.valor).toFixed(2)}
          </strong>
          <span className="module-kpi-foot">Referencia implícita</span>
        </article>

        <article className="module-kpi-card module-kpi-card--compact">
          <span className="module-kpi-label">Brecha</span>
          <strong className="module-kpi-value">
            {(((dolares?.mep?.venta || mepData[mepData.length - 1]?.valor) / latestRate) - 1).toFixed(2) * 100}%
          </strong>
          <span className="module-kpi-foot">vs Mayorista</span>
        </article>
      </div>

      {loading ? (
        <div className="message">Cargando datos...</div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : (
        <section className="module-chart-card chart-section">
          <h3 className="module-section-title">Evolución histórica</h3>
          <LineChart
            labels={chartLabels}
            data={chartValues}
            title="Tipo de Cambio Mayorista"
            series={[
              {
                name: "Banda inferior",
                data: infValues,
                lineStyle: { width: 1.5, type: "dashed", color: "#16a34a" },
                itemStyle: { color: "#16a34a" },
                areaStyle: { color: "transparent" },
                showSymbol: false,
                z: 1,
              },
              {
                name: "Banda superior",
                data: supValues,
                lineStyle: { width: 1.5, type: "dashed", color: "#dc2626" },
                itemStyle: { color: "#dc2626" },
                areaStyle: { color: "rgba(234, 179, 8, 0.15)", origin: "start" },
                showSymbol: false,
                z: 1,
              },
              {
                name: "Mayorista (BCRA)",
                data: chartValues,
                lineStyle: { width: 2.5, color: "#2563eb" },
                itemStyle: { color: "#2563eb" },
                showSymbol: false,
                z: 10,
              },
              {
                name: "MEP",
                data: mepValues,
                lineStyle: { width: 2, color: "#7c3aed" },
                itemStyle: { color: "#7c3aed" },
                showSymbol: false,
                z: 9,
              },
              {
                name: "CCL",
                data: cclValues,
                lineStyle: { width: 2, color: "#db2777" },
                itemStyle: { color: "#db2777" },
                showSymbol: false,
                z: 9,
              },
            ]}
          />
        </section>
      )}

      <AIAnalysisCard
        mepActual={dolares?.mep?.venta ?? mepData[mepData.length - 1]?.valor}
        mayoristActual={latestRate ?? dolares?.mayorista?.venta}
      />
    </section>
  );
}

export default MonetariaSection;