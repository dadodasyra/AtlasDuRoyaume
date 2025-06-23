import { useState, useEffect } from 'react';

const TROOPS = ['Aigles', 'Lions', 'Loups'];
const GROUPS_KEY = 'groups';
const USER_KEY = 'user';

function randomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random()*chars.length)];
  return code;
}

export default function SettingsPage() {
  const [nickname, setNickname] = useState('');
  const [troop, setTroop] = useState(TROOPS[0]);
  const [groups, setGroups] = useState([]);
  const [sharing, setSharing] = useState(false);
  const [bgSharing, setBgSharing] = useState(false);
  const [refreshRate, setRefreshRate] = useState('high');
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    if (u.nickname) setNickname(u.nickname);
    if (u.troop) setTroop(u.troop);
    const settings = u.settings || {};
    setSharing(!!settings.sharing);
    setBgSharing(!!settings.bgSharing);
    setRefreshRate(settings.refreshRate || 'high');
    const g = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
    setGroups(g);
  }, []);

  useEffect(() => {
    const user = {
      nickname,
      troop,
      settings: { sharing, bgSharing, refreshRate }
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [nickname, troop, sharing, bgSharing, refreshRate]);

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }, [groups]);

  const createGroup = () => {
    if (!newGroupName) return;
    setGroups([...groups, { name: newGroupName, code: randomCode() }]);
    setNewGroupName('');
  };

  const joinGroup = () => {
    if (!joinCode) return;
    if (!groups.find(g => g.code === joinCode)) {
      setGroups([...groups, { name: 'Groupe', code: joinCode }]);
    }
    setJoinCode('');
  };

  const leaveGroup = (code) => setGroups(groups.filter(g => g.code !== code));

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Paramètres</h2>

      <label>Ton pseudo
        <input value={nickname} onChange={e => setNickname(e.target.value)} />
      </label>
      <br />
      <label>Ta troupe
        <select value={troop} onChange={e => setTroop(e.target.value)}>
          {TROOPS.map(t => <option key={t}>{t}</option>)}
        </select>
      </label>

      <h3>Groupes de partage</h3>
      <ul>
        {groups.map(g => (
          <li key={g.code}>
            {g.name} ({g.code}) <button onClick={() => leaveGroup(g.code)}>Quitter</button>
          </li>
        ))}
      </ul>
      <div>
        <input placeholder="Nom du groupe" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
        <button onClick={createGroup}>Créer</button>
      </div>
      <div>
        <input placeholder="Code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
        <button onClick={joinGroup}>Rejoindre</button>
      </div>

      <h3>Partage de localisation</h3>
      <label>
        <input type="checkbox" checked={sharing} onChange={() => setSharing(!sharing)} />
        Activer le partage
      </label>
      <br />
      <label>
        <input type="checkbox" checked={bgSharing} onChange={() => setBgSharing(!bgSharing)} />
        Partage en arrière-plan
      </label>
      <br />
      <label>Fréquence d'envoi
        <select value={refreshRate} onChange={e => setRefreshRate(e.target.value)}>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
      </label>
    </div>
  );
}
