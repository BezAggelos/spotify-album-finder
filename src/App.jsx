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
        await spotify.authenticate();
        setIsLoggedIn(true);
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
        <main>
          <h1>Welcome to Spotify Stats</h1>
          <Login onLogin={handleLogin} />
        </main>
      )}
    </>
  )
}

export default App
