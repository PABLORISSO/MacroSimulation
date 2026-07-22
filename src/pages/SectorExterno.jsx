import SectorExternoBienes from "../components/SectorExternoBienes";
import SectorExternoCuentaCorriente from "../components/SectorExternoCuentaCorriente";
import SectorExternoCuentaFinanciera from "../components/SectorExternoCuentaFinanciera";
import SectorExternoResumen from "../components/SectorExternoResumen";
import "../styles/dashboard.css";



function SectorExterno() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        <h1 className="dashboard-title">
          Sector Externo
        </h1>

        <p className="dashboard-subtitle">
          Cuenta Corriente, Cuenta Capital,
          Cuenta Financiera y Comercio Exterior.
          Balanza de Pagos - INDEC.
        </p>

        <SectorExternoResumen />

        <SectorExternoCuentaCorriente />

        <SectorExternoCuentaFinanciera />

        <SectorExternoBienes />

      </div>
    </div>
  );
}

export default SectorExterno;