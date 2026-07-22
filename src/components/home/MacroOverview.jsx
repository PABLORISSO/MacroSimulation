import { Link } from "react-router-dom";

const INDICATORS = [
  {
    label: "Inflación mensual",
    value: "1,5%",
    date: "May 2025",
    change: "↓ -0,4 p.p.",
    tone: "good",
  },
  {
    label: "Tipo de cambio oficial",
    value: "$1.472,50",
    date: "23 Jun 2025",
    change: "↑ 0,32%",
    tone: "bad",
  },
  {
    label: "Actividad económica",
    value: "-0,3%",
    date: "Abr 2025",
    change: "↓ -0,7 p.p.",
    tone: "bad",
  },
  {
    label: "Riesgo país",
    value: "678 p.b.",
    date: "23 Jun 2025",
    change: "↓ -15 p.b.",
    tone: "good",
  },
  {
    label: "Reservas internacionales",
    value: "USD 28.346 M",
    date: "23 Jun 2025",
    change: "↓ -71 M",
    tone: "bad",
  },
];

function MacroOverview() {
  return (
    <section className="macro-overview">
      <div className="macro-overview-head">
        <div>
          <h2>Panorama económico</h2>
          <p>Los principales indicadores en tiempo real.</p>
        </div>

        <Link to="/macro">Ver todos los indicadores →</Link>
      </div>

      <div className="macro-overview-grid">
        {INDICATORS.map((item) => (
          <article className="macro-card" key={item.label} role="region" aria-label={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.date}</small>
            <em className={`indicator-${item.tone}`} aria-label={`${item.change} comparado al período anterior`}>{item.change}</em>
            <div className="macro-sparkline" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}

export default MacroOverview;