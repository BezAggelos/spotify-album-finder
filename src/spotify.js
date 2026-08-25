import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = "http://127.0.0.1:5173/callback";


// Scopes tell Spotify what permissions we are asking the user for.
const scopes = [
    "user-top-read",           // To get top artists/tracks
    "user-read-recently-played", // To get recent history
    "user-library-read",       // To read their saved albums
    "playlist-modify-private", // To create private playlists
    "playlist-modify-public",  // To create public playlists
    "streaming",               // REQUIRED for Web Playback SDK
    "user-read-email",         // REQUIRED for Web Playback SDK
    "user-read-private",       // REQUIRED for Web Playback SDK
    "user-modify-playback-state" // To transfer playback to the browser
];

// We initialize the API and export it so other files (like App.jsx) can use it
export const spotify = SpotifyApi.withUserAuthorization(
  clientId,
  redirectUri,
  scopes
);