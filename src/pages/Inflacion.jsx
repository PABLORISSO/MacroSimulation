import InflationSection from "../components/sections/InflationSection";
import "../styles/dashboard.css";

function Inflacion() {
  return (
    <div className="dashboard-page inflacion-page">
      <div className="dashboard-container inflacion-container">
        <InflationSection />
      </div>
    </div>
  );
}

export default Inflacion;
