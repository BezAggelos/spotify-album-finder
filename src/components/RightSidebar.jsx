import { spotify } from "../spotify";

export default function RightSidebar() {
  const doNuclearReset = () => {
    // The SDK's built-in method to wipe all tokens from memory and storage
    spotify.logOut();
    // Force reload the page so they are kicked to the login screen
    window.location.href = "/";
  };

  return (
    <div className="right-sidebar">
      <h3>Debug Tools</h3>
      <p style={{ fontSize: "12px", color: "#b3b3b3", marginBottom: "16px" }}>
        (By the way, the previous test returned 'null' because browsers block reading headers for security reasons, so it was a false alarm!)
      </p>
      <button 
        onClick={doNuclearReset} 
        className="login-button" 
        style={{ padding: "8px 16px", backgroundColor: "#ff4444", fontSize: "14px" }}
      >
        Nuclear Logout & Reset
      </button>
    </div>
  );
}
