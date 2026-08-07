import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { spotify } from "../spotify";


export default function ArtistDetails() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const getArtistsDetails = async () => {
      const artistsData = await spotify.artists.get(id);
      const searchResults = await spotify.search(`artist:${artistsData.name}`, ["track"]);
      setArtist(artistsData);
      setTopTracks({ tracks: searchResults.tracks.items });
    }
    getArtistsDetails();
  }, [])

  return (
    <>
      {artist ? (
        <>
          <div className="hero-banner">
            {artist.images?.[0]?.url && (
              <img
                src={artist.images[0].url}
                alt={artist.name}
                className="hero-image hero-image-circle"
              />
            )}
            <div className="hero-info">
              <span className="hero-type">Artist</span>
              <h1 className="hero-title">{artist.name}</h1>
              <span className="hero-type">{artist.followers?.total?.toLocaleString()} Followers </span>
            </div>
          </div>
          <div className="track-list">
            {topTracks.tracks.map(track => (
              <Link
                className="track-row"
                key={track.id}
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
            ))}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}