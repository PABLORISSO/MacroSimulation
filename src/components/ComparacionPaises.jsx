import React from 'react';
import ReactECharts from 'echarts-for-react';

/**
 * Componente que encapsula la comparativa regional y el contexto internacional
 */
const ComparacionPaises = ({ regionalData, globalIndicators, notes }) => {
  // Preparar datos para el gráfico
  const countries = regionalData?.map(c => c.country) || [];
  const values = regionalData?.map(c => c.value) || [];

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: <b>{c}%</b>'
    },
    grid: {
      top: 40,
      bottom: 40,
      left: '10%',
      right: '5%'
    },
    xAxis: {
      type: 'category',
      data: countries,
      axisLabel: { color: '#666', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%', color: '#999' },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [
      {
        name: 'Variación PBI',
        data: values,
        type: 'bar',
        barWidth: '45%',
        itemStyle: {
          color: (params) => params.name.toLowerCase().includes('arg') ? '#333' : '#ccc',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Comparativa Regional y Global</h2>
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-full">World Bank Data</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Columna de Indicadores Globales (Info International) */}
        <div className="p-6 bg-gray-50/50 border-r border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Contexto Global</h3>
          <div className="space-y-6">
            {globalIndicators?.slice(0, 3).map((ind, idx) => (
              <div key={idx}>
                <p className="text-sm text-gray-600 mb-1">{ind.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">{ind.value}</span>
                  <span className="text-xs text-gray-400 font-medium">{ind.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna del Gráfico */}
        <div className="lg:col-span-2 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">PBI (Var. % anual)</h3>
          <ReactECharts option={chartOption} style={{ height: '300px' }} />
          
          {/* Notas dinámicas */}
          <div className="mt-6 pt-6 border-t border-gray-50">
            <p className="text-xs text-gray-400 italic">
              {notes || "Nota: Los datos regionales reflejan la última actualización disponible del Banco Mundial para el año fiscal corriente."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparacionPaises;