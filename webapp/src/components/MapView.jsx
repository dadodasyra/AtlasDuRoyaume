import { MapContainer, TileLayer, Marker, Popup, Polygon, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import { getVersionedData } from '../logic/data';

const DEFAULT_CENTER = [44.5954983075345, 5.0105539538621136];

export default function MapView() {
  const [mapData, setMapData] = useState(null);
  const [center, setCenter] = useState(() => JSON.parse(localStorage.getItem('mapCenter') || JSON.stringify(DEFAULT_CENTER)));
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem('mapZoom') || 18));
  const [visible, setVisible] = useState({});
  const [showLegend, setShowLegend] = useState(false);
  const [query, setQuery] = useState('');
  const mapRef = useRef(null);
  const recenter = async () => {
    try {
      if (window.__TAURI__) {
        const { getCurrentPosition } = await import('@tauri-apps/plugin-geolocation');
        const pos = await getCurrentPosition();
        const coord = [pos.coords.latitude, pos.coords.longitude];
        mapRef.current.setView(coord);
        setCenter(coord);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(({ coords }) => {
          const coord = [coords.latitude, coords.longitude];
          mapRef.current.setView(coord);
          setCenter(coord);
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, [showLegend]);

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
      const z = mapRef.current.getZoom();
      setZoom(z);
      localStorage.setItem('mapZoom', String(z));
    }
  };

  const lowerQuery = query.toLowerCase();
  const filteredLayers = mapData
    ? mapData.layers.filter(
        (l) =>
          l.name.toLowerCase().includes(lowerQuery) ||
          l.features.some((f) => f.name.toLowerCase().includes(lowerQuery))
      )
    : [];

  return (
    <div className="map-container">
      {mapData ? (
        <>
          <MapContainer
            center={center}
            zoom={zoom}
            maxZoom={19}
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => (mapRef.current = map)}
            onmoveend={handleMove}
            attributionControl={false}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={19}
              maxZoom={19}
            />
            <ScaleControl position="bottomleft" imperial={false} />
            {filteredLayers.map((l) =>
              visible[l.id]
                ? l.features
                    .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
                    .map((f) =>
                      f.path ? (
                        <Polygon key={f.id} positions={f.path}>
                          <Popup>{f.name}</Popup>
                        </Polygon>
                      ) : (
                        <Marker key={f.id} position={[f.lat, f.lng]}>
                          <Popup>{f.name}</Popup>
                        </Marker>
                      )
                    )
                : null
            )}
          </MapContainer>
          <button className="legend-btn" onClick={() => setShowLegend(!showLegend)}>
            🗺️
          </button>
          <button className="locate-btn" onClick={recenter}>📍</button>
          {showLegend && (
            <div className="legend-panel">
              <input
                className="search"
                placeholder="Recherche..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {filteredLayers.map((l) => (
                <div
                  key={l.id}
                  className={visible[l.id] ? 'legend-item' : 'legend-item disabled'}
                  onClick={() => toggleLayer(l.id)}
                >
                  <span className="legend-icon">{l.icon}</span>
                  <span>{l.name}</span>
                </div>
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
