import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { spotify } from "../spotify.js";
import TrackRow from "./TrackRow";
import SkeletonLoader from "./SkeletonLoader";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);
  const [savedAlbums, setSavedAlbums] = useState([]);

  useEffect(() => {
    const getData = async () => {
      Promise.allSettled([
        spotify.currentUser.profile().then(res => setProfile(res)),
        spotify.player.getRecentlyPlayedTracks(5).then(res => res?.items && setRecentTracks(res.items)),
        spotify.currentUser.albums.savedAlbums(4).then(res => res?.items && setSavedAlbums(res.items))
      ]).then(results => {
        results.forEach((res, i) => {
          if (res.status === 'rejected') {
            console.error(`Failed to load data for section ${i}`, res.reason);
          }
        });
      });
    }
    getData();
  }, [])

  return (
    <>
      {profile ? (
        <>
          <div className="profile-header">
            {profile.images?.[0]?.url && (
              <img src={profile.images[0].url} alt="Profile" className="profile-avatar" />
            )}
            <h2 className="profile-name">Hello, {profile.display_name}</h2>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{profile.followers?.total || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{profile.product || "Free"}</span>
              <span className="stat-label">Subscription</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{profile.country || "N/A"}</span>
              <span className="stat-label">Region</span>
            </div>
          </div>

          {recentTracks.length > 0 && (
            <>
              <h2 style={{ marginTop: '40px', marginBottom: '16px' }}>Recently Played</h2>
              <div className="track-list">
                {recentTracks.map((item, index) => (
                  <TrackRow key={`${item.track.id}-${index}`} track={item.track} index={index + 1} />
                ))}
              </div>
            </>
          )}

          {savedAlbums.length > 0 && (
            <>
              <h2 style={{ marginTop: '40px', marginBottom: '16px' }}>Saved Albums</h2>
              <div className="artist-grid">
                {savedAlbums.map(item => {
                  const album = item.album;
                  return (
                    <Link
                      className="album-card"
                      key={album.id}
                      to={`/album/${album.id}`}
                    >
                      {album.images?.[0]?.url && (
                        <img src={album.images[0].url} alt={album.name} className='album-image' />
                      )}
                      <div className="play-btn" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        spotify.player.startResumePlayback("", album.uri).catch(err => console.error(err));
                      }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                      </div>
                      <h3 className='album-title'>{album.name}</h3>
                      <span className='album-year'>{album.release_date?.slice(0, 4)}</span>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <SkeletonLoader type="hero-circle" />
          <h2 style={{ marginTop: '40px', marginBottom: '16px' }}>Recently Played</h2>
          <SkeletonLoader type="track-list" />
        </>
      )}
    </>
  );
}