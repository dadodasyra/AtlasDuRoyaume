import { useState, useEffect } from 'react';
import { fetchTroops, generateCode } from '../logic/data';

export default function SettingsView() {
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [troops, setTroops] = useState([]);
  const [troopId, setTroopId] = useState(localStorage.getItem('troopId') || '');
  const [groups, setGroups] = useState(() => JSON.parse(localStorage.getItem('groups') || '[]'));

  useEffect(() => {
    fetchTroops().then(setTroops);
  }, []);

  const saveProfile = () => {
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('troopId', troopId);
  };

  const createGroup = async (name) => {
    const code = await generateCode();
    const newGroup = { name, code };
    const list = [...groups, newGroup];
    setGroups(list);
    localStorage.setItem('groups', JSON.stringify(list));
  };

  const leaveGroup = (code) => {
    const list = groups.filter((g) => g.code !== code);
    setGroups(list);
    localStorage.setItem('groups', JSON.stringify(list));
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
      <button onClick={() => createGroup('Nouveau groupe')}>Créer un groupe</button>
      <ul>
        {groups.map((g) => (
          <li key={g.code}>{g.name} - {g.code} <button onClick={() => leaveGroup(g.code)}>Quitter</button></li>
        ))}
      </ul>
    </div>
  );
}
