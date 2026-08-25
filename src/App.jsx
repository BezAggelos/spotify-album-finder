import './App.css';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';
import { spotify } from './spotify.js';
import { useState, useEffect } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    await spotify.authenticate();
  }

  useEffect(() => {
    const checkLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has('code');
      const token = await spotify.getAccessToken();

      if (hasCode) {
        try {
          await spotify.authenticate();
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Authentication failed (likely a stale code in URL), clearing URL.", err);
          window.history.replaceState({}, document.title, "/");
        }
      } else if (token) {
        setIsLoggedIn(true);
      }
    };
    checkLogin();
  }, []);

  return (
    <>
      {isLoggedIn ? (
        <Dashboard />
      ) : (
        <main className="login-page">
          <div className="login-card">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spotify-icon">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="M8 12c2.667-1.333 5.333-1.333 8 0"></path>
              <path d="M7 15c2.667-1.333 5.333-1.333 8 0"></path>
              <path d="M9 9c2-1 4-1 6 0"></path>
            </svg>
            <h1>Spotify Stats</h1>
            <p className="login-subtitle">Discover your listening habits, top tracks, and favorite artists with beautiful insights.</p>
            <Login onLogin={handleLogin} />
          </div>
        </main>
      )}
    </>
  )
}

export default App
