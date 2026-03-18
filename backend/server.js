const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /api/bydeler — all districts with coordinates
app.get('/api/bydeler', (req, res) => {
  const rows = db.prepare('SELECT id, navn, lat, lng FROM bydeler ORDER BY navn').all();
  res.json(rows);
});

// GET /api/priser?kvartal=Q1 2026&boligtype=leilighet
// Returns current prices per bydel. Defaults to latest quarter, all types aggregated.
app.get('/api/priser', (req, res) => {
  const { kvartal, boligtype } = req.query;
  const targetKvartal = kvartal || 'Q1 2026';

  let query, params;
  if (boligtype && boligtype !== 'alle') {
    query = `
      SELECT b.id, b.navn, b.lat, b.lng,
             p.pris_per_kvm AS pris,
             p.liggetid_dager AS liggetid,
             p.antall_annonser AS antall
      FROM bydeler b
      JOIN boligpriser p ON p.bydel_id = b.id
      WHERE p.kvartal = ? AND p.boligtype = ?
      ORDER BY b.navn
    `;
    params = [targetKvartal, boligtype];
  } else {
    // Weighted average across types
    query = `
      SELECT b.id, b.navn, b.lat, b.lng,
             CAST(ROUND(SUM(p.pris_per_kvm * p.antall_annonser) * 1.0 / SUM(p.antall_annonser)) AS INTEGER) AS pris,
             CAST(ROUND(SUM(p.liggetid_dager * p.antall_annonser) * 1.0 / SUM(p.antall_annonser)) AS INTEGER) AS liggetid,
             SUM(p.antall_annonser) AS antall
      FROM bydeler b
      JOIN boligpriser p ON p.bydel_id = b.id
      WHERE p.kvartal = ?
      GROUP BY b.id
      ORDER BY b.navn
    `;
    params = [targetKvartal];
  }

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// GET /api/priser/:bydelId/detaljer?kvartal=Q1 2026
// Returns all housing types for a specific bydel
app.get('/api/priser/:bydelId/detaljer', (req, res) => {
  const bydelId = parseInt(req.params.bydelId, 10);
  if (isNaN(bydelId)) return res.status(400).json({ error: 'Invalid bydel ID' });

  const kvartal = req.query.kvartal || 'Q1 2026';
  const rows = db.prepare(`
    SELECT boligtype, pris_per_kvm AS pris, liggetid_dager AS liggetid, antall_annonser AS antall
    FROM boligpriser
    WHERE bydel_id = ? AND kvartal = ?
    ORDER BY boligtype
  `).all(bydelId, kvartal);

  res.json(rows);
});

// GET /api/trender?bydeler=1,3,5&boligtype=leilighet
// Returns quarterly trend data for selected bydeler
app.get('/api/trender', (req, res) => {
  const { bydeler: bydelIds, boligtype } = req.query;
  if (!bydelIds) return res.status(400).json({ error: 'bydeler parameter required' });

  const ids = bydelIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  if (ids.length === 0) return res.status(400).json({ error: 'No valid bydel IDs' });

  const placeholders = ids.map(() => '?').join(',');
  const type = boligtype && boligtype !== 'alle' ? boligtype : null;

  let query, params;
  if (type) {
    query = `
      SELECT b.id, b.navn, p.kvartal,
             p.pris_per_kvm AS pris,
             p.liggetid_dager AS liggetid
      FROM bydeler b
      JOIN boligpriser p ON p.bydel_id = b.id
      WHERE b.id IN (${placeholders}) AND p.boligtype = ?
      ORDER BY b.navn, p.kvartal
    `;
    params = [...ids, type];
  } else {
    query = `
      SELECT b.id, b.navn, p.kvartal,
             CAST(ROUND(SUM(p.pris_per_kvm * p.antall_annonser) * 1.0 / SUM(p.antall_annonser)) AS INTEGER) AS pris,
             CAST(ROUND(SUM(p.liggetid_dager * p.antall_annonser) * 1.0 / SUM(p.antall_annonser)) AS INTEGER) AS liggetid
      FROM bydeler b
      JOIN boligpriser p ON p.bydel_id = b.id
      WHERE b.id IN (${placeholders})
      GROUP BY b.id, p.kvartal
      ORDER BY b.navn, p.kvartal
    `;
    params = ids;
  }

  const rows = db.prepare(query).all(...params);

  // Group by bydel
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.id]) grouped[row.id] = { id: row.id, navn: row.navn, data: [] };
    grouped[row.id].data.push({ kvartal: row.kvartal, pris: row.pris, liggetid: row.liggetid });
  }

  res.json(Object.values(grouped));
});

// GET /api/trender/gjennomsnitt?boligtype=alle
// Returns Oslo-wide average trends
app.get('/api/trender/gjennomsnitt', (req, res) => {
  const { boligtype } = req.query;
  const type = boligtype && boligtype !== 'alle' ? boligtype : null;

  let query, params;
  if (type) {
    query = `
      SELECT kvartal,
             CAST(ROUND(AVG(pris_per_kvm)) AS INTEGER) AS pris,
             CAST(ROUND(AVG(liggetid_dager)) AS INTEGER) AS liggetid
      FROM boligpriser
      WHERE boligtype = ?
      GROUP BY kvartal
      ORDER BY kvartal
    `;
    params = [type];
  } else {
    query = `
      SELECT kvartal,
             CAST(ROUND(SUM(pris_per_kvm * antall_annonser) * 1.0 / SUM(antall_annonser)) AS INTEGER) AS pris,
             CAST(ROUND(SUM(liggetid_dager * antall_annonser) * 1.0 / SUM(antall_annonser)) AS INTEGER) AS liggetid
      FROM boligpriser
      GROUP BY kvartal
      ORDER BY kvartal
    `;
    params = [];
  }

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// GET /api/kvartaler — list available quarters
app.get('/api/kvartaler', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT kvartal FROM boligpriser ORDER BY kvartal').all();
  res.json(rows.map(r => r.kvartal));
});

app.listen(PORT, () => {
  console.log(`Oslo Bolig API running on http://localhost:${PORT}`);
});
