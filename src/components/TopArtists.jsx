import { useEffect, useState } from "react";
import { spotify } from '../spotify.js'

export default function TopArtists() {
  const [topArtists, setTopArtists] = useState([]);

  useEffect(() => {
    const getArtists = async () => {
      const artists = await spotify.currentUser.topItems("artists", "long_term");
      setTopArtists(artists.items);
    }
    getArtists();
  }, []);

  return (
    <>
      <h3>Top Artists:</h3>
      <div className='artist-grid'>
        {topArtists && topArtists.map(artist => (
          <div
            className="artist-card"
            key={artist.id}
          >
            {artist.images?.[0]?.url && (
              <img src={artist.images[0].url} alt={artist.name} className='artist-image' />
            )}
            <h3 className='artist-name'>{artist.name}</h3>
          </div>
        ))}
      </div>
    </>
  );
}