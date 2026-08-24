import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { spotify } from "../spotify";
import TrackRow from "./TrackRow";
import SkeletonLoader from "./SkeletonLoader";
import { getRandomArtistTracks } from "../utils/spotifyRandomizer";


export default function ArtistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [numRandom, setNumRandom] = useState(10);
  const [randomTracks, setRandomTracks] = useState([]);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState(null);
  const [fallbackUris, setFallbackUris] = useState("");

  useEffect(() => {
    const getArtistsDetails = async () => {
      const artistsData = await spotify.artists.get(id);
      const searchResults = await spotify.search(`artist:${artistsData.name}`, ["track"]);
      setArtist(artistsData);
      setTopTracks({ tracks: searchResults.tracks.items });
    }
    getArtistsDetails();
  }, [])

  const handleGetRandomSongs = async () => {
    if (!artist) return;
    setPlaylistUrl(null); // Reset playlist URL when fetching new songs
    setFallbackUris(""); // Reset fallback URIs

    try {
      const token = await spotify.getAccessToken();
      const userProfile = await spotify.currentUser.profile();
      const userMarket = userProfile.country || "US";

      // 1. Get total number of tracks for this artist using Search API
      const uniqueTracks = await getRandomArtistTracks(artist, token, userMarket);

      // Shuffle tracks and select up to `numRandom`
      const shuffledTracks = [...uniqueTracks];
      for (let i = shuffledTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTracks[i], shuffledTracks[j]] = [shuffledTracks[j], shuffledTracks[i]];
      }

      const selectedTracks = shuffledTracks.slice(0, numRandom);

      setRandomTracks(selectedTracks);
    } catch (error) {
      console.error("Failed to fetch full discography:", error);
    }
  }

  const handleCreatePlaylist = async () => {
    if (randomTracks.length === 0) return;
    setIsCreatingPlaylist(true);
    try {
      const user = await spotify.currentUser.profile();
      
      const playlist = await spotify.playlists.createPlaylist(user.id, {
        name: `Random: ${artist.name}`,
        description: `Generated ${numRandom} random tracks from ${artist.name}'s full discography.`,
        public: false
      });

      const uris = randomTracks.map(track => track.uri);
      await spotify.playlists.addItemsToPlaylist(playlist.id, uris);

      setPlaylistUrl(playlist.external_urls.spotify);
    } catch (error) {
      console.error("Failed to create playlist:", error);
      // Spotify blocked the API in Development Mode, so we fallback to copy-pasting URIs
      const urisString = randomTracks.map(t => t.uri).join('\n');
      setFallbackUris(urisString);
    }
    setIsCreatingPlaylist(false);
  }

  return (
    <>
      <button onClick={() => navigate(-1)} className="login-button" style={{ marginBottom: "16px", padding: "8px 16px", background: "#333", color: "white" }}>
        ← Back
      </button>
      {artist ? (
        <>
          <div className="hero-banner">
            {artist.images?.[0]?.url && (
              <img
                src={artist.images[0].url}
                alt={artist.name}
                className="hero-image hero-image-circle"
              />
            )}
            <div className="hero-info">
              <span className="hero-type">Artist</span>
              <h1 className="hero-title">{artist.name}</h1>
              <span className="hero-type">{artist.followers?.total?.toLocaleString()} Followers </span>
            </div>
          </div>
          {/* Randomizer UI */}
          <div style={{ margin: "32px 0", padding: "24px", backgroundColor: "#181818", borderRadius: "8px" }}>
            <h3>Get Random Songs</h3>
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <input
                type="number"
                min="1"
                max="50"
                value={numRandom}
                onChange={(e) => setNumRandom(Number(e.target.value))}
                style={{ padding: "8px", borderRadius: "4px", border: "none", width: "80px" }}
              />
              <button onClick={handleGetRandomSongs} className="login-button" style={{ padding: "8px 24px" }}>
                Surprise Me!
              </button>
            </div>

            {/* Display Random Tracks */}
            {randomTracks.length > 0 && (
              <div className="track-list" style={{ marginTop: 0 }}>
                <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
                  <button 
                    onClick={handleCreatePlaylist} 
                    className="login-button" 
                    style={{ padding: "8px 24px", opacity: isCreatingPlaylist ? 0.7 : 1 }} 
                    disabled={isCreatingPlaylist}
                  >
                    {isCreatingPlaylist ? "Creating..." : "Save as Playlist"}
                  </button>
                  {playlistUrl && (
                    <a href={playlistUrl} target="_blank" rel="noreferrer" style={{ color: "#1DB954", fontWeight: "bold", textDecoration: "none" }}>
                      Open in Spotify ↗
                    </a>
                  )}
                </div>

                {fallbackUris && (
                  <div style={{ backgroundColor: "rgba(255, 68, 68, 0.1)", border: "1px solid #ff4444", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                    <h4 style={{ color: "#ff4444", marginTop: 0 }}>API Blocked: Use the Copy-Paste Workaround!</h4>
                    <p style={{ fontSize: "14px", color: "#b3b3b3", marginBottom: "8px" }}>
                      Spotify blocked the automatic playlist creation. But you can still create it manually in 5 seconds! Open a new playlist in your Spotify Desktop app, copy all the text below, and hit <b>Ctrl+V</b> inside the playlist.
                    </p>
                    <textarea 
                      readOnly 
                      value={fallbackUris} 
                      style={{ width: "100%", height: "100px", backgroundColor: "#000", color: "#1DB954", padding: "8px", borderRadius: "4px", border: "1px solid #282828", fontFamily: "monospace" }} 
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                )}

                {randomTracks.map(track => (
                  <TrackRow key={track.id} track={track} />
                ))}
              </div>
            )}
          </div>

          <div className="track-list">
            {topTracks.tracks.map(track => (
              <TrackRow key={track.id} track={track} />
            ))}
          </div>
        </>
      ) : (
        <>
          <SkeletonLoader type="hero-circle" />
          <h2 style={{ marginTop: '40px', marginBottom: '16px' }}>Top Tracks</h2>
          <SkeletonLoader type="track-list" />
        </>
      )}
    </>
  )
}