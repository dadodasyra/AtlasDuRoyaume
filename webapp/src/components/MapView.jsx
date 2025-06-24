import {MapContainer, TileLayer, Marker, Popup, Polygon, ScaleControl} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useEffect, useState} from 'react';
import {getVersionedData} from '../logic/data';

const DEFAULT_CENTER = [44.5954983075345, 5.0105539538621136];
const DEFAULT_TILESET = {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: '[]', //in string because it's parsed by json
    maxZoom: 19
}

export default function MapView() {
    const [tileset, setTileset] = useState(localStorage.getItem('tilesetURL') || DEFAULT_TILESET.url);
    const [subdomains, setsubdomains] = useState(() => JSON.parse(localStorage.getItem('tilesetSubdomains') || DEFAULT_TILESET.subdomains));
    const [tilesetMaxZoom, setTilesetMaxZoom] = useState(() => Number(localStorage.getItem('tilesetMaxZoom') || DEFAULT_TILESET.maxZoom));

    const [mapData, setMapData] = useState(null);
    const [center, setCenter] = useState(() => JSON.parse(localStorage.getItem('mapCenter') || JSON.stringify(DEFAULT_CENTER))); //TODO set mapCenter and mapZoom in localstorage
    const [zoom, setZoom] = useState(() => Number(localStorage.getItem('mapZoom') || 18));
    const [visible, setVisible] = useState({});
    const [showLegend, setShowLegend] = useState(false);
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');
    const [map, setMap] = useState(null);
    const [location, setLocation] = useState(null);

    const recenter = async () => map?.setView(location); //TODO location may be null, handle this case

    function onLocationFound(e) {
        console.log("Location found:", e);
        setLocation(e.latlng);
        L.marker(e.latlng).addTo(map).bindPopup("Votre position (" + e.accuracy + "~ m)");
        L.circle(e.latlng, {radius: e.accuracy, opacity: 0.3}).addTo(map);
    }

    function onLocationError(e) {
        console.error("Location error:", e);
        setError("Erreur de localisation: " + e.message); //TODO: show this error somewhere
    }

    useEffect(() => { map?.invalidateSize() }, [showLegend]);

    useEffect(() => {
        if (!map) return;
        const saveMapState = () => {
            const mapCenter = map.getCenter();
            localStorage.setItem('mapCenter', JSON.stringify({ lat: mapCenter.lat, lng: mapCenter.lng }));
            localStorage.setItem('mapZoom', map.getZoom());
        };

        map.on('moveend', saveMapState); //TODO: we should only save move and zoom when users closes the map, not every time they move or zoom
        map.on('zoomend', saveMapState);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.locate({watch: true, enableHighAccuracy: true}); // Keep watching the location TODO: high accuracy should be a setting

        return () => {
            map.off('moveend', saveMapState);
            map.off('zoomend', saveMapState);
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);
            map.stopLocate(); // Stop watching the location
        }
    }, [map]);

    useEffect(() => {
        const storedTileset = localStorage.getItem('tilesetURL');
        setTileset(storedTileset || DEFAULT_TILESET.url);

        const storedSubdomains = JSON.parse(localStorage.getItem('tilesetSubdomains') || '[]');
        setsubdomains(storedSubdomains || DEFAULT_TILESET.subdomains);

        const storedMaxZoom = localStorage.getItem('tilesetMaxZoom');
        setTilesetMaxZoom(storedMaxZoom ? Number(storedMaxZoom) : DEFAULT_TILESET.maxZoom);

        updateMapLayers();
    }, []);

    const updateMapLayers = () => {
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
                updateMapLayers();
            }, 5000); // Retry after 5 seconds
        });
    }

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
                            url={tileset}
                            subdomains={subdomains}
                            maxNativeZoom={tilesetMaxZoom}//IGN map is bad after 18
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
