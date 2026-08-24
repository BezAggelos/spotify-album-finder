import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { spotify } from "../spotify";
import SkeletonLoader from "./SkeletonLoader";

export default function TrackDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);


  useEffect(() => {
    const getTrack = async () => {
      const trackData = await spotify.tracks.get(id);
      setTrack(trackData);
    }
    getTrack();
  }, []);

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  return (
    <>
      <button onClick={() => navigate(-1)} className="login-button" style={{ marginBottom: "16px", padding: "8px 16px", background: "#333", color: "white" }}>
        ← Back
      </button>
      {track ? (
        <>
          <div className="hero-banner">
            {track.album.images[0].url && (
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="hero-image hero-image-square"
              />
            )}
            <div className="hero-info">
              <span className="hero-type">Track</span>
              <h1 className="hero-title">{track.name}</h1>
              <span className="hero-type">{track.artists[0].name}</span>
            </div>
          </div>
          <div className="stats-grid">

            {/* Stat Card 1: Popularity */}
            <div className="stat-card">
              <span className="stat-value">{track.popularity || "N/A"}%</span>
              <span className="stat-label">Popularity</span>
            </div>
            {/* Stat Card 2: Duration */}
            <div className="stat-card">
              <span className="stat-value">{formatDuration(track.duration_ms)}</span>
              <span className="stat-label">Duration</span>
            </div>
            {/* Stat Card 3: Explicit */}
            <div className="stat-card">
              <span className="stat-value">{track.explicit ? "Yes" : "No"}</span>
              <span className="stat-label">Explicit</span>
            </div>
          </div>
          <div style={{ marginTop: "32px" }}>
            <iframe
              src={`https://open.spotify.com/embed/track/${track.id}`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="encrypted-media"
              style={{ borderRadius: "12px" }}
            ></iframe>
          </div>
        </>
      ) : (
        <SkeletonLoader type="hero-square" />
      )}
    </>
  )
}