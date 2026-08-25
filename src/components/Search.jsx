import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { spotify } from "../spotify";
import TrackRow from "./TrackRow";
import SkeletonLoader from "./SkeletonLoader";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        // Search across albums, artists, and tracks (default limit is used to avoid SDK errors)
        const searchResults = await spotify.search(query, ["album", "artist", "track"]);
        setResults(searchResults);
      } catch (error) {
        console.error("Search failed:", error);
      }
      setIsLoading(false);
    };

    // Debounce the live search slightly so we don't spam the API while typing
    const timerId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timerId);
  }, [query]);

  if (!query) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "#b3b3b3" }}>
        <h2>Play what you love</h2>
        <p>Search for artists, songs, or albums.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <h2 style={{ marginBottom: "24px" }}>Search results for "{query}"</h2>

      {isLoading && !results ? (
        <>
          <h3 style={{ marginBottom: "16px" }}>Songs</h3>
          <SkeletonLoader type="track-list" />
          <h3 style={{ marginTop: "32px", marginBottom: "16px" }}>Artists</h3>
          <div className="artist-grid">
            <SkeletonLoader type="hero-circle" />
            <SkeletonLoader type="hero-circle" />
            <SkeletonLoader type="hero-circle" />
          </div>
        </>
      ) : results ? (
        <>
          {/* Tracks Section */}
          {results.tracks?.items?.length > 0 && (
            <div style={{ marginBottom: "48px" }}>
              <h3 style={{ marginBottom: "16px" }}>Songs</h3>
              <div className="track-list">
                {results.tracks.items.slice(0, 5).map(track => (
                  <TrackRow key={track.id} track={track} />
                ))}
              </div>
            </div>
          )}

          {/* Artists Section */}
          {results.artists?.items?.length > 0 && (
            <div style={{ marginBottom: "48px" }}>
              <h3 style={{ marginBottom: "16px" }}>Artists</h3>
              <div className="artist-grid">
                {results.artists.items.slice(0, 6).map(artist => (
                  <Link to={`/artist/${artist.id}`} key={artist.id} className="artist-card">
                    {artist.images?.[0]?.url ? (
                      <img src={artist.images[0].url} alt={artist.name} className="artist-image" />
                    ) : (
                      <div className="artist-image" style={{ backgroundColor: "#282828" }}></div>
                    )}
                    <h3 className="artist-name" style={{ textAlign: "center" }}>{artist.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {results.albums?.items?.length > 0 && (
            <div style={{ marginBottom: "48px" }}>
              <h3 style={{ marginBottom: "16px" }}>Albums</h3>
              <div className="artist-grid">
                {results.albums.items.slice(0, 6).map(album => (
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
                    <p className="album-year">{album.release_date?.substring(0, 4)} • {album.artists?.[0]?.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {results.tracks?.items?.length === 0 && results.artists?.items?.length === 0 && results.albums?.items?.length === 0 && (
            <p style={{ color: "#b3b3b3" }}>No results found for "{query}".</p>
          )}
        </>
      ) : null}
    </div>
  );
}