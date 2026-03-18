import { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { fetchPriser } from '../api';
import { fmt, tempoTag, liggetidColor, chartBaseOpts } from '../utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Oversikt() {
  const [data, setData] = useState([]);
  const [boligtype, setBoligtype] = useState('alle');
  const [sortCol, setSortCol] = useState('bydel');
  const [sortAsc, setSortAsc] = useState(true);
  const [maxPris, setMaxPris] = useState(120000);

  useEffect(() => {
    fetchPriser('Q1 2026', boligtype).then(setData);
  }, [boligtype]);

  const filtered = useMemo(() =>
    data.filter(b => b.pris <= maxPris),
    [data, maxPris]
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sortCol === 'bydel' ? 'navn' : sortCol];
      let vb = b[sortCol === 'bydel' ? 'navn' : sortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [filtered, sortCol, sortAsc]);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  if (!data.length) return <div className="loading">Laster data...</div>;

  const avgPris = Math.round(filtered.reduce((s, b) => s + b.pris, 0) / filtered.length);
  const avgLiggetid = Math.round(filtered.reduce((s, b) => s + b.liggetid, 0) / filtered.length);
  const totalAnnonser = filtered.reduce((s, b) => s + b.antall, 0);
  const dyrest = filtered.reduce((max, b) => b.pris > max.pris ? b : max, filtered[0]);

  const arrow = (col) => sortCol === col ? (sortAsc ? ' ▲' : ' ▼') : '';

  return (
    <>
      <div className="filters">
        <div>
          <label>Boligtype</label><br />
          <select value={boligtype} onChange={e => setBoligtype(e.target.value)}>
            <option value="alle">Alle typer</option>
            <option value="leilighet">Leilighet</option>
            <option value="rekkehus">Rekkehus</option>
            <option value="enebolig">Enebolig</option>
          </select>
        </div>
        <div>
          <label>Maks pris per kvm</label><br />
          <input type="range" min="30000" max="120000" step="5000"
            value={maxPris} onChange={e => setMaxPris(+e.target.value)} />
          <span style={{ marginLeft: 8, fontSize: '0.85rem' }}>{fmt(maxPris)} kr</span>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card"><div className="value">{fmt(avgPris)} kr</div><div className="label">Snittpris per kvm</div></div>
        <div className="stat-card"><div className="value">{avgLiggetid} dager</div><div className="label">Snitt liggetid</div></div>
        <div className="stat-card"><div className="value">{fmt(totalAnnonser)}</div><div className="label">Aktive annonser</div></div>
        <div className="stat-card"><div className="value">{dyrest.navn}</div><div className="label">Dyrest bydel</div></div>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h3>Gjennomsnittspris per kvm (kr)</h3>
          <Bar
            data={{
              labels: sorted.map(b => b.navn),
              datasets: [{ data: sorted.map(b => b.pris), backgroundColor: '#3b82f6', borderRadius: 4 }]
            }}
            options={{
              ...chartBaseOpts,
              scales: { ...chartBaseOpts.scales, y: { ...chartBaseOpts.scales.y, ticks: { ...chartBaseOpts.scales.y.ticks, callback: v => fmt(v) + ' kr' }}}
            }}
          />
        </div>
        <div className="chart-box">
          <h3>Gjennomsnittlig liggetid (dager)</h3>
          <Bar
            data={{
              labels: sorted.map(b => b.navn),
              datasets: [{ data: sorted.map(b => b.liggetid), backgroundColor: sorted.map(b => liggetidColor(b.liggetid)), borderRadius: 4 }]
            }}
            options={{
              ...chartBaseOpts,
              scales: { ...chartBaseOpts.scales, y: { ...chartBaseOpts.scales.y, ticks: { ...chartBaseOpts.scales.y.ticks, callback: v => v + ' d' }}}
            }}
          />
        </div>
      </div>

      <div className="table-container">
        <h3>Detaljert oversikt per bydel</h3>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('bydel')}>Bydel{arrow('bydel')}</th>
              <th onClick={() => handleSort('pris')}>Snittpris/kvm{arrow('pris')}</th>
              <th onClick={() => handleSort('liggetid')}>Liggetid{arrow('liggetid')}</th>
              <th onClick={() => handleSort('antall')}>Annonser{arrow('antall')}</th>
              <th>Tempo</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(b => {
              const tempo = tempoTag(b.liggetid);
              return (
                <tr key={b.id}>
                  <td><strong>{b.navn}</strong></td>
                  <td>{fmt(b.pris)} kr</td>
                  <td>{b.liggetid} dager</td>
                  <td>{b.antall}</td>
                  <td><span className={`tag ${tempo.cls}`}>{tempo.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
