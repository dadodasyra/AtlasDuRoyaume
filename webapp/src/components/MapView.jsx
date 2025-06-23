import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import { getVersionedData } from '../logic/data';

const DEFAULT_CENTER = [44.5954983075345, 5.0105539538621136];

export default function MapView() {
  const [mapData, setMapData] = useState(null);
  const [center, setCenter] = useState(() => JSON.parse(localStorage.getItem('mapCenter') || JSON.stringify(DEFAULT_CENTER)));
  const [visible, setVisible] = useState({});
  const [showLegend, setShowLegend] = useState(false);
  const [query, setQuery] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    getVersionedData().then((data) => {
      setMapData(data);
      const saved = JSON.parse(localStorage.getItem('visibleLayers') || 'null');
      const vis = {};
      data.layers.forEach((l) => {
        vis[l.id] = saved ? saved[l.id] !== false : true;
      });
      setVisible(vis);
    });
  }, []);

  const toggleLayer = (id) => {
    const v = { ...visible, [id]: !visible[id] };
    setVisible(v);
    localStorage.setItem('visibleLayers', JSON.stringify(v));
  };

  const handleMove = () => {
    if (mapRef.current) {
      const c = mapRef.current.getCenter();
      const coord = [c.lat, c.lng];
      setCenter(coord);
      localStorage.setItem('mapCenter', JSON.stringify(coord));
    }
  };

  return (
    <div className="map-container">
      {mapData ? (
        <>
          <MapContainer
            center={center}
            zoom={17}
            style={{ height: '100vh' }}
            whenCreated={(map) => (mapRef.current = map)}
            onmoveend={handleMove}
          >
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            {mapData.layers.map((l) =>
              visible[l.id]
                ? l.features
                    .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
                    .map((f) => (
                      <Marker key={f.id} position={[f.lat, f.lng]}>
                        <Popup>{f.name}</Popup>
                      </Marker>
                    ))
                : null
            )}
          </MapContainer>
          <button className="legend-btn" onClick={() => setShowLegend(!showLegend)}>
            Légende
          </button>
          {showLegend && (
            <div className="legend-panel">
              <input
                className="search"
                placeholder="Recherche..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {mapData.layers.map((l) => (
                <label key={l.id}>
                  <input
                    type="checkbox"
                    checked={visible[l.id]}
                    onChange={() => toggleLayer(l.id)}
                  />
                  {l.name}
                </label>
              ))}
            </div>
          )}
        </>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}
