import { useState, useEffect } from 'react';
import { fetchTroops, createGroup, joinGroup, fetchGroups, leaveGroup, registerUser } from '../logic/data';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default function SettingsView() {
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
    if (!joinCode || !nickname) {
      setError('Code invalide');
      return;
    }
    try {
      await joinGroup(joinCode, nickname);
      setJoinCode('');
      fetchGroups(nickname).then(setGroups);
      setError('');
    } catch (e) {
      setError('Code introuvable');
    }
  };

  const leave = async (code) => {
    await leaveGroup(code, nickname);
    setGroups(groups.filter((g) => g.code !== code));
  };

  return (
    <div className="settings">
      <div className="settings-card">
        <h2>Profil utilisateur</h2>
        <input placeholder="Surnom" value={nickname} onChange={(e) => setNickname(e.target.value)} />
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
          <input placeholder="Nom du groupe" value={newGroup} onChange={(e) => setNewGroup(capitalize(e.target.value))} />
          <button onClick={createGroupHandler}>Créer</button>
        </div>
        <div className="group-actions">
          <input placeholder="Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
          <button onClick={joinGroupHandler}>Rejoindre</button>
        </div>
        <ul>
          {groups.map((g) => (
            <li key={g.code}>{g.name} - {g.code} <button onClick={() => leave(g.code)}>Quitter</button></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
