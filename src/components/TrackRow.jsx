import { Link } from "react-router-dom";
import { spotify } from "../spotify";

export default function TrackRow({ track, index, customImageUrl }) {
  const imageUrl = customImageUrl || track.album?.images?.[0]?.url;

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    spotify.player.startResumePlayback("", undefined, [track.uri]).catch(err => console.error("Playback failed:", err));
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
    </Link>
  );
}
