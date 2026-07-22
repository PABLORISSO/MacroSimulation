import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { registerProvinciasMap } from '../../maps/registerProvinciasMap';
import { getInflacionRegiones } from '../../services/inflationService';
import { regionPorProvincia } from '../../maps/regiones';

function ArgentinaMap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    registerProvinciasMap();
    getInflacionRegiones()
      .then(setData)
      .catch(() => setError('No se pudieron cargar datos de regiones'));
  }, []);

  if (error) return <div>{error}</div>;
  if (!data) return <div>Cargando mapa...</div>;

  // backend returns per-region values like 'Región Pampeana' — normalize to region short name
  const regionValues = {};
  for (const it of (data.items || [])) {
    if (!it || !it.region) continue;
    const r = it.region.replace(/^Regi(o|ó)n\s*/i, '').trim();
    regionValues[r] = it.valor;
  }

  // map each province to its region value
  const values = Object.keys(regionPorProvincia).map((prov) => {
    const regionName = regionPorProvincia[prov];
    const val = regionValues[regionName] ?? null;
    return { name: prov, value: val };
  });
  const numericValues = values
    .map((v) => (typeof v.value === 'number' && Number.isFinite(v.value) ? v.value : null))
    .filter((v) => v !== null);

  const minVal = numericValues.length ? Math.min(...numericValues) : 0;
  const maxVal = numericValues.length ? Math.max(...numericValues) : 0;

  const option = {
    title: {
      text: `Nivel general — ${data.fecha}`,
      left: 'center',
      top: 10,
      textStyle: { color: '#2f2f2f' },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const v = params?.value;
        return `${params?.name}: ${typeof v === 'number' && Number.isFinite(v) ? v + '%' : 'Sin dato'}`;
      },
    },
    visualMap: {
      min: minVal,
      max: maxVal,
      left: 'left',
      bottom: '10%',
      text: ['Alto','Bajo'],
      calculable: true,
      inRange: { color: ['#f1f5f9', '#3b82f6'] }
    },
    series: [
      {
        name: 'Nivel general',
        type: 'map',
        map: 'argentina-provincias',
        roam: false,
        emphasis: { label: { show: true } },
        label: { show: false },
        data: values,
      },
    ],
  };

  return (
    <div style={{ marginTop: 18 }}>
      <ReactECharts option={option} style={{ height: '420px', width: '100%' }} />
    </div>
  );
}

export default ArgentinaMap;
