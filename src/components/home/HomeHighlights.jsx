const HIGHLIGHTS = [
  {
    icon: "▥",
    title: "Datos oficiales",
    text: "Fuentes oficiales de Argentina y el mundo.",
    tone: "green",
  },
  {
    icon: "⌁",
    title: "Análisis independiente",
    text: "Visión profesional, objetiva y sin sesgos.",
    tone: "blue",
  },
  {
    icon: "◷",
    title: "Actualización constante",
    text: "Información al día para entender el presente y anticipar el futuro.",
    tone: "purple",
  },
  {
    icon: "◎",
    title: "Enfoque integral",
    text: "Todos los frentes de la economía en un solo lugar.",
    tone: "orange",
  },
];

function HomeHighlights() {
  return (
    <section className="home-highlights" aria-label="Características principales">
      {HIGHLIGHTS.map((item) => (
        <article className={`home-highlight-card ${item.tone}`} key={item.title} role="region" aria-label={`${item.title}: ${item.text}`}>
          <div className="home-highlight-icon" aria-hidden="true">{item.icon}</div>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
          <span className="home-highlight-arrow" aria-hidden="true">→</span>
        </article>
      ))}
    </section>
  );
}

export default HomeHighlights;