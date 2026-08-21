import { Link } from "react-router-dom";

export default function TrackRow({ track, index, customImageUrl }) {
  const imageUrl = customImageUrl || track.album?.images?.[0]?.url;
  return (
    <Link
      className="track-row"
      key={index !== undefined ? `${track.id}-${index}` : track.id}
      to={`/track/${track.id}`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={track.name}
          className="track-image"
        />
      )}
      <div className="track-info">
        <h3 className="track-title">{track.name}</h3>
        <span className="track-artist">{track.artists.map(a => a.name).join(", ")}</span>
      </div>
    </Link>
  );
}
