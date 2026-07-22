import "../styles/dashboard.css";
import ActividadSection from "../components/sections/ActividadSection";

function Actividad() {
  return (
    <div className="dashboard-page actividad-page">
      <div className="dashboard-container actividad-container">
        <ActividadSection />
      </div>
    </div>
  );
}

export default Actividad;