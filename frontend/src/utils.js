export function fmt(n) {
  return n.toLocaleString('nb-NO');
}

export function tempoTag(days) {
  if (days <= 15) return { label: 'Raskt', cls: 'tag-fast' };
  if (days <= 28) return { label: 'Middels', cls: 'tag-medium' };
  return { label: 'Tregt', cls: 'tag-slow' };
}

export function liggetidColor(days) {
  if (days <= 15) return '#34d399';
  if (days <= 28) return '#fbbf24';
  return '#f87171';
}

export function prisColor(pris) {
  const min = 35000, max = 110000;
  const t = Math.min(1, Math.max(0, (pris - min) / (max - min)));
  const r = Math.round(59 + t * (239 - 59));
  const g = Math.round(130 + (1 - t) * 100);
  const b = Math.round(246 - t * 180);
  return `rgb(${r},${g},${b})`;
}

export const BYDEL_COLORS = [
  '#3b82f6','#ef4444','#22c55e','#f59e0b','#8b5cf6',
  '#ec4899','#14b8a6','#f97316','#06b6d4','#84cc16',
  '#a855f7','#e11d48','#10b981','#eab308','#6366f1'
];

export const chartBaseOpts = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 45 }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
  }
};
