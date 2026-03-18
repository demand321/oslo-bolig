import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend
} from 'chart.js';
import { fetchBydeler, fetchTrender, fetchGjennomsnitt } from '../api';
import { fmt, BYDEL_COLORS } from '../utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Trender() {
  const [bydeler, setBydeler] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [boligtype, setBoligtype] = useState('alle');
  const [metric, setMetric] = useState('pris');
  const [trendData, setTrendData] = useState([]);
  const [avgData, setAvgData] = useState([]);

  // Load bydeler list
  useEffect(() => {
    fetchBydeler().then(b => {
      setBydeler(b);
      // Pre-select first, third, and last
      if (b.length >= 3) setSelectedIds([b[0].id, b[2].id, b[b.length - 1].id]);
    });
  }, []);

  // Load trend data when selection changes
  useEffect(() => {
    if (selectedIds.length > 0) {
      fetchTrender(selectedIds, boligtype).then(setTrendData);
    } else {
      setTrendData([]);
    }
  }, [selectedIds, boligtype]);

  // Load average data
  useEffect(() => {
    fetchGjennomsnitt(boligtype).then(setAvgData);
  }, [boligtype]);

  const toggleBydel = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 6) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const quarters = avgData.map(d => d.kvartal);

  const trendDatasets = trendData.map((b) => {
    const idx = bydeler.findIndex(bd => bd.id === b.id);
    return {
      label: b.navn,
      data: b.data.map(d => d[metric]),
      borderColor: BYDEL_COLORS[idx % BYDEL_COLORS.length],
      backgroundColor: BYDEL_COLORS[idx % BYDEL_COLORS.length] + '22',
      tension: 0.3,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5
    };
  });

  const lineOpts = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { color: '#94a3b8', usePointStyle: true, padding: 16 } } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      y: {
        ticks: { color: '#94a3b8', callback: v => metric === 'pris' ? fmt(v) + ' kr' : v + ' d' },
        grid: { color: '#334155' }
      }
    }
  };

  return (
    <>
      <div className="filters">
        <div>
          <label>Metrikk</label><br />
          <select value={metric} onChange={e => setMetric(e.target.value)}>
            <option value="pris">Pris per kvm</option>
            <option value="liggetid">Liggetid (dager)</option>
          </select>
        </div>
        <div>
          <label>Boligtype</label><br />
          <select value={boligtype} onChange={e => setBoligtype(e.target.value)}>
            <option value="alle">Alle typer</option>
            <option value="leilighet">Leilighet</option>
            <option value="rekkehus">Rekkehus</option>
            <option value="enebolig">Enebolig</option>
          </select>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
        Velg bydeler å sammenligne (maks 6):
      </p>
      <div className="bydel-chips">
        {bydeler.map((b, i) => (
          <span
            key={b.id}
            className={`chip ${selectedIds.includes(b.id) ? 'selected' : ''}`}
            style={selectedIds.includes(b.id) ? { background: BYDEL_COLORS[i % BYDEL_COLORS.length], borderColor: BYDEL_COLORS[i % BYDEL_COLORS.length] } : {}}
            onClick={() => toggleBydel(b.id)}
          >
            {b.navn}
          </span>
        ))}
      </div>

      <div className="chart-box" style={{ marginBottom: '1.5rem' }}>
        <h3>{metric === 'pris' ? 'Prisutvikling per kvm' : 'Liggetid-utvikling'} (siste 8 kvartaler)</h3>
        {trendData.length > 0 ? (
          <Line
            data={{ labels: trendData[0]?.data.map(d => d.kvartal) || [], datasets: trendDatasets }}
            options={lineOpts}
          />
        ) : (
          <p style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>Velg minst én bydel for å se trender.</p>
        )}
      </div>

      <div className="chart-box">
        <h3>Oslo gjennomsnitt — prisutvikling vs. liggetid</h3>
        {avgData.length > 0 && (
          <Line
            data={{
              labels: quarters,
              datasets: [
                {
                  label: 'Snittpris/kvm (kr)',
                  data: avgData.map(d => d.pris),
                  borderColor: '#3b82f6',
                  backgroundColor: '#3b82f622',
                  tension: 0.3,
                  yAxisID: 'y',
                  pointRadius: 4,
                  borderWidth: 2.5
                },
                {
                  label: 'Snitt liggetid (dager)',
                  data: avgData.map(d => d.liggetid),
                  borderColor: '#f59e0b',
                  backgroundColor: '#f59e0b22',
                  tension: 0.3,
                  yAxisID: 'y1',
                  pointRadius: 4,
                  borderWidth: 2.5,
                  borderDash: [5, 5]
                }
              ]
            }}
            options={{
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              plugins: { legend: { labels: { color: '#94a3b8', usePointStyle: true, padding: 16 } } },
              scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
                y: {
                  type: 'linear', position: 'left',
                  ticks: { color: '#3b82f6', callback: v => fmt(v) + ' kr' },
                  grid: { color: '#334155' },
                  title: { display: true, text: 'Pris/kvm', color: '#3b82f6' }
                },
                y1: {
                  type: 'linear', position: 'right',
                  ticks: { color: '#f59e0b', callback: v => v + ' d' },
                  grid: { drawOnChartArea: false },
                  title: { display: true, text: 'Liggetid', color: '#f59e0b' }
                }
              }
            }}
          />
        )}
      </div>
    </>
  );
}
