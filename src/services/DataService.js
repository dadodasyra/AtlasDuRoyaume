const STORAGE_KEY = 'mapData';

export async function getMapData() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      const res = await fetch('/mapdata.json');
      const latest = await res.json();
      if (latest.version === data.version) {
        return data;
      }
    } catch (e) {
      console.error('Failed to check latest map data', e);
      return JSON.parse(cached);
    }
  }
  const res = await fetch('/mapdata.json');
  const data = await res.json();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}
