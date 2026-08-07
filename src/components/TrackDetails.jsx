import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { spotify } from "../spotify";

export default function TrackDetails() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    const getTrack = async () => {
      const trackData = await spotify.tracks.get(id);
      setTrack(trackData);
    }
    getTrack();
  }, []);

  return (
    <>
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
              <span className="stat-value">{track.popularity}%</span>
              <span className="stat-label">Popularity</span>
            </div>
            {/* Stat Card 2: Duration */}
            <div className="stat-card">
              <span className="stat-value">{track.duration_ms}</span>
              <span className="stat-label">Duration</span>
            </div>
            {/* Stat Card 3: Explicit */}
            <div className="stat-card">
              <span className="stat-value">{track.explicit ? "Yes" : "No"}</span>
              <span className="stat-label">Explicit</span>
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}