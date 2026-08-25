import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { spotify } from "../spotify";
import TrackRow from "./TrackRow";
import SkeletonLoader from "./SkeletonLoader";
import { getRandomArtistTracks } from "../utils/spotifyRandomizer";


export default function ArtistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [numRandom, setNumRandom] = useState(10);
  const [randomTracks, setRandomTracks] = useState([]);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState(null);
  const [fallbackUris, setFallbackUris] = useState("");
  const [wikiSummary, setWikiSummary] = useState(null);

  useEffect(() => {
    // Reset state when navigating to a new artist
    setArtist(null);
    setRandomTracks([]);
    setFallbackUris("");
    setWikiSummary(null);

    const getArtistsDetails = async () => {
      try {
        const artistsData = await spotify.artists.get(id);
        // Wrap artist name in quotes and pass a limit of 10 to ensure we get enough results
        const searchResults = await spotify.search(`artist:"${artistsData.name}"`, ["track"], "US", 10);

        // Fetch Albums
        const albumsData = await spotify.artists.albums(id, "album,single");

        setArtist(artistsData);
        setTopTracks({ tracks: searchResults.tracks.items });
        setAlbums(albumsData.items.slice(0, 12)); // Take up to 12

        // Fetch Wiki Summary
        try {
          const query = encodeURIComponent(`${artistsData.name} band OR musician`);
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
      } catch (error) {
        console.error("Failed to load artist details:", error);
      }
    }
    getArtistsDetails();
  }, [id])

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
            {artist.images[0]?.url ? (
              <img
                src={artist.images[0].url}
                alt={artist.name}
                className="hero-image"
                style={{ borderRadius: "50%" }}
              />
            ) : (
              <div className="hero-image" style={{ borderRadius: "50%", backgroundColor: "#282828" }}></div>
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
            <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>Top Tracks</h2>
            {topTracks.tracks?.slice(0, 5).map((track, index) => (
              <TrackRow key={track.id} track={track} index={index + 1} />
            ))}
          </div>

          {/* Albums Section */}
          <div style={{ marginTop: "48px" }}>
            <h2 style={{ marginBottom: '24px' }}>Albums & Singles</h2>
            {albums.length > 0 ? (
              <div className="artist-grid">
                {albums.map((album) => (
                  <Link to={`/album/${album.id}`} key={album.id} className="album-card">
                    {album.images?.[0]?.url && (
                      <img src={album.images[0].url} alt={album.name} className="album-image" />
                    )}
                    <div className="play-btn" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      spotify.player.startResumePlayback("", album.uri).catch(err => console.error(err));
                    }}>▶</div>
                    <h3 className="album-title">{album.name}</h3>
                    <p className="album-year">{album.release_date?.substring(0, 4)} • {album.album_type === 'single' ? 'Single' : 'Album'}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: "#b3b3b3" }}>No albums found.</p>
            )}
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
                {artist.images?.[0]?.url && (
                  <img 
                    src={artist.images[0].url} 
                    alt={artist.name} 
                    style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }} 
                  />
                )}
                <div>
                  <h3 style={{ color: "#fff", margin: 0, fontSize: "24px", letterSpacing: "-0.5px" }}>About {artist.name}</h3>
                  <span style={{ fontSize: "14px", color: "#1DB954", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Wikipedia Biography</span>
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
        <>
          <SkeletonLoader type="hero-circle" />
          <h2 style={{ marginTop: '40px', marginBottom: '16px' }}>Top Tracks</h2>
          <SkeletonLoader type="track-list" />
        </>
      )}
    </>
  )
}