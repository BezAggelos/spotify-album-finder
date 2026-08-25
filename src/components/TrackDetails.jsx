import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { spotify } from "../spotify";
import SkeletonLoader from "./SkeletonLoader";

export default function TrackDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);


  const [wikiSummary, setWikiSummary] = useState(null);

  useEffect(() => {
    const getTrack = async () => {
      const trackData = await spotify.tracks.get(id);
      setTrack(trackData);

      // Fetch Wiki Summary
      try {
        const query = encodeURIComponent(`${trackData.name} ${trackData.artists[0].name} song`);
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (searchData.query?.search?.length > 0) {
          const title = searchData.query.search[0].title;
          const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json&origin=*`;
          const extractRes = await fetch(extractUrl);
          const extractData = await extractRes.json();
          const pages = extractData.query.pages;
          const pageId = Object.keys(pages)[0];
          setWikiSummary(pages[pageId].extract);
        }
      } catch (err) {
        console.error("Wiki fetch failed", err);
      }
    }
    getTrack();
  }, [id]);

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
            {track.album?.images?.[0]?.url && (
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
              <button 
                className="play-pause-btn" 
                style={{ width: "56px", height: "56px", marginTop: "24px", backgroundColor: "#1DB954" }}
                onClick={() => {
                  spotify.player.startResumePlayback("", undefined, [track.uri]).catch(err => console.error("Playback failed:", err));
                }}
              >
                <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="black"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
              </button>
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

          {wikiSummary && (
            <div style={{ 
              marginTop: "48px", 
              marginBottom: "100px", 
              padding: "40px", 
              background: "linear-gradient(145deg, #181818 0%, #121212 100%)", 
              borderRadius: "16px", 
              lineHeight: "1.8", 
              color: "#e5e5e5",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              border: "1px solid #282828"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                {track.album?.images?.[0]?.url && (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.name} 
                    style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }} 
                  />
                )}
                <div>
                  <h3 style={{ color: "#fff", margin: 0, fontSize: "24px", letterSpacing: "-0.5px" }}>About {track.name}</h3>
                  <span style={{ fontSize: "14px", color: "#1DB954", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Wikipedia</span>
                </div>
              </div>
              
              <div style={{ 
                columnCount: wikiSummary.length > 800 ? 2 : 1, 
                columnGap: "40px",
                textAlign: "justify",
                fontSize: "15px"
              }}>
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{wikiSummary}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <SkeletonLoader type="hero-square" />
      )}
    </>
  )
}