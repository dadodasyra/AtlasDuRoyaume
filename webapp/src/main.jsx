import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MapView from './components/MapView.jsx';
import SettingsView from './components/SettingsView.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="header">
        <h1>Rallye nationale</h1>
        <nav>
          <Link to="/">Carte</Link> | <Link to="/settings">Param\u00E8tres</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
