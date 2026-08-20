import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { spotify } from "../spotify";


export default function ArtistDetails() {
  const { id } = useParams();
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

      // 1. Fetch ALL albums, singles, and compilations
      let allAlbums = [];
      // We fetch everything so we don't miss bizarrely categorized albums
      let nextUrl = `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single,compilation&market=${userMarket}`;

      while (nextUrl) {
        const res = await fetch(nextUrl, { headers: { Authorization: `Bearer ${token.access_token}` } });
        if (!res.ok) {
          console.error("Failed to fetch albums page:", await res.text());
          break;
        }
        const data = await res.json();
        allAlbums = [...allAlbums, ...data.items];
        nextUrl = data.next; // Spotify provides the exact URL for the next page!
      }

      // Deduplicate albums by name (just in case the market filter still returns Deluxe and Standard duplicates)
      const uniqueAlbums = [];
      const seenNames = new Set();
      for (const album of allAlbums) {
        const cleanName = album.name.toLowerCase().replace(/ \(.*?\)/g, "").trim();
        if (!seenNames.has(cleanName)) {
          seenNames.add(cleanName);
          uniqueAlbums.push(album);
        }
      }

      // 2. Fetch tracks for all unique albums (using raw fetch to handle track pagination too)
      const trackPromises = uniqueAlbums.map(async (album) => {
        let albumTracks = [];
        let nextTrackUrl = `https://api.spotify.com/v1/albums/${album.id}/tracks?market=${userMarket}`;
        while (nextTrackUrl) {
          const res = await fetch(nextTrackUrl, { headers: { Authorization: `Bearer ${token.access_token}` } });
          if (!res.ok) break;
          const data = await res.json();
          albumTracks = [...albumTracks, ...data.items];
          nextTrackUrl = data.next;
        }
        // Map the album info directly onto each track
        return albumTracks.map(track => ({ ...track, album: album }));
      });

      const allAlbumsTracksArrays = await Promise.all(trackPromises);
      
      // Flatten the array of arrays into a single list of tracks
      let allTracks = allAlbumsTracksArrays.flat();

      // FILTER OUT LIVE VERSIONS, GUEST FEATURES, AND DEDUPLICATE SONGS
      const liveRegex = /\b(?:Live|Live Version)\b/i;
      const uniqueTracks = [];
      const seenTrackNames = new Set();

      for (const track of allTracks) {
        const isTrackLive = liveRegex.test(track.name);
        const isAlbumLive = liveRegex.test(track.album.name);
        const isPrimaryArtist = track.artists[0].id === artist.id;
        
        if (!isTrackLive && !isAlbumLive && isPrimaryArtist) {
          // Clean the track name to strip out "(Remastered)", "- 2011 Mix", etc.
          const cleanTrackName = track.name.toLowerCase()
            .replace(/- .*?(remaster|mix|edit).*?/i, "")
            .replace(/\(.*?(remaster|mix|edit).*?\)/i, "")
            .replace(/ \(.*?\)/g, "") // Strip anything else in parentheses just in case
            .trim();

          if (!seenTrackNames.has(cleanTrackName)) {
            seenTrackNames.add(cleanTrackName);
            uniqueTracks.push(track);
          }
        }
      }

      // Fisher-Yates Perfect Shuffle
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
      const token = await spotify.getAccessToken();
      
      const createRes = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `Random: ${artist.name}`,
          description: `Generated ${numRandom} random tracks from ${artist.name}'s full discography.`,
          public: true
        })
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error("RAW SPOTIFY ERROR:", errorText);
        
        // If API fails, fallback to giving them the URIs to copy-paste
        const urisString = randomTracks.map(t => t.uri).join('\n');
        setFallbackUris(urisString);
        setIsCreatingPlaylist(false);
        return;
      }

      const playlist = await createRes.json();
      const uris = randomTracks.map(track => track.uri);
      
      const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris: uris })
      });

      if (!addRes.ok) {
        console.error("Failed to add tracks", await addRes.text());
      }

      setPlaylistUrl(playlist.external_urls.spotify);
    } catch (error) {
      console.error("Failed to create playlist:", error);
    }
    setIsCreatingPlaylist(false);
  }

  return (
    <>
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
                  <Link className="track-row" key={track.id} to={`/track/${track.id}`}>
                    {track.album.images?.[0]?.url && (
                      <img src={track.album.images[0].url} alt={track.name} className="track-image" />
                    )}
                    <div className="track-info">
                      <h3 className="track-title">{track.name}</h3>
                      <span className="track-artist">{track.artists.map(a => a.name).join(", ")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="track-list">
            {topTracks.tracks.map(track => (
              <Link
                className="track-row"
                key={track.id}
                to={`/track/${track.id}`}
              >
                {track.album.images?.[0]?.url && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="track-image"
                  />
                )}
                <div className="track-info">
                  <h3 className="track-title">{track.name}</h3>
                  <span className="track-artist">{track.artists.map(a => a.name).join(", ")}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}