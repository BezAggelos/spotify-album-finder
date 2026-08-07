import { useState } from "react";
import { spotify } from "../spotify";

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
            <div
              className="album-card"
              key={album.id}
            >
              {album.images?.[0]?.url && (
                <img src={album.images[0].url} alt={album.name} className='album-image' />
              )}
              <h3 className='album-title'>{album.name}</h3>
              <span className='album-year'>{album.release_date.slice(0, 4)}</span>
            </div>
          ))}
        </div>
      }
    </>
  );
}