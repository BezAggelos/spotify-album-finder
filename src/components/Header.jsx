import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { spotify } from "../spotify";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const currentQuery = searchParams.get("q") || "";

  const handleSearch = (e) => {
    const query = e.target.value;
    if (query.trim() === "") {
      if (location.pathname === "/search") {
         navigate(`/search`);
      }
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    spotify.logOut();
    window.location.href = "/";
  };

  return (
    <div className="top-header" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "32px",
      width: "100%"
    }}>
      <div className="search-bar" style={{
        position: "relative",
        width: "360px"
      }}>
        <svg 
          width="20" height="20" viewBox="0 0 24 24" 
          fill="none" stroke="#b3b3b3" strokeWidth="2" 
          strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="What do you want to listen to?" 
          defaultValue={location.pathname === "/search" ? currentQuery : ""}
          onChange={handleSearch}
          style={{
            width: "100%",
            padding: "14px 16px 14px 48px",
            borderRadius: "500px",
            border: "1px solid transparent",
            backgroundColor: "#242424",
            color: "white",
            fontSize: "14px",
            outline: "none",
            transition: "all 0.2s ease"
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = "#2a2a2a";
            e.target.style.border = "1px solid #333";
            e.target.style.boxShadow = "0 0 0 1px #fff";
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = "#242424";
            e.target.style.border = "1px solid transparent";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      <button 
        onClick={handleLogout}
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          border: "1px solid #333",
          borderRadius: "500px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#ff4444";
          e.target.style.borderColor = "#ff4444";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "rgba(0,0,0,0.5)";
          e.target.style.borderColor = "#333";
        }}
      >
        Log out
      </button>
    </div>
  );
}
