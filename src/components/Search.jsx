import { useState } from "react";
import { spotify } from "../spotify";
import { Link } from "react-router-dom";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState([]);

  function handleSearch(event) {
    setSearchQuery(event.target.value);
  }

  const getAlbums = async () => {
    const results = await spotify.search(searchQuery, ["album"]);
    setAlbums(results.albums.items);
  }

  return (
    <>
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search for an album..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <button type="submit" onClick={getAlbums}>Search</button>
      </div>
      {albums &&
        <div className="artist-grid">
          {albums.map(album => (
            <Link
              className="album-card"
              key={album.id}
              to={`/album/${album.id}`}
            >
              {album.images?.[0]?.url && (
                <img src={album.images[0].url} alt={album.name} className='album-image' />
              )}
              <div className="play-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
              </div>
              <h3 className='album-title'>{album.name}</h3>
              <span className='album-year'>{album.release_date.slice(0, 4)}</span>
            </Link>
          ))}
        </div>
      }
    </>
  );
}