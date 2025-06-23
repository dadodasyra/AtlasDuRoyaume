import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { getVersionedData } from '../logic/data';

export default function MapView() {
  const [mapData, setMapData] = useState(null);
  const [position, setPosition] = useState([45, 5]);

  useEffect(() => {
    getVersionedData().then((data) => {
      setMapData(data);
      const first = data.layers[0];
      if (first) setPosition([first.center[0], first.center[1]]);
    });
  }, []);

  return (
    <div className="map-container">
      {mapData ? (
        <MapContainer center={position} zoom={15} style={{ height: '100vh' }}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapData.layers.map((l) =>
            l.features.map((f) => (
              <Marker key={f.id} position={[f.lat, f.lng]}>
                <Popup>{f.name}</Popup>
              </Marker>
            ))
          )}
        </MapContainer>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}
