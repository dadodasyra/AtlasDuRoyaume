import {MapContainer, TileLayer, Marker, Popup, Polygon, ScaleControl} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useEffect, useState, useRef} from 'react';
import {getVersionedData} from '../logic/data';

const DEFAULT_CENTER = [44.5954983075345, 5.0105539538621136];

export default function MapView() {
    const [mapData, setMapData] = useState(null);
    const [center, setCenter] = useState(() => JSON.parse(localStorage.getItem('mapCenter') || JSON.stringify(DEFAULT_CENTER))); //TODO set mapCenter and mapZoom in localstorage
    const [zoom, setZoom] = useState(() => Number(localStorage.getItem('mapZoom') || 18));
    const [visible, setVisible] = useState({});
    const [showLegend, setShowLegend] = useState(false);
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');
    const [map, setMap] = useState(null);
    const recenter = async () => {
        try {
            if (window.__TAURI__) { //Check if android/IOS TODO: Check if working
                const {getCurrentPosition} = await import('@tauri-apps/plugin-geolocation');
                const pos = await getCurrentPosition();
                const coord = [pos.coords.latitude, pos.coords.longitude];
                map.setView(coord);
                setCenter(coord);
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(({coords}) => {
                    const coord = [coords.latitude, coords.longitude];
                    map.setView(coord);
                    setCenter(coord);
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (map) {
            map.invalidateSize();
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
        }).catch((err) => {
            console.error('Erreur lors du chargement des données de la carte:', err);
            setError('Erreur lors du chargement des données de la carte. Veuillez réessayer plus tard. ' + err.message);

            setTimeout(() => {
                getVersionedData()
                    .then((data) => setMapData(data))
                    .catch((retryErr) => console.error('Retry failed:', retryErr));
            }, 5000); // Retry after 5 seconds
        });
    }, []);

    const toggleLayer = (id) => {
        const v = {...visible, [id]: !visible[id]};
        setVisible(v);
        localStorage.setItem('visibleLayers', JSON.stringify(v));
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
                        zoomControl={false} //We don't need any zoom control buttons
                        attributionControl={false} //Disables leaflet watermark
                        style={{height: '100%', width: '100%'}}
                        ref={setMap}
                    >
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            maxNativeZoom={19}
                            maxZoom={21} // Maybe 20 is better (10m scale, currently 5m)
                        />
                        <ScaleControl position="bottomleft" imperial={false}/>
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
                    <button className="legend-btn" onClick={() => setShowLegend(!showLegend)}>🗺️</button>
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
                <div className="loading">
                    <p>Chargement de la carte...<br/>Connexion au serveur...<br/><br/>Cela ne devrait pas prendre plus
                        de 5
                        secondes..</p>
                    {error && <p className="error">{error}</p>}
                    <div className="loading-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                            width="50"
                            height="50"
                            className="spinner"
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                strokeWidth="10"
                                stroke="#4b3b2b"
                                strokeDasharray="200"
                                strokeDashoffset="100"
                                fill="none"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
