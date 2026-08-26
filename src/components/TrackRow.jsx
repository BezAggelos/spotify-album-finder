import { Link } from "react-router-dom";
import { spotify } from "../spotify";

export default function TrackRow({ track, index, customImageUrl }) {
  const imageUrl = customImageUrl || track.album?.images?.[0]?.url;

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    spotify.player.startResumePlayback("", undefined, [track.uri]).catch(err => console.error("Playback failed:", err));
  };

  const handleAddToQueue = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = await spotify.getAccessToken();
      const res = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(track.uri)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.access_token}`
        }
      });
      
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("show-toast", { detail: "Added to Queue" }));
      } else {
        throw new Error(await res.text());
      }
    } catch (err) {
      console.error("Failed to add to queue:", err);
      window.dispatchEvent(new CustomEvent("show-toast", { detail: "Failed to add (ensure a device is active!)" }));
    }
  };

  return (
    <Link
      className="track-row"
      key={index !== undefined ? `${track.id}-${index}` : track.id}
      to={`/track/${track.id}`}
    >
      <button onClick={handlePlay} style={{ background: "transparent", border: "none", color: "#1DB954", cursor: "pointer", marginRight: "8px", display: "flex", alignItems: "center" }}>
        <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
      </button>

      {index !== undefined && (
        <span className="track-index" style={{ color: "#b3b3b3", fontSize: "16px", minWidth: "24px", textAlign: "right", marginRight: "16px", fontVariantNumeric: "tabular-nums" }}>
          {index}
        </span>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={track.name}
          className="track-image"
        />
      )}
      <div className="track-info" style={{ flex: 1 }}>
        <h3 className="track-title">{track.name}</h3>
        <span className="track-artist">{track.artists.map(a => a.name).join(", ")}</span>
      </div>
      {track.duration_ms && (
        <div className="track-duration" style={{ color: "#b3b3b3", fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>
          {Math.floor(track.duration_ms / 60000)}:{((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
        </div>
      )}
      <button 
        onClick={handleAddToQueue} 
        style={{ background: "transparent", border: "1px solid #b3b3b3", color: "#b3b3b3", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", marginLeft: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", transition: "all 0.2s" }}
        onMouseEnter={(e) => { e.target.style.color = "#fff"; e.target.style.borderColor = "#fff"; e.target.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.target.style.color = "#b3b3b3"; e.target.style.borderColor = "#b3b3b3"; e.target.style.transform = "scale(1)"; }}
        title="Add to Queue"
      >
        +
      </button>
    </Link>
  );
}
