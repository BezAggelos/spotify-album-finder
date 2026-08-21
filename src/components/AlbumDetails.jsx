import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { spotify } from "../spotify";
import TrackRow from "./TrackRow";

export default function AlbumDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const getAlbum = async () => {
      const albumData = await spotify.albums.get(id);
      setAlbum(albumData);
      const trackData = await spotify.albums.tracks(id);
      setTracks(trackData.items);
    }
    getAlbum();
  }, []);

  return (
    <>
      <button onClick={() => navigate(-1)} className="login-button" style={{ marginBottom: "16px", padding: "8px 16px", background: "#333", color: "white" }}>
        ← Back
      </button>
      {album ? (
        <>
          <div className="hero-banner">
            {album.images?.[0]?.url && (
              <img
                src={album.images[0].url}
                alt={album.name}
                className="hero-image hero-image-square"
              />
            )}
            <div className="hero-info">
              <span className="hero-type">Album</span>
              <h1 className="hero-title">{album.name}</h1>
              <span className="hero-type">{album.artists[0].name}</span>
            </div>
          </div>
          {tracks.map(track => (
            <TrackRow key={track.id} track={track} customImageUrl={album.images?.[0]?.url} />
          ))}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}