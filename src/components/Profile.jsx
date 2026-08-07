import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { spotify } from "../spotify.js";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);
  const [savedAlbums, setSavedAlbums] = useState([]);

  useEffect(() => {
    const getData = async () => {
      // 1. Fetch Profile Data
      try {
        const userProfile = await spotify.currentUser.profile();
        setProfile(userProfile);
      } catch (err) {
        console.error("Failed to load profile", err);
      }

      // 2. Fetch Recently Played Tracks
      try {
        const recent = await spotify.player.getRecentlyPlayedTracks(5);
        if (recent && recent.items) {
          setRecentTracks(recent.items);
        }
      } catch (err) {
        console.error("Recently played restricted by API", err);
      }

      // 3. Fetch Saved Albums
      try {
        const albumsData = await spotify.currentUser.albums.savedAlbums(4);
        if (albumsData && albumsData.items) {
          setSavedAlbums(albumsData.items);
        }
      } catch (err) {
        console.error("Saved albums restricted by API", err);
      }
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
                {recentTracks.map((item, index) => {
                  const track = item.track;
                  // Use index as fallback key because you can play the same track twice in a row!
                  return (
                    <Link
                      className="track-row"
                      key={`${track.id}-${index}`}
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
                        <span className="track-artist">{track.artists[0].name}</span>
                      </div>
                    </Link>
                  )
                })}
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
                      <div className="play-btn">
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
        <p>Loading Profile Dashboard...</p>
      )}
    </>
  );
}