import "../styles/dashboard.css";

function CicloEconomico() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Ciclo Económico</h1>
        <p className="dashboard-subtitle">
          Ventajas agroexportadoras, macroeconomía y ciclos en Argentina.
        </p>

        <section className="dashboard-card">
          <p className="section-text">
            Sí. Argentina tiene ventajas competitivas muy fuertes en el agro.
            Y de hecho eso es parte importante de por qué el tipo de cambio y el
            pass-through son tan sensibles en la economía argentina.
          </p>

          <p className="section-text">
            Pero hay que separar dos cosas: ventajas “naturales” y capacidad
            efectiva de transformar eso en crecimiento sostenido, porque no
            siempre coinciden.
          </p>

          <h2 className="section-title">Ventajas competitivas reales de Argentina en el agro</h2>

          <h3 className="section-title">1. Tierra extremadamente productiva</h3>
          <p className="section-text">
            La región pampeana es una de las zonas agrícolas más eficientes del
            mundo. Tiene suelos fértiles, clima relativamente favorable, gran
            escala productiva y buena mecanización. Eso permite rendimientos muy
            competitivos internacionalmente.
          </p>

          <h3 className="section-title">2. Productividad tecnológica alta</h3>
          <p className="section-text">
            El agro argentino no es “tradicional” en el sentido atrasado. Tiene
            siembra directa, biotecnología, maquinaria moderna, semillas
            avanzadas y gestión profesional. Muchas veces el productor argentino
            trabaja con niveles tecnológicos comparables a países desarrollados.
          </p>

          <h3 className="section-title">3. Capacidad exportadora enorme</h3>
          <p className="section-text">Argentina tiene ventajas claras en:</p>
          <ul className="section-text">
            <li>soja,</li>
            <li>maíz,</li>
            <li>trigo,</li>
            <li>girasol,</li>
            <li>carne,</li>
            <li>derivados industriales del agro.</li>
          </ul>
          <p className="section-text">Especialmente en el complejo sojero:</p>
          <ul className="section-text">
            <li>aceite,</li>
            <li>harina,</li>
            <li>biodiésel.</li>
          </ul>

          <p className="section-text">Eso genera dólares rápidamente.</p>

          <h2 className="section-title">Pero hay un problema estructural enorme</h2>
          <p className="section-text">
            Argentina tiene ventajas competitivas “reales”, pero inflación alta,
            volatilidad cambiaria, impuestos distorsivos, controles, brechas y
            riesgo macro erosionan continuamente esas ventajas.
          </p>

          <p className="section-text">
            Entonces aparece una paradoja: el agro es competitivo, pero la macro
            argentina no. Y eso genera tensiones permanentes sobre tipo de
            cambio, retenciones, reservas, pass-through y salarios reales.
          </p>

          <h2 className="section-title">Conexión con la discusión de devaluación</h2>
          <p className="section-text">
            Muchas veces el argumento es: “si devaluamos, exportamos más”. Pero
            en Argentina eso no siempre funciona linealmente.
          </p>
          <p className="section-text">¿Por qué?</p>
          <ul className="section-text">
            <li>parte de la mejora cambiaria se traslada rápido a inflación,</li>
            <li>suben costos,</li>
            <li>se aprecia nuevamente el TCR,</li>
            <li>se licúa el efecto competitivo.</li>
          </ul>

          <p className="section-text">
            Eso es exactamente lo que venías estudiando.
          </p>

          <h2 className="section-title">Otra cuestión importante</h2>
          <p className="section-text">
            El agro argentino es muy eficiente, pero no alcanza solo para
            sostener toda la macroeconomía.
          </p>
          <p className="section-text">
            Porque el sector genera muchos dólares, pero no tanto empleo masivo
            urbano comparado con industria y servicios.
          </p>

          <p className="section-text">
            Entonces el país vive una tensión constante entre necesidad de
            dólares, estabilidad cambiaria, salarios urbanos y consumo interno.
          </p>

          <p className="section-text">Y ahí aparecen los ciclos:</p>
          <ul className="section-text">
            <li>atraso cambiario,</li>
            <li>crisis externa,</li>
            <li>devaluación,</li>
            <li>inflación,</li>
            <li>recesión,</li>
            <li>recuperación,</li>
            <li>nuevo atraso.</li>
          </ul>

          <p className="section-text">
            Eso es bastante típico de la historia macro argentina.
          </p>

          <h2 className="section-title">En términos económicos estrictos</h2>
          <p className="section-text">
            Argentina tiene ventajas comparativas (recursos naturales, tierra
            fértil) y también algunas ventajas competitivas (tecnología,
            know-how, cadenas exportadoras).
          </p>

          <p className="section-text">
            Pero no logra convertirlas plenamente en estabilidad, inversión
            sostenida, crecimiento largo y baja inflación, porque la macro
            interrumpe constantemente el proceso.
          </p>

          <p className="section-text">
            Y eso es parte del drama económico argentino desde hace décadas.
          </p>
        </section>
      </div>
    </div>
  );
}

export default CicloEconomico;
