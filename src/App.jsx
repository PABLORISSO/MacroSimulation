import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import IPIMPage from "./pages/Ipim.jsx";
import Monetaria from "./pages/Monetaria";
import Inflacion from "./pages/Inflacion";
import ComercioExterior from "./pages/ComercioExterior";
import SectorExterno from "./pages/SectorExterno";
import Estructura from "./pages/Estructura";
import Actividad from "./pages/Actividad";
import Internacional from "./pages/Internacional";
import TipoCambio from "./pages/TipoCambio";
import CicloEconomico from "./pages/CicloEconomico";
import Ecomics from "./pages/Ecomics";
import Consumo from "./pages/Consumo";
import International from "./pages/International.jsx";

function AppContent() {
  const { pathname } = useLocation();
  const showSidebar = pathname !== "/";

  return (
    <>
      <Navbar />
      <main className={showSidebar ? "app-content app-layout" : "app-content"}>
        {showSidebar && <Sidebar />}
        <div className="page-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inflacion" element={<Inflacion />} />
            <Route path="/comercio-exterior" element={<ComercioExterior />} />
            <Route path="/sector-externo" element={<SectorExterno />} />
            <Route path="/ipim" element={<IPIMPage />} />
            <Route path="/monetaria" element={<Monetaria />} />
            <Route path="/tipo-cambio" element={<TipoCambio />} />
            <Route path="/estructura" element={<Estructura />} />
            <Route path="/actividad" element={<Actividad />} />
            <Route path="/internacional" element={<Internacional />} />
            <Route path="/ciclo-economico" element={<CicloEconomico />} />
            <Route path="/consumo" element={<Consumo />} />
            <Route path="/ecomics" element={<Ecomics />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/international" element={<International />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;