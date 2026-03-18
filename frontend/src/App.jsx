import { useState, useEffect } from 'react';
import Oversikt from './components/Oversikt';
import Kart from './components/Kart';
import Trender from './components/Trender';
import ThemeSwitcher from './components/ThemeSwitcher';
import './App.css';

const tabs = [
  { id: 'oversikt', label: 'Oversikt' },
  { id: 'kart', label: 'Kart' },
  { id: 'trender', label: 'Trender' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('oversikt');
  const [theme, setTheme] = useState(() => localStorage.getItem('oslo-theme') || 'midnight');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('oslo-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      {theme === 'terminal' && <div className="scanlines" />}
      <header>
        <div className="header-top">
          <div />
          <div className="header-center">
            <h1>
              {theme === 'cyberpunk' && <span className="glitch" data-text="Oslo Boligmarked">Oslo Boligmarked</span>}
              {theme === 'terminal' && <span>&gt; oslo_boligmarked</span>}
              {theme === 'frost' && <span>Oslo Boligmarked</span>}
              {theme === 'midnight' && <span>🏠 Oslo Boligmarked — Priser &amp; Liggetider</span>}
            </h1>
            <p>
              {theme === 'terminal'
                ? '// priser og liggetider fordelt på bydeler'
                : 'Gjennomsnittlige boligpriser og liggetider fordelt på bydeler'}
            </p>
            <span className="source-note">
              {theme === 'terminal' ? '[DATA: Q1-2026 // MOCK]' : '📊 Basert på representative markedsdata (Q1 2026)'}
            </span>
          </div>
          <ThemeSwitcher current={theme} onChange={setTheme} />
        </div>
      </header>

      <main>
        <div className="tabs">
          {tabs.map(t => (
            <div
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {theme === 'terminal' ? `[${t.label.toUpperCase()}]` : t.label}
            </div>
          ))}
        </div>

        {activeTab === 'oversikt' && <Oversikt />}
        {activeTab === 'kart' && <Kart theme={theme} />}
        {activeTab === 'trender' && <Trender />}
      </main>
    </div>
  );
}
