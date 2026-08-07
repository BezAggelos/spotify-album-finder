import TopArtists from "./TopArtists.jsx";
import Profile from "./Profile.jsx";
import TopTracks from "./TopTracks.jsx";
import Search from "./Search.jsx";
import ArtistDetails from "./ArtistDetails.jsx";
import AlbumDetails from "./AlbumDetails.jsx";
import TrackDetails from "./TrackDetails.jsx";
import { BrowserRouter, Routes, Link, Route } from "react-router-dom";

export default function Dashboard() {

  return (
    <BrowserRouter>
      <div className="app-layout">
        <div className="sidebar">
          <h2>Navigation</h2>
          <Link to="/" className="sidebar-link">Profile</Link>
          <Link to="/top-artists" className="sidebar-link">Top Artists</Link>
          <Link to="/top-tracks" className="sidebar-link">Top Tracks</Link>
          <Link to="/search" className="sidebar-link">Search</Link>
        </div>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/top-artists" element={<TopArtists />} />
            <Route path="/top-tracks" element={<TopTracks />} />
            <Route path="/search" element={<Search />} />
            <Route path="/artist/:id" element={<ArtistDetails />} />
            <Route path="/album/:id" element={<AlbumDetails />} />
            <Route path="/track/:id" element={<TrackDetails />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}