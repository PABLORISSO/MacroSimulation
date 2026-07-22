import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

const sections = [
  {
    title: "ACTIVIDAD",
    links: [
      { path: "/actividad", label: "EMAE (actividad general)" },
      { path: "/ipim", label: "IPIM (industria manufacturera)" },
      { path: "/consumo", label: "Consumo" },
      { path: "/estructura", label: "Estructura productiva" },
    ],
  },
  {
    title: "PRECIOS",
    links: [{ path: "/inflacion", label: "Inflación (IPC)" }],
  },
  {
    title: "EXTERNO",
    links: [
      { path: "/sector-externo", label: "Sector Externo" },
      { path: "/tipo-cambio", label: "Tipo de cambio" },
      { path: "/comercio-exterior", label: "Comercio Exterior" },
    ],
  },
  {
    title: "MONETARIO",
    links: [{ path: "/monetaria", label: "Monetaria" }],
  },
  {
    title: "GLOBAL",
    links: [
      { path: "/internacional", label: "Internacional" },
      { path: "/ciclo-economico", label: "Ciclo económico" },
    ],
  },
  {
    title: "ANALYTICS",
    links: [{ path: "/ecomics", label: "Ecomics" }],
  },
];

function Sidebar() {
  const [openSections, setOpenSections] = useState(
    sections.reduce((acc, section) => ({ ...acc, [section.title]: false }), {})
  );

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Navegación</span>
        <p className="sidebar-description"></p>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => {
          const isOpen = openSections[section.title];
          return (
            <div
              key={section.title}
              className={`sidebar-section ${isOpen ? "open" : "closed"}`}
            >
              <button
                type="button"
                className="sidebar-section-toggle"
                onClick={() => toggleSection(section.title)}
                aria-expanded={isOpen}
              >
                <span>{section.title}</span>
                <span className={`sidebar-section-icon ${isOpen ? "open" : ""}`}>
                  ▾
                </span>
              </button>
              <div className={`sidebar-section-links ${isOpen ? "open" : "closed"}`}>
                {section.links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `sidebar-link${isActive ? " active" : ""}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
