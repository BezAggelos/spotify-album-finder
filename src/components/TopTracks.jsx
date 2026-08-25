import { useState, useEffect } from "react";
import { spotify } from "../spotify";
import TrackRow from "./TrackRow";
import SkeletonLoader from "./SkeletonLoader";

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
      {topTracks.length > 0 ? (
        <div className="track-list">
          {topTracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index + 1} />
          ))}
        </div>
      ) : (
        <SkeletonLoader type="track-list" />
      )}
    </>
  );
}