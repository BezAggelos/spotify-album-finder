import { useState, useEffect } from "react";
import { spotify } from "../spotify";

export default function TopTracks() {
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const getTracks = async () => {
      const tracks = await spotify.currentUser.topItems("tracks", "long_term");
      setTopTracks(tracks.items);
    }
    getTracks();
  }, []);

  return (
    <>
      <h3>Top Tracks:</h3>
      <div className="track-list">
        {topTracks.map(track => (
          <div
            className="track-row"
            key={track.id}
          >
            {track.album.images?.[0]?.url && (
              <img src={track.album.images[0].url} alt={track.name} className='track-image' />
            )}
            <div className="track-info">
              <h3 className="track-title">{track.name}</h3>
              <span className="track-artist">{track.artists[0].name}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}