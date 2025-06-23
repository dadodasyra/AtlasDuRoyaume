import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MapView from './components/MapView.jsx';
import SettingsView from './components/SettingsView.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="header">
        <img src="/logo.svg" alt="logo" className="logo" />
        <h1>Atlas du Royaume</h1>
      </header>
      <div className="content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </ErrorBoundary>
      </div>
      <nav className="nav-bottom">
        <Link to="/">Carte</Link>
        <Link to="/settings">Paramètres</Link>
      </nav>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
