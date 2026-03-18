const db = require('./db');

const bydeler = [
  { navn: 'Frogner',            lat: 59.9178, lng: 10.7050 },
  { navn: 'St. Hanshaugen',     lat: 59.9260, lng: 10.7370 },
  { navn: 'Grünerløkka',        lat: 59.9230, lng: 10.7600 },
  { navn: 'Sagene',             lat: 59.9350, lng: 10.7530 },
  { navn: 'Gamle Oslo',         lat: 59.9070, lng: 10.7730 },
  { navn: 'Ullern',             lat: 59.9280, lng: 10.6480 },
  { navn: 'Vestre Aker',        lat: 59.9520, lng: 10.6450 },
  { navn: 'Nordre Aker',        lat: 59.9550, lng: 10.7350 },
  { navn: 'Nordstrand',         lat: 59.8600, lng: 10.7900 },
  { navn: 'Østensjø',           lat: 59.8900, lng: 10.8200 },
  { navn: 'Bjerke',             lat: 59.9400, lng: 10.8100 },
  { navn: 'Alna',               lat: 59.9250, lng: 10.8500 },
  { navn: 'Grorud',             lat: 59.9600, lng: 10.8800 },
  { navn: 'Stovner',            lat: 59.9650, lng: 10.9200 },
  { navn: 'Søndre Nordstrand',  lat: 59.8400, lng: 10.8100 },
];

// Current Q1 2026 data per boligtype
const currentData = {
  'Frogner':            { leilighet: { pris: 95000, liggetid: 12, antall: 145 }, rekkehus: { pris: 85000, liggetid: 18, antall: 12 }, enebolig: { pris: 110000, liggetid: 22, antall: 5 }},
  'St. Hanshaugen':     { leilighet: { pris: 88000, liggetid: 14, antall: 120 }, rekkehus: { pris: 78000, liggetid: 20, antall: 8 },  enebolig: { pris: 95000, liggetid: 25, antall: 3 }},
  'Grünerløkka':        { leilighet: { pris: 82000, liggetid: 10, antall: 160 }, rekkehus: { pris: 75000, liggetid: 16, antall: 6 },  enebolig: { pris: 90000, liggetid: 20, antall: 2 }},
  'Sagene':             { leilighet: { pris: 78000, liggetid: 15, antall: 95 },  rekkehus: { pris: 72000, liggetid: 22, antall: 10 }, enebolig: { pris: 85000, liggetid: 28, antall: 4 }},
  'Gamle Oslo':         { leilighet: { pris: 72000, liggetid: 18, antall: 130 }, rekkehus: { pris: 65000, liggetid: 24, antall: 7 },  enebolig: { pris: 78000, liggetid: 30, antall: 3 }},
  'Ullern':             { leilighet: { pris: 80000, liggetid: 20, antall: 65 },  rekkehus: { pris: 88000, liggetid: 25, antall: 20 }, enebolig: { pris: 105000, liggetid: 30, antall: 15 }},
  'Vestre Aker':        { leilighet: { pris: 75000, liggetid: 22, antall: 55 },  rekkehus: { pris: 82000, liggetid: 28, antall: 25 }, enebolig: { pris: 98000, liggetid: 35, antall: 18 }},
  'Nordre Aker':        { leilighet: { pris: 73000, liggetid: 19, antall: 70 },  rekkehus: { pris: 78000, liggetid: 24, antall: 18 }, enebolig: { pris: 92000, liggetid: 30, antall: 12 }},
  'Nordstrand':         { leilighet: { pris: 62000, liggetid: 22, antall: 60 },  rekkehus: { pris: 70000, liggetid: 28, antall: 22 }, enebolig: { pris: 82000, liggetid: 35, antall: 16 }},
  'Østensjø':           { leilighet: { pris: 58000, liggetid: 24, antall: 75 },  rekkehus: { pris: 62000, liggetid: 30, antall: 20 }, enebolig: { pris: 72000, liggetid: 38, antall: 10 }},
  'Bjerke':             { leilighet: { pris: 55000, liggetid: 20, antall: 80 },  rekkehus: { pris: 60000, liggetid: 26, antall: 15 }, enebolig: { pris: 68000, liggetid: 32, antall: 8 }},
  'Alna':               { leilighet: { pris: 48000, liggetid: 28, antall: 90 },  rekkehus: { pris: 55000, liggetid: 32, antall: 18 }, enebolig: { pris: 62000, liggetid: 40, antall: 10 }},
  'Grorud':             { leilighet: { pris: 42000, liggetid: 32, antall: 70 },  rekkehus: { pris: 50000, liggetid: 36, antall: 14 }, enebolig: { pris: 58000, liggetid: 42, antall: 8 }},
  'Stovner':            { leilighet: { pris: 38000, liggetid: 35, antall: 65 },  rekkehus: { pris: 45000, liggetid: 38, antall: 16 }, enebolig: { pris: 52000, liggetid: 45, antall: 10 }},
  'Søndre Nordstrand':  { leilighet: { pris: 40000, liggetid: 30, antall: 55 },  rekkehus: { pris: 48000, liggetid: 34, antall: 12 }, enebolig: { pris: 55000, liggetid: 42, antall: 7 }},
};

const kvartalLabels = ['Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'];

function generateTrend(currentPris, currentLiggetid) {
  const seed = currentPris + currentLiggetid;
  const prisTrend = [currentPris];
  const liggetidTrend = [currentLiggetid];
  let p = currentPris, l = currentLiggetid;
  for (let i = 6; i >= 0; i--) {
    const pChange = 0.01 + ((seed * (i + 1) * 7) % 13) / 1000;
    const lChange = 0.5 + ((seed * (i + 3) * 11) % 7) / 5;
    p = Math.round(p / (1 + pChange));
    l = Math.round(Math.max(5, l + (i % 2 === 0 ? lChange : -lChange)));
    prisTrend.unshift(p);
    liggetidTrend.unshift(l);
  }
  return { pris: prisTrend, liggetid: liggetidTrend };
}

// Seed the database
const insertBydel = db.prepare('INSERT OR IGNORE INTO bydeler (navn, lat, lng) VALUES (?, ?, ?)');
const insertPris = db.prepare(`
  INSERT OR REPLACE INTO boligpriser (bydel_id, boligtype, kvartal, pris_per_kvm, liggetid_dager, antall_annonser)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const seedAll = db.transaction(() => {
  for (const b of bydeler) {
    insertBydel.run(b.navn, b.lat, b.lng);
  }

  const getBydel = db.prepare('SELECT id FROM bydeler WHERE navn = ?');

  for (const [navn, types] of Object.entries(currentData)) {
    const bydel = getBydel.get(navn);
    if (!bydel) continue;

    for (const [boligtype, data] of Object.entries(types)) {
      const trend = generateTrend(data.pris, data.liggetid);
      // Antall varies slightly per quarter
      for (let qi = 0; qi < kvartalLabels.length; qi++) {
        const antallVariation = Math.round(data.antall * (0.85 + ((qi * 7 + data.pris) % 30) / 100));
        insertPris.run(
          bydel.id,
          boligtype,
          kvartalLabels[qi],
          trend.pris[qi],
          trend.liggetid[qi],
          antallVariation
        );
      }
    }
  }
});

seedAll();
console.log('Database seeded successfully!');
