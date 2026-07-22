import EcomicsSection from "../components/sections/EcomicsSection";
import "../styles/dashboard.css";

function Ecomics() {
  return (
    <div className="dashboard-page ecomics-page">
      <div className="dashboard-container ecomics-container">
        <header className="inflation-header ecomics-header-page">
          <h1>Ecomics</h1>
          <p className="dashboard-subtitle">La economia en comics.</p>
        </header>
        <EcomicsSection />
      </div>
    </div>
  );
}

export default Ecomics;
