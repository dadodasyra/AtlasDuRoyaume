import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapData } from '../services/DataService';

const center = [48.8584, 2.2945];

export default function MapPage() {
  const [data, setData] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({});

  useEffect(() => {
    getMapData().then(d => {
      setData(d);
      const vis = {};
      d.layers.forEach(l => vis[l.id] = true);
      setVisibleLayers(vis);
    });
  }, []);

  if (!data) return <p>Chargement de la carte...</p>;

  const toggle = id => setVisibleLayers(v => ({ ...v, [id]: !v[id] }));

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={center} zoom={16} style={{ height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {data.layers.map(layer => visibleLayers[layer.id] && (
          <LayerGroup key={layer.id}>
            {layer.features.map((f, i) => (
              <Marker position={[f.lat, f.lng]} key={i}>
                <Popup>{f.name}</Popup>
              </Marker>
            ))}
          </LayerGroup>
        ))}
      </MapContainer>
      <div style={{ position: 'absolute', top: 10, left: 10, background: '#fff9', padding: '0.5rem', borderRadius: 8 }}>
        <h4>Légende</h4>
        {data.layers.map(layer => (
          <label key={layer.id} style={{ display: 'block' }}>
            <input type="checkbox" checked={visibleLayers[layer.id]} onChange={() => toggle(layer.id)} />
            {layer.name}
          </label>
        ))}
      </div>
    </div>
  );
}
