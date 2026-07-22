import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

// Preload hero images for faster LCP
const preloadImages = () => {
  if (typeof document !== "undefined") {
    // Preload first 2 slides for fast initial display
    const firstSlide = HERO_SLIDES[0];
    const secondSlide = HERO_SLIDES[1];
    
    const link1 = document.createElement("link");
    link1.rel = "preload";
    link1.as = "image";
    link1.href = firstSlide.image;
    link1.fetchPriority = "high";
    document.head.appendChild(link1);
    
    const link2 = document.createElement("link");
    link2.rel = "preload";
    link2.as = "image";
    link2.href = secondSlide.image;
    link2.fetchPriority = "high";
    document.head.appendChild(link2);
  }
};



  const HERO_SLIDES = [
  {
    kicker: "Datos que explican, análisis que anticipan",
    title: "Entender la economía para tomar mejores decisiones.",
    text: "Información confiable, actualizada y analizada para comprender lo que pasa y lo que viene.",
    cta: "Explorar indicadores",
    path: "/macro",
    image: "/images/home/ministerio-economia.png",
  },
  {
    kicker: "Oferta de dólares",
    title: "Cuando ingresan más dólares del agro, la presión cambiaria disminuye.",
    text: "La liquidación del agro es una fuente clave de divisas genuinas.",
    cta: "Ver mercado cambiario",
    path: "/tipo-cambio",
    image: "/images/home/agro.png",
  },
  {
    kicker: "Comercio exterior",
    title: "Argentina crece cuando produce, exporta y se conecta con el mundo.",
    text: "El sector externo muestra la capacidad de generar divisas y sostener el crecimiento.",
    cta: "Explorar comercio exterior",
    path: "/comercio-exterior",
    image: "/images/home/puerto.png",
  },
  {
    kicker: "Política monetaria",
    title: "La liquidez condiciona precios, crédito y expectativas.",
    text: "El seguimiento monetario permite entender presiones inflacionarias y financieras.",
    cta: "Explorar monetaria",
    path: "/monetaria",
    image: "/images/home/banco-central.png",
  },
  {
    kicker: "Actividad económica",
    title: "La actividad se construye sector por sector.",
    text: "Industria, consumo, inversión y comercio explican el pulso real de la economía.",
    cta: "Explorar actividad",
    path: "/actividad",
    image: "/images/home/fabrica.png",
  },

];

function HomeHero() {
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef(null);

  const goToSlide = (index) => {
    // Validate and wrap index safely (handle negative and large indices)
    const safeIndex = ((index % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length;
    setCurrent(safeIndex);
  };

  useEffect(() => {
    // Preload hero images on mount
    preloadImages();
  }, []);

  useEffect(() => {
    // Only set up auto-advance when not hovering
    if (isHovering) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6500);

    // Cleanup on unmount and when hover state changes
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovering]);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const slide = HERO_SLIDES[current];

  return (
    <section className="home-hero" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {HERO_SLIDES.map((item, index) => (
        <div
          key={item.image}
          className={`home-hero-bg ${index === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${item.image})` }}
        />
      ))}

      <div className="home-hero-overlay" />

      <button
        className="home-hero-arrow home-hero-arrow-left"
        onClick={() => goToSlide(current - 1)}
        aria-label={`Anterior: ${current === 0 ? HERO_SLIDES[HERO_SLIDES.length - 1].title : HERO_SLIDES[current - 1].title}`}
        type="button"
      >
        ‹
      </button>

      <div className="home-hero-content">
        <span className="home-hero-kicker">{slide.kicker}</span>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>

        <Link to={slide.path} className="home-hero-button">
          {slide.cta} →
        </Link>
      </div>

      <button
        className="home-hero-arrow home-hero-arrow-right"
        onClick={() => goToSlide(current + 1)}
        aria-label={`Siguiente: ${HERO_SLIDES[(current + 1) % HERO_SLIDES.length].title}`}
        type="button"
      >
        ›
      </button>

      <div className="home-hero-dots">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={index}
            className={`home-hero-dot ${index === current ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            aria-label={`${index + 1} de ${HERO_SLIDES.length}: ${slide.title}`}
            aria-pressed={index === current}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

export default HomeHero;