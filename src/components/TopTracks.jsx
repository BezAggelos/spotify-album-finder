import { useState, useEffect } from "react";
import { spotify } from "../spotify";
import TrackRow from "./TrackRow";

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
          <TrackRow key={track.id} track={track} />
        ))}
      </div>
    </>
  );
}