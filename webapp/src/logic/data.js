const API_URL = 'http://localhost:8000';

export async function fetchMapData() {
  const r = await fetch(`${API_URL}/map-data`);
  return await r.json();
}

export async function getVersionedData() {
  const cached = localStorage.getItem('mapData');
  const cachedVersion = localStorage.getItem('mapVersion');
  const remote = await fetchMapData();
  if (!cached || cachedVersion !== String(remote.version)) {
    localStorage.setItem('mapData', JSON.stringify(remote));
    localStorage.setItem('mapVersion', remote.version);
    return remote;
  }
  return JSON.parse(cached);
}

export async function fetchTroops() {
  const r = await fetch(`${API_URL}/troops`);
  return await r.json();
}

export async function generateCode() {
  const r = await fetch(`${API_URL}/group-code`, { method: 'POST' });
  return await r.text();
}
