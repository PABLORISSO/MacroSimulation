import { useState } from "react";
import "../styles/dashboard.css";
import "../styles/International.css";

function Internacional() {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-title">Economía Internacional</div>
        <p className="dashboard-subtitle">Indicadores económicos globales y relaciones comerciales</p>

        {/* Tabs de navegación */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
          <button
            onClick={() => setSelectedTab("overview")}
            style={{
              padding: "10px 16px",
              background: selectedTab === "overview" ? "#3b82f6" : "transparent",
              color: selectedTab === "overview" ? "#fff" : "#6b7280",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontWeight: selectedTab === "overview" ? "600" : "500",
            }}
          >
            Resumen
          </button>
          <button
            onClick={() => setSelectedTab("socios")}
            style={{
              padding: "10px 16px",
              background: selectedTab === "socios" ? "#3b82f6" : "transparent",
              color: selectedTab === "socios" ? "#fff" : "#6b7280",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontWeight: selectedTab === "socios" ? "600" : "500",
            }}
          >
            Socios Comerciales
          </button>
          <button
            onClick={() => setSelectedTab("indicadores")}
            style={{
              padding: "10px 16px",
              background: selectedTab === "indicadores" ? "#3b82f6" : "transparent",
              color: selectedTab === "indicadores" ? "#fff" : "#6b7280",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontWeight: selectedTab === "indicadores" ? "600" : "500",
            }}
          >
            Indicadores Globales
          </button>
        </div>

        {/* Contenido por tab */}
        {selectedTab === "overview" && (
          <section className="dashboard-card">
            <h2>Resumen de Economía Internacional</h2>
            <div style={{ marginTop: "20px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "24px"
              }}>
                <div className="summary-card">
                  <div className="summary-card-label">Tipo de Cambio USD/ARS</div>
                  <div className="summary-card-value">—</div>
                  <div className="summary-card-foot">Mercado oficial</div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Riesgo País (PBI bonos)</div>
                  <div className="summary-card-value">—</div>
                  <div className="summary-card-foot">Puntos básicos</div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Reservas Internacionales</div>
                  <div className="summary-card-value">—</div>
                  <div className="summary-card-foot">USD miles de millones</div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Deuda Externa</div>
                  <div className="summary-card-value">—</div>
                  <div className="summary-card-foot">USD miles de millones</div>
                </div>
              </div>
              <p style={{ color: "#6b7280", marginTop: "12px" }}>
                Se están integrando datos de economía internacional. Pronto se mostrarán indicadores de comercio bilateral, índices de confianza global y variables macroeconómicas internacionales.
              </p>
            </div>
          </section>
        )}

        {selectedTab === "socios" && (
          <section className="dashboard-card">
            <h2>Principales Socios Comerciales</h2>
            <div style={{ marginTop: "20px", minHeight: "300px" }}>
              <p style={{ color: "#6b7280" }}>
                Integración en progreso: se mostrarán datos de comercio bilateral con principales socios (China, Brasil, EE.UU., etc.)
              </p>
            </div>
          </section>
        )}

        {selectedTab === "indicadores" && (
          <section className="dashboard-card">
            <h2>Indicadores Económicos Globales</h2>
            <div style={{ marginTop: "20px", minHeight: "300px" }}>
              <p style={{ color: "#6b7280" }}>
                Integración en progreso: se mostrarán tasas de crecimiento, inflación internacional, índices bursátiles y precios de commodities.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Internacional;
