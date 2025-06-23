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

export async function createGroup(name, nickname) {
  const r = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, nickname }),
  });
  return await r.json();
}

export async function joinGroup(code, nickname) {
  const r = await fetch(`${API_URL}/groups/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, nickname }),
  });
  if (!r.ok) {
    throw new Error('Code invalide');
  }
}

export async function leaveGroup(code, nickname) {
  await fetch(`${API_URL}/groups/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, nickname }),
  });
}

export async function fetchGroups(nickname) {
  const r = await fetch(`${API_URL}/groups/${encodeURIComponent(nickname)}`);
  return await r.json();
}
