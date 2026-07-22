import MonetariaSection from "../components/sections/MonetariaSection";
import TipoCambioVsInflacionSection from "../components/sections/TipoCambioVsInflacionSection";
import ITCRMSection from "../components/sections/ITCRMSection";
import TipoCambioTablaSection from "../components/sections/TipoCambioTablaSection";
import "../styles/dashboard.css";
import "../styles/macro-module.css";

function TipoCambio() {
  return (
    <div className="dashboard-page tipo-cambio-page">
      <div className="dashboard-container tipo-cambio-container">
        <article className="macro-module macro-module--tipo-cambio">
          <header className="module-header">
            <div className="module-header-main">
              <p className="module-eyebrow">Mercado cambiario</p>
              <h1 className="module-title">Tipo de cambio</h1>
              <p className="module-summary">
                Diagnóstico de atraso cambiario, evolución del mercado y
                competitividad externa.
              </p>
            </div>
          </header>

          <section className="module-section">
            <TipoCambioVsInflacionSection />
          </section>

          <section className="module-section">
            <MonetariaSection />
          </section>

          <section className="module-section">
            <TipoCambioTablaSection />
          </section>

          <section className="module-section">
            <div className="module-chart-card tipo-cambio-itcrm-card">
              <ITCRMSection />
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

export default TipoCambio;