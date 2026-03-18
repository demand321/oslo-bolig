const BASE = 'http://localhost:3001/api';

export async function fetchBydeler() {
  const res = await fetch(`${BASE}/bydeler`);
  return res.json();
}

export async function fetchPriser(kvartal, boligtype) {
  const params = new URLSearchParams();
  if (kvartal) params.set('kvartal', kvartal);
  if (boligtype) params.set('boligtype', boligtype);
  const res = await fetch(`${BASE}/priser?${params}`);
  return res.json();
}

export async function fetchBydelDetaljer(bydelId, kvartal) {
  const params = new URLSearchParams();
  if (kvartal) params.set('kvartal', kvartal);
  const res = await fetch(`${BASE}/priser/${bydelId}/detaljer?${params}`);
  return res.json();
}

export async function fetchTrender(bydelIds, boligtype) {
  const params = new URLSearchParams();
  params.set('bydeler', bydelIds.join(','));
  if (boligtype) params.set('boligtype', boligtype);
  const res = await fetch(`${BASE}/trender?${params}`);
  return res.json();
}

export async function fetchGjennomsnitt(boligtype) {
  const params = new URLSearchParams();
  if (boligtype) params.set('boligtype', boligtype);
  const res = await fetch(`${BASE}/trender/gjennomsnitt?${params}`);
  return res.json();
}

export async function fetchKvartaler() {
  const res = await fetch(`${BASE}/kvartaler`);
  return res.json();
}
