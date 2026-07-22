import React from 'react';
import { useInternationalData } from '../hooks/useInternationalData';
import ComparacionPaises from './ComparacionPaises';

const InternationalDashboard = () => {
  const { globalDashboard, regionalComparison, latamDashboard, loading, error } = useInternationalData();

  if (loading) return <div className="p-10 text-center">Cargando indicadores internacionales...</div>;
  if (error) return <div className="p-10 text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="international-module p-6 bg-gray-50 min-h-screen">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-gray-800">Contexto Internacional</h1>
        <p className="text-gray-500 text-sm">Análisis de variables externas y benchmarking regional</p>
      </header>

      <ComparacionPaises 
        regionalData={regionalComparison}
        globalIndicators={globalDashboard?.indicadores}
        notes={latamDashboard?.resumen}
      />

    </div>
  );
};

export default InternationalDashboard;