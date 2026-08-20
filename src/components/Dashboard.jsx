import TopArtists from "./TopArtists.jsx";
import Profile from "./Profile.jsx";
import TopTracks from "./TopTracks.jsx";
import Search from "./Search.jsx";
import ArtistDetails from "./ArtistDetails.jsx";
import AlbumDetails from "./AlbumDetails.jsx";
import TrackDetails from "./TrackDetails.jsx";
import RightSidebar from "./RightSidebar.jsx";
import Player from "./Player.jsx";
import { BrowserRouter, Routes, Link, Route, Navigate } from "react-router-dom";

export default function Dashboard() {

  return (
    <BrowserRouter>
      <div className="app-layout">
        <div className="sidebar">
          <h2>Spotify Stats</h2>
          <Link to="/" className="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </Link>
          <Link to="/top-artists" className="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Top Artists
          </Link>
          <Link to="/top-tracks" className="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            Top Tracks
          </Link>
          <Link to="/search" className="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Search
          </Link>
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* The New Static Right Sidebar Placeholder */}
        <RightSidebar />
      </div>

      {/* The New Static Music Player Placeholder */}
      <Player />
    </BrowserRouter>
  )
}