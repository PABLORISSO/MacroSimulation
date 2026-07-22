import { Link } from "react-router-dom";

const MODULES = [
  {
    title: "Comercio Exterior",
    tag: "Sector externo",
    text: "Exportaciones, importaciones y balanza comercial.",
    path: "/comercio-exterior",
    image: "/images/home/puerto.png",
    ariaLabel: "Comercio Exterior: Exportaciones, importaciones y balanza comercial.",
  },
  {
    title: "Monetaria",
    tag: "BCRA",
    text: "Agregados monetarios, liquidez y tasas de interés.",
    path: "/monetaria",
    image: "/images/home/banco-central.png",
    ariaLabel: "Monetaria: Agregados monetarios, liquidez y tasas de interés.",
  },
  {
    title: "Actividad",
    tag: "EMAE",
    text: "Industria, construcción, comercio y nivel de actividad.",
    path: "/actividad",
    image: "/images/home/fabrica.png",
    ariaLabel: "Actividad: Industria, construcción, comercio y nivel de actividad.",
  },
  {
    title: "Consumo",
    tag: "Demanda interna",
    text: "Ventas, hogares, salario real y comportamiento del consumidor.",
    path: "/consumo",
    image: "/images/home/supermercado.png",
    ariaLabel: "Consumo: Ventas, hogares, salario real y comportamiento del consumidor.",
  },
  {
    title: "Energía",
    tag: "Vaca Muerta",
    text: "Petróleo, gas y energía en Argentina.",
    path: "/energia",
    image: "/images/home/vaca-muerta.png",
    ariaLabel: "Energía: Petróleo, gas y energía en Argentina.",
  },
  {
    title: "Tipo de cambio",
    tag: "Mercado cambiario",
    text: "Dólar, brecha, competitividad y expectativas.",
    path: "/tipo-cambio",
    image: "/images/home/contenedores.png",
    ariaLabel: "Tipo de cambio: Dólar, brecha, competitividad y expectativas.",
  },
];

function HomeModules() {
  return (
    <section className="home-modules">
      <div className="home-modules-head">
        <div>
          <h2>Nuestros módulos</h2>
          <p>Explorá cada dimensión de la economía.</p>
        </div>

        <Link to="/macro">Ver todos los módulos →</Link>
      </div>

      <div className="home-modules-list">
        {MODULES.map((mod) => (
          <Link
            to={mod.path}
            className="cinematic-module-card"
            key={mod.title}
            style={{ backgroundImage: `url(${mod.image})` }}
            aria-label={mod.ariaLabel}
          >
            <div className="cinematic-module-overlay" />
            <div className="cinematic-module-content">
              <span>{mod.tag}</span>
              <h3>{mod.title}</h3>
              <p>{mod.text}</p>
              <b>→</b>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default HomeModules;