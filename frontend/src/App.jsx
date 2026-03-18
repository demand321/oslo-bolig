import { useState } from 'react';
import Oversikt from './components/Oversikt';
import Kart from './components/Kart';
import Trender from './components/Trender';
import './App.css';

const tabs = [
  { id: 'oversikt', label: 'Oversikt' },
  { id: 'kart', label: 'Kart' },
  { id: 'trender', label: 'Trender' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('oversikt');

  return (
    <div className="app">
      <header>
        <h1>🏠 Oslo Boligmarked — Priser &amp; Liggetider</h1>
        <p>Gjennomsnittlige boligpriser og liggetider fordelt på bydeler</p>
        <span className="source-note">📊 Basert på representative markedsdata (Q1 2026)</span>
      </header>

      <main>
        <div className="tabs">
          {tabs.map(t => (
            <div
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </div>
          ))}
        </div>

        {activeTab === 'oversikt' && <Oversikt />}
        {activeTab === 'kart' && <Kart />}
        {activeTab === 'trender' && <Trender />}
      </main>
    </div>
  );
}
