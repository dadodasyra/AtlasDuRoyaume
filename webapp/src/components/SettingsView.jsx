import { useState, useEffect } from 'react';
import { fetchTroops, createGroup, joinGroup, fetchGroups, leaveGroup } from '../logic/data';

export default function SettingsView() {
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [troops, setTroops] = useState([]);
  const [troopId, setTroopId] = useState(localStorage.getItem('troopId') || '');
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    fetchTroops().then(setTroops);
    if (nickname) fetchGroups(nickname).then(setGroups);
  }, [nickname]);

  const saveProfile = () => {
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('troopId', troopId);
  };

  const createGroupHandler = async () => {
    if (!newGroup || !nickname) return;
    const g = await createGroup(newGroup, nickname);
    setGroups([...groups, g]);
    setNewGroup('');
  };

  const joinGroupHandler = async () => {
    if (!joinCode || !nickname) return;
    await joinGroup(joinCode, nickname);
    setJoinCode('');
    fetchGroups(nickname).then(setGroups);
  };

  const leave = async (code) => {
    await leaveGroup(code, nickname);
    setGroups(groups.filter((g) => g.code !== code));
  };

  return (
    <div className="settings">
      <h2>Profil utilisateur</h2>
      <input placeholder="Surnom" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <select value={troopId} onChange={(e) => setTroopId(e.target.value)}>
        <option value="">Choisir une troupe</option>
        {troops.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <button onClick={saveProfile}>Enregistrer</button>

      <h2>Groupes</h2>
      <div className="group-actions">
        <input placeholder="Nom du groupe" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} />
        <button onClick={createGroupHandler}>Créer</button>
      </div>
      <div className="group-actions">
        <input placeholder="Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
        <button onClick={joinGroupHandler}>Rejoindre</button>
      </div>
      <ul>
        {groups.map((g) => (
          <li key={g.code}>{g.name} - {g.code} <button onClick={() => leave(g.code)}>Quitter</button></li>
        ))}
      </ul>
    </div>
  );
}
