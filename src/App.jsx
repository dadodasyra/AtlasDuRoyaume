import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MapPage from './pages/MapPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Carte</Link>
        <Link to="/settings">Paramètres</Link>
      </nav>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
