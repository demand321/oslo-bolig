import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPriser, fetchBydelDetaljer } from '../api';
import { fmt, tempoTag, prisColor, liggetidColor } from '../utils';

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.5 });
  }, [center, zoom, map]);
  return null;
}

export default function Kart() {
  const [data, setData] = useState([]);
  const [metric, setMetric] = useState('pris');
  const [boligtype, setBoligtype] = useState('alle');
  const [selected, setSelected] = useState(null);
  const [detaljer, setDetaljer] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);

  useEffect(() => {
    fetchPriser('Q1 2026', boligtype).then(setData);
  }, [boligtype]);

  const handleSelect = async (b) => {
    setSelected(b);
    setFlyTarget([b.lat, b.lng]);
    const d = await fetchBydelDetaljer(b.id, 'Q1 2026');
    setDetaljer(d);
  };

  const getColor = (b) => {
    if (metric === 'pris') return prisColor(b.pris);
    if (metric === 'liggetid') return liggetidColor(b.liggetid);
    return '#3b82f6';
  };

  const getRadius = (b) => {
    const val = b[metric];
    if (metric === 'antall') return 8 + val / 20;
    if (metric === 'pris') return 10 + val / 5000;
    return 10 + val / 2;
  };

  const sorted = [...data].sort((a, b) => b.pris - a.pris);

  return (
    <>
      <div className="filters">
        <div>
          <label>Vis på kart</label><br />
          <select value={metric} onChange={e => setMetric(e.target.value)}>
            <option value="pris">Pris per kvm</option>
            <option value="liggetid">Liggetid (dager)</option>
            <option value="antall">Antall annonser</option>
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

      <div className="legend">
        {metric === 'pris' && <>
          <span><span className="legend-dot" style={{ background: '#3b82f6' }} /> Lav pris</span>
          <span><span className="legend-dot" style={{ background: '#ef4444' }} /> Høy pris</span>
        </>}
        {metric === 'liggetid' && <>
          <span><span className="legend-dot" style={{ background: '#34d399' }} /> Raskt (≤15d)</span>
          <span><span className="legend-dot" style={{ background: '#fbbf24' }} /> Middels</span>
          <span><span className="legend-dot" style={{ background: '#f87171' }} /> Tregt (&gt;28d)</span>
        </>}
        {metric === 'antall' && <span>Sirkelstørrelse = antall annonser</span>}
      </div>

      <div className="map-section">
        <div className="map-container">
          <MapContainer center={[59.92, 10.77]} zoom={12} className="map-wrapper" style={{ height: 550, borderRadius: 8 }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />
            {flyTarget && <FlyTo center={flyTarget} zoom={14} />}
            {data.map(b => (
              <CircleMarker
                key={b.id}
                center={[b.lat, b.lng]}
                radius={getRadius(b)}
                fillColor={getColor(b)}
                color="#fff"
                weight={1.5}
                fillOpacity={0.85}
                eventHandlers={{ click: () => handleSelect(b) }}
              >
                <Popup>
                  <strong style={{ color: '#3b82f6' }}>{b.navn}</strong><br />
                  Pris: {fmt(b.pris)} kr/kvm<br />
                  Liggetid: {b.liggetid} dager<br />
                  Annonser: {b.antall}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="map-sidebar">
          <div className="map-info-box">
            {selected ? (
              <>
                <h4>{selected.navn}</h4>
                {detaljer && boligtype === 'alle' && detaljer.map(d => (
                  <div className="detail" key={d.boligtype}>
                    <span className="lbl">{d.boligtype.charAt(0).toUpperCase() + d.boligtype.slice(1)}</span>
                    <span>{fmt(d.pris)} kr/kvm · {d.liggetid}d</span>
                  </div>
                ))}
                {detaljer && boligtype === 'alle' && <hr style={{ borderColor: '#334155', margin: '0.5rem 0' }} />}
                <div className="detail">
                  <span className="lbl">Snittpris/kvm</span>
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>{fmt(selected.pris)} kr</span>
                </div>
                <div className="detail">
                  <span className="lbl">Liggetid</span>
                  <span>{selected.liggetid} dager <span className={`tag ${tempoTag(selected.liggetid).cls}`}>{tempoTag(selected.liggetid).label}</span></span>
                </div>
                <div className="detail">
                  <span className="lbl">Aktive annonser</span>
                  <span>{selected.antall}</span>
                </div>
              </>
            ) : (
              <>
                <h4>Velg en bydel</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Klikk på en markør i kartet eller velg fra listen.</p>
              </>
            )}
          </div>

          <h3>Alle bydeler</h3>
          {sorted.map(b => (
            <div
              key={b.id}
              className={`bydel-item ${selected?.id === b.id ? 'active' : ''}`}
              onClick={() => handleSelect(b)}
            >
              <div>
                <span className="name">{b.navn}</span><br />
                <span className="days">{b.liggetid} dager liggetid</span>
              </div>
              <span className="price">{fmt(b.pris)} kr</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
