import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Macro
        </Link>

        <div className="navbar-links">
          <Link to="/inflacion">Inflación</Link>
          <Link to="/tipo-cambio">Tipo de cambio</Link>
          <Link to="/actividad">Actividad</Link>
          <Link to="/ipim">IPIM</Link>
          <Link to="/">Inicio</Link>
          <Link to="/comercio-exterior">Comercio Exterior</Link>
          <Link to="/monetaria">Monetaria</Link>
          <Link to="/estructura">Estructura</Link>
          <Link to="/internacional">Internacional</Link>
          <Link to="/ciclo-economico">Ciclo económico</Link>
          <Link to="/consumo">Consumo</Link>
          <Link to="/ecomics">Ecomics</Link>
          <Link to="/about">Sobre mí</Link>
          <Link to="/contact">Contacto</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;