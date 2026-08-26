import { useState, useEffect } from 'react';
import { spotify } from '../spotify';

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  return minutes + ":" + seconds;
}

export default function Player() {
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queueItems, setQueueItems] = useState([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = async () => {
      try {
        const tokenData = await spotify.getAccessToken();
        const token = tokenData.access_token;

        const player = new window.Spotify.Player({
          name: 'Spotify Stats Web Player',
          getOAuthToken: cb => { cb(token); },
          volume: volume
        });

        setPlayer(player);

        player.addListener('ready', async ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          try {
            await spotify.player.transferPlayback([device_id], false);
          } catch (e) {
            console.error("Failed to transfer playback automatically", e);
          }
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error(message);
          setErrorMsg("Failed to initialize player.");
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error(message);
          setErrorMsg("Authentication error.");
        });

        player.addListener('account_error', ({ message }) => {
          console.error(message);
          setErrorMsg("Premium required for playback.");
        });

        player.addListener('player_state_changed', (state) => {
          if (!state) return;

          setTrack(state.track_window.current_track);
          setPaused(state.paused);
          setDurationMs(state.duration);
          
          if (!isSeeking) {
            setPositionMs(state.position);
          }

          player.getCurrentState().then(state => { 
            (!state) ? setActive(false) : setActive(true) 
          });
        });

        player.connect();
      } catch (err) {
        console.error("Error setting up player", err);
      }
    };

    return () => {
      if (player) player.disconnect();
      document.body.removeChild(script);
      delete window.onSpotifyWebPlaybackSDKReady;
    };
  }, []);

  // Timer to continuously update the progress bar when playing
  useEffect(() => {
    let interval = null;
    if (!is_paused && is_active && !isSeeking) {
      interval = setInterval(() => {
        setPositionMs((prev) => Math.min(prev + 1000, durationMs));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [is_paused, is_active, durationMs, isSeeking]);

  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setPositionMs(Number(e.target.value));
  };

  const handleSeekMouseUp = async (e) => {
    setIsSeeking(false);
    const newPos = Number(e.target.value);
    if (player) {
      await player.seek(newPos);
    }
  };

  const handleVolumeChange = async (e) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (player) {
      await player.setVolume(newVol);
    }
  };

  const fetchQueue = async () => {
    try {
      const q = await spotify.player.getUsersQueue();
      if (q && q.queue) {
        setQueueItems(q.queue);
      }
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  };

  useEffect(() => {
    if (isQueueOpen) {
      fetchQueue();
    }
  }, [isQueueOpen, current_track]);

  if (errorMsg) {
    return (
      <div className="player-bar" style={{ display: 'flex', justifyContent: 'center', color: '#ff4444' }}>
        <p>{errorMsg}</p>
      </div>
    );
  }

  if (!is_active || !current_track) {
    return (
      <div className="player-bar" style={{ display: 'flex', justifyContent: 'center', color: '#b3b3b3' }}>
        <p>Listening on another device? Play something on Spotify to see it here!</p>
      </div>
    );
  }

  const progressPercent = durationMs ? (positionMs / durationMs) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div className="player-bar">
      <div className="player-left">
        <img 
          src={current_track.album.images[0]?.url} 
          className="player-track-image" 
          alt={current_track.name} 
        />
        <div className="player-track-info">
          <div className="player-track-title">{current_track.name}</div>
          <div className="player-track-artist">
            {current_track.artists.map(artist => artist.name).join(', ')}
          </div>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className="control-button" onClick={() => { player.previousTrack() }}>
            <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"></path></svg>
          </button>
          
          <button className="play-pause-btn" onClick={() => { player.togglePlay() }}>
            {is_paused ? (
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>
            ) : (
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
            )}
          </button>

          <button className="control-button" onClick={() => { player.nextTrack() }}>
            <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"></path></svg>
          </button>
        </div>
        
        <div className="player-progress" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <span style={{ fontSize: '12px', color: '#b3b3b3', minWidth: '40px', textAlign: 'right' }}>
            {msToTime(positionMs)}
          </span>
          <input
            type="range"
            min="0"
            max={durationMs}
            value={positionMs}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            onTouchEnd={handleSeekMouseUp}
            className="progress-slider"
            style={{ 
              flex: 1,
              background: `linear-gradient(to right, #1DB954 ${progressPercent}%, #535353 ${progressPercent}%)`
            }}
          />
          <span style={{ fontSize: '12px', color: '#b3b3b3', minWidth: '40px' }}>
            {msToTime(durationMs)}
          </span>
        </div>
      </div>
      
      <div className="player-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '16px' }}>
        <svg role="presentation" height="16" width="16" viewBox="0 0 16 16" fill="#b3b3b3">
          <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"></path>
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="progress-slider"
          style={{ 
            width: '100px',
            background: `linear-gradient(to right, #1DB954 ${volumePercent}%, #535353 ${volumePercent}%)`,
            marginRight: '16px'
          }}
        />
        
        {/* Queue Toggle Button */}
        <button 
          onClick={() => setIsQueueOpen(!isQueueOpen)} 
          className="control-button" 
          style={{ color: isQueueOpen ? '#1DB954' : '#b3b3b3' }}
          title="Queue"
        >
          <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5zm2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2h-9z"></path>
          </svg>
        </button>
      </div>

      {/* Sliding Queue Panel */}
      <div className={`queue-panel ${isQueueOpen ? 'open' : ''}`}>
        <div className="queue-header">
          <h2 style={{ margin: 0 }}>Queue</h2>
          <button className="queue-close-btn" onClick={() => setIsQueueOpen(false)}>×</button>
        </div>

        <div className="queue-section-title">Now Playing</div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "32px", backgroundColor: "#282828", padding: "12px", borderRadius: "8px" }}>
          <img src={current_track.album.images[0]?.url} alt={current_track.name} style={{ width: "48px", height: "48px", borderRadius: "4px" }} />
          <div>
            <div style={{ color: "#1DB954", fontWeight: "bold", fontSize: "16px" }}>{current_track.name}</div>
            <div style={{ color: "#b3b3b3", fontSize: "14px" }}>{current_track.artists.map(a => a.name).join(', ')}</div>
          </div>
        </div>

        <div className="queue-section-title">Next Up</div>
        {queueItems.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {queueItems.map((track, idx) => (
              <div key={`${track.id}-${idx}`} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {track.album?.images?.[0]?.url && (
                  <img src={track.album.images[0].url} alt={track.name} style={{ width: "40px", height: "40px", borderRadius: "4px" }} />
                )}
                <div>
                  <div style={{ color: "white", fontSize: "15px" }}>{track.name}</div>
                  <div style={{ color: "#b3b3b3", fontSize: "13px" }}>{track.artists?.map(a => a.name).join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#b3b3b3", fontSize: "14px" }}>Your queue is empty.</p>
        )}
      </div>

    </div>
  );
}
