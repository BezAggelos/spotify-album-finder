import { useEffect, useState } from "react";
import { spotify } from '../spotify.js';
import { Link } from "react-router-dom";

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
          <Link
            className="artist-card"
            key={artist.id}
            to={`/artist/${artist.id}`}
          >
            {artist.images?.[0]?.url && (
              <img src={artist.images[0].url} alt={artist.name} className='artist-image' />
            )}
            <div className="play-btn" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              spotify.player.startResumePlayback("", artist.uri).catch(err => console.error(err));
            }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
            </div>
            <h3 className='artist-name'>{artist.name}</h3>
          </Link>
        ))}
      </div>
    </>
  );
}