# Oslo Boligmarked — Priser & Liggetider

Webapplikasjon som visualiserer boligpriser og liggetider fordelt på Oslos 15 bydeler.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Backend](https://img.shields.io/badge/Express-SQLite-green)

## Funksjonalitet

### Oversikt
- Statistikkort med snittpris, liggetid, antall annonser og dyrest bydel
- Søylediagram for pris per kvm og liggetid per bydel
- Sorterbar tabell med tempo-indikatorer (Raskt/Middels/Tregt)
- Filtrering på boligtype (leilighet, rekkehus, enebolig) og maks pris

### Kart
- Interaktivt kart over Oslo (Leaflet + CARTO dark basemap)
- Sirkler per bydel, fargekodet etter pris, liggetid eller antall annonser
- Klikkbare markører med detaljpanel i sidebar
- Fly-to-animasjon ved valg av bydel

### Trender
- Prisutvikling og liggetid over 8 kvartaler (Q2 2024 — Q1 2026)
- Sammenlign opptil 6 bydeler samtidig
- Oslo gjennomsnitt med dobbel Y-akse (pris vs. liggetid)
- Filtrerbart per boligtype

## Teknologi

| Komponent | Teknologi |
|-----------|-----------|
| Frontend | React 19, Vite, react-chartjs-2, react-leaflet |
| Backend | Node.js, Express, better-sqlite3 |
| Database | SQLite |
| Kart | Leaflet + CARTO dark tiles |
| Grafer | Chart.js |

## Prosjektstruktur

```
oslo-bolig/
├── backend/
│   ├── db.js            # Database-oppsett og tabellskjema
│   ├── seed.js          # Populerer databasen med mock-data
│   ├── server.js        # Express API-server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Oversikt.jsx   # Statistikk, diagrammer og tabell
│   │   │   ├── Kart.jsx       # Interaktivt Leaflet-kart
│   │   │   └── Trender.jsx    # Trendgrafer med bydel-sammenligning
│   │   ├── api.js             # API-klient
│   │   ├── utils.js           # Hjelpefunksjoner og konstanter
│   │   ├── App.jsx            # Hovedkomponent med tab-navigasjon
│   │   └── App.css            # Styling
│   └── package.json
├── index.html           # Standalone HTML-prototype (ingen backend nødvendig)
└── README.md
```

## Database

SQLite med to tabeller:

**bydeler**
| Kolonne | Type | Beskrivelse |
|---------|------|-------------|
| id | INTEGER | Primærnøkkel |
| navn | TEXT | Bydelsnavn |
| lat | REAL | Breddegrad |
| lng | REAL | Lengdegrad |

**boligpriser**
| Kolonne | Type | Beskrivelse |
|---------|------|-------------|
| id | INTEGER | Primærnøkkel |
| bydel_id | INTEGER | Fremmednøkkel til bydeler |
| boligtype | TEXT | leilighet, rekkehus, enebolig |
| kvartal | TEXT | F.eks. "Q1 2026" |
| pris_per_kvm | INTEGER | Gjennomsnittspris per kvm |
| liggetid_dager | INTEGER | Snitt dager på markedet |
| antall_annonser | INTEGER | Antall aktive annonser |

## API-endepunkter

| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| GET | `/api/bydeler` | Alle bydeler med koordinater |
| GET | `/api/priser?kvartal=&boligtype=` | Priser per bydel (vektet snitt hvis alle typer) |
| GET | `/api/priser/:id/detaljer?kvartal=` | Alle boligtyper for én bydel |
| GET | `/api/trender?bydeler=1,3,5&boligtype=` | Kvartalstrender for valgte bydeler |
| GET | `/api/trender/gjennomsnitt?boligtype=` | Oslo-gjennomsnitt over tid |
| GET | `/api/kvartaler` | Liste over tilgjengelige kvartaler |

## Kom i gang

### Forutsetninger
- Node.js 18+

### Installasjon

```bash
# Backend
cd backend
npm install
node seed.js    # Opprett og populer databasen

# Frontend
cd ../frontend
npm install
```

### Kjør applikasjonen

Start backend og frontend i hver sin terminal:

```bash
# Terminal 1 — Backend (port 3001)
cd backend
node server.js

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Åpne http://localhost:5173 i nettleseren.

### Standalone-versjon

Åpne `index.html` direkte i nettleseren for en prototype uten backend (all data innebygd).

## Data

Dataene er representative mock-data som gjenspeiler relative prisforskjeller mellom Oslos bydeler. De er ikke hentet fra en offisiell kilde.

Potensielle kilder for reelle data:
- **SSB** — Statistisk sentralbyrå (åpent API)
- **Eiendom Norge** — Månedlige boligprisrapporter
- **Oslo kommune** — Åpne datasett

## Lisens

MIT
