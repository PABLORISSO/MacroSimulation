import MonetariaSection from "../components/sections/MonetariaSection";
import AgregadosMonetariosSection from "../components/sections/AgregadosMonetariosSection";
import "../styles/dashboard.css";
import "../styles/monetaria.css";

function Monetaria() {
  return (
    <div className="dashboard-page monetaria-page">
      <div className="dashboard-container monetaria-container">
        <h1 className="dashboard-title">Variables Monetarias</h1>
        <p> este tablero debe responder las se¿iguientes preguntas:</p>
        <p>que esta haceindo el BCRA <br /> cuanta liquidez hay en el sistema <br /> que pasas con el dolar</p>
        <p>https://www.infobae.com/economia/2026/04/24/el-banco-central-aplica-una-mini-banda-cambiaria-para-el-dolar-y-se-consolida-el-pronostico-de-menor-inflacion-en-abril/</p>
        <br />
        <p>INDEC / BCRA
          Datos crudos
          Vos
          ¿Está atrasado?
          ¿En qué percentil histórico está?
          ¿Qué pasó en episodios similares?

          👉 Esto es oro para cualquier empresa.</p>



        <p className="dashboard-subtitle">MEP, CCL, oficial, blue y mayorista BCRA con bandas.</p>
        <p className="dashboard-subtitle">Base monetaria, circulante, depósitos a la vista, depósitos a plazo, Leliq, Pases pasivos y activos.</p>

        <MonetariaSection />
        <AgregadosMonetariosSection />
      </div>
    </div>
  );
}

export default Monetaria;
