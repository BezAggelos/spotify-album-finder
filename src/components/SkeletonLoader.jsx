export default function SkeletonLoader({ type }) {
  if (type === "hero-circle") {
    return (
      <div className="skeleton-hero">
        <div className="skeleton skeleton-hero-image circle"></div>
        <div className="skeleton-hero-info">
          <div className="skeleton skeleton-text skeleton-text-short"></div>
          <div className="skeleton skeleton-hero-title"></div>
          <div className="skeleton skeleton-hero-subtitle"></div>
        </div>
      </div>
    );
  }

  if (type === "hero-square") {
    return (
      <div className="skeleton-hero">
        <div className="skeleton skeleton-hero-image"></div>
        <div className="skeleton-hero-info">
          <div className="skeleton skeleton-text skeleton-text-short"></div>
          <div className="skeleton skeleton-hero-title"></div>
          <div className="skeleton skeleton-hero-subtitle"></div>
        </div>
      </div>
    );
  }

  if (type === "track-list") {
    return (
      <div className="track-list">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton-track-row">
            <div className="skeleton skeleton-track-image"></div>
            <div className="skeleton-track-info">
              <div className="skeleton skeleton-track-title"></div>
              <div className="skeleton skeleton-track-artist"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default block
  return <div className="skeleton skeleton-text"></div>;
}
