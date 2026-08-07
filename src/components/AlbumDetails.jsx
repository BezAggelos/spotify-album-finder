import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { spotify } from "../spotify";

export default function AlbumDetails() {
  const { id } = useParams();
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
            <Link
              key={track.id}
              to={`/track/${track.id}`}
              className="track-row"
            >
              <img
                src={album.images[0].url}
                alt={track.name}
                className="track-image"
              />
              <div className="track-info">
                <h3 className="track-title">{track.name}</h3>
                <span className="track-artist">{track.artists[0].name}</span>
              </div>
            </Link>
          ))}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}