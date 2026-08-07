export default function RightSidebar() {
  return (
    <div className="right-sidebar">
      <h3>Friend Activity</h3>
      
      {/* Fake placeholder data for UI aesthetics */}
      <div className="friend-activity-card">
        <div className="friend-avatar"></div>
        <div className="friend-info">
          <div className="friend-name">Alex M.</div>
          <div className="friend-listening">Listening to Radiohead</div>
        </div>
      </div>
      
      <div className="friend-activity-card">
        <div className="friend-avatar"></div>
        <div className="friend-info">
          <div className="friend-name">Sarah J.</div>
          <div className="friend-listening">Listening to Daft Punk</div>
        </div>
      </div>

      <div className="friend-activity-card">
        <div className="friend-avatar"></div>
        <div className="friend-info">
          <div className="friend-name">Mike T.</div>
          <div className="friend-listening">Listening to Kendrick Lamar</div>
        </div>
      </div>

    </div>
  );
}
