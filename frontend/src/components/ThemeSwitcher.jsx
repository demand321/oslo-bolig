import { useState } from 'react';

const themes = [
  {
    id: 'midnight',
    name: 'Midnight',
    icon: '🌙',
    desc: 'Originalt mørkt tema'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '⚡',
    desc: 'Neon & synthwave'
  },
  {
    id: 'frost',
    name: 'Nordic Frost',
    icon: '❄️',
    desc: 'Lyst & skandinavisk'
  },
  {
    id: 'terminal',
    name: 'Retro Terminal',
    icon: '💻',
    desc: 'CRT hacker-modus'
  },
];

export default function ThemeSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="theme-switcher">
      <button className="theme-toggle" onClick={() => setOpen(!open)}>
        {themes.find(t => t.id === current)?.icon} Tema
      </button>
      {open && (
        <div className="theme-dropdown">
          {themes.map(t => (
            <div
              key={t.id}
              className={`theme-option ${current === t.id ? 'active' : ''}`}
              onClick={() => { onChange(t.id); setOpen(false); }}
            >
              <span className="theme-icon">{t.icon}</span>
              <div>
                <div className="theme-name">{t.name}</div>
                <div className="theme-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
