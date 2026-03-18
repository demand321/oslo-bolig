const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'oslo-bolig.db'));
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS bydeler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    navn TEXT NOT NULL UNIQUE,
    lat REAL NOT NULL,
    lng REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS boligpriser (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bydel_id INTEGER NOT NULL,
    boligtype TEXT NOT NULL CHECK(boligtype IN ('leilighet', 'rekkehus', 'enebolig')),
    kvartal TEXT NOT NULL,
    pris_per_kvm INTEGER NOT NULL,
    liggetid_dager INTEGER NOT NULL,
    antall_annonser INTEGER NOT NULL,
    FOREIGN KEY (bydel_id) REFERENCES bydeler(id),
    UNIQUE(bydel_id, boligtype, kvartal)
  );
`);

module.exports = db;
