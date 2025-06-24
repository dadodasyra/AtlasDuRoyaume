import {useState, useEffect} from 'react';
import {fetchTroops, createGroup, joinGroup, fetchGroups, leaveGroup, registerUser} from '../logic/data';

const TILESETS = [
    {name: '⭐Esri Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom: 19},
    {name: 'Google Satellite', url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], maxZoom: 21},
    {name: 'Géoportail Satellite', url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}', maxZoom: 19}, //same provider as mapbox
    {name: 'Géoportail IGN', url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}', maxZoom: 18},
];
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default function SettingsView() {
    const [selectedTileset, setSelectedTileset] = useState(localStorage.getItem('tilesetURL') || TILESETS[0].url);
    const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
    const [troops, setTroops] = useState([]);
    const [troopId, setTroopId] = useState(localStorage.getItem('troopId') || '');
    const [groups, setGroups] = useState([]);
    const [newGroup, setNewGroup] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTroops().then(setTroops);
        if (nickname) fetchGroups(nickname).then(setGroups);
    }, []);

    const saveProfile = () => {
        const capped = capitalize(nickname);
        setNickname(capped);
        localStorage.setItem('nickname', capped);
        localStorage.setItem('troopId', troopId);
        if (capped) {
            registerUser(capped);
            fetchGroups(capped).then(setGroups);
        }
    };

    const createGroupHandler = async () => {
        if (!newGroup || !nickname) {
            setError('Nom manquant');
            return;
        }
        const g = await createGroup(capitalize(newGroup), nickname);
        setGroups([...groups, g]);
        setNewGroup('');
        setError('');
    };

    const joinGroupHandler = async () => {
        if (!nickname) {
            setError('Veuillez d\'abord enregistrer votre profil');
            return;
        } else if (!joinCode) {
            setError('Code invalide');
            return;
        } else if (joinCode.length !== 5) {
            setError('Le code doit comporter 5 caractères');
            return;
        }

        try {
            await joinGroup(joinCode, nickname);
            setJoinCode('');
            fetchGroups(nickname).then(setGroups);
            setError('');
        } catch (e) {
            setError(e.message);
        }
    };

    const leave = async (code) => {
        await leaveGroup(code, nickname);
        setGroups(groups.filter((g) => g.code !== code));
    };

    const saveTileset = (url) => {
        const selected = TILESETS.find((tileset) => tileset.url === url);
        setSelectedTileset(url);
        localStorage.setItem('tilesetURL', url);
        localStorage.setItem('tilesetSubdomains', JSON.stringify(selected.subdomains || []));
        localStorage.setItem('tilesetMaxZoom', selected.maxZoom || 19);
    };
    return (
        <div className="settings">
            <div className="settings-card">
                <h2>Profil utilisateur</h2>
                <input placeholder="Surnom" value={nickname} onChange={(e) => setNickname(e.target.value)}/>
                <select value={troopId} onChange={(e) => setTroopId(e.target.value)}>
                    <option value="">Choisir une troupe</option>
                    {troops.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <button onClick={saveProfile}>Enregistrer</button>
            </div>

            <div className="settings-card">
                <h2>Groupes</h2>
                {error && <p className="error">{error}</p>}
                <div className="group-actions">
                    <input placeholder="Nom du groupe" value={newGroup}
                           onChange={(e) => setNewGroup(capitalize(e.target.value))}/>
                    <button onClick={createGroupHandler}>Créer</button>
                </div>
                <div className="group-actions">
                    <input placeholder="Code" value={joinCode}
                           onChange={(e) => setJoinCode(e.target.value.toUpperCase())}/>
                    <button onClick={joinGroupHandler}>Rejoindre</button>
                </div>
                <ul>
                    {groups.map((g) => (
                        <li key={g.code}>{g.name} - {g.code}
                            <button onClick={() => leave(g.code)}>Quitter</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="settings-card">
                <h2>Carte</h2>
                <select value={selectedTileset} onChange={(e) => saveTileset(e.target.value)}>
                    {TILESETS.map((tileset) => (
                        <option key={tileset.name} value={tileset.url}>
                            {tileset.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
