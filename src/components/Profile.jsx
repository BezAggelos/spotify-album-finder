import { useEffect, useState } from "react";
import { spotify } from "../spotify.js";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const userProfile = await spotify.currentUser.profile();
      setProfile(userProfile);
    }
    getData();
  }, [])
  return (
    <>
      {profile ? (
        <>
          <div className="profile-header">
            {profile.images?.[0]?.url && (
              <img src={profile.images[0].url} alt="Profile" className="profile-avatar" />
            )}
            <h2 className="profile-name">Hello, {profile.display_name}</h2>
          </div>
        </>
      ) : (
        <p>Loading Profile...</p>
      )}
    </>
  );
}