import { Link } from "react-router-dom";

function FeaturedModule() {
  return (
    <section className="featured-module" aria-label="Módulo destacado: Mercado cambiario">
      <div className="featured-module-image" role="img" aria-label="Imagen ilustrativa de mercado cambiario" />

      <div className="featured-module-content">
        <span>Módulo destacado</span>
        <h2>Mercado cambiario</h2>
        <h3>Comprendé qué mueve realmente al dólar.</h3>
        <p>
          No solo cotizaciones. También expectativas, oferta de divisas,
          competitividad y política monetaria.
        </p>

        <Link to="/tipo-cambio">Explorar módulo →</Link>
      </div>

      <div className="featured-module-side">
        <article role="region" aria-label="Cobertura: Más de 200 indicadores económicos">
          <span>Cobertura</span>
          <h3>Más de 200 indicadores económicos organizados en una sola plataforma.</h3>
          <b aria-hidden="true">→</b>
        </article>

        <article role="region" aria-label="Metodología: Datos oficiales, modelos econométricos e inteligencia artificial">
          <span>Metodología</span>
          <h3>Datos oficiales, modelos econométricos e inteligencia artificial.</h3>
          <b aria-hidden="true">→</b>
        </article>
      </div>
    </section>
  );
}

export default FeaturedModule;