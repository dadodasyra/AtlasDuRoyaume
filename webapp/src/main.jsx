import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import MapView from './components/MapView.jsx';
import SettingsView from './components/SettingsView.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <header className="header noselect">
                <img src="/icons/logo.webp" alt="logo" className="logo"/>
                <h1>Atlas du Royaume</h1>
            </header>
            <div className="content noselect">
                <ErrorBoundary>
                    <Routes>
                        <Route path="/" element={<MapView/>}/>
                        <Route path="/settings" element={
                            <div className="settings-container">
                                <SettingsView/>
                            </div>
                        }/>
                    </Routes>
                </ErrorBoundary>
            </div>
            <nav className="nav-bottom noselect">
                <Link to="/">
                    <img src="/icons/map.svg" alt="Carte" style={{ width: 32, height: 32 }} />
                </Link>
                <Link to="/settings">
                    <img src="/icons/settings.svg" alt="Paramètres" style={{ width: 32, height: 32 }} />
                </Link>
            </nav>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
