import IpimSection from "../components/sections/IpimSection";
import "../styles/dashboard.css";

function Ipim() {
  return (
    <div className="dashboard-page ipim-page">
      <div className="dashboard-container ipim-container">
        
        <IpimSection />
      </div>
    </div>
  );
}

export default Ipim;