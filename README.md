# 🎵 Album Finder (Spotify Dashboard)

A web-based React application that integrates with the Spotify Web API to analyze user profiles, fetch listening statistics, and search the Spotify catalog. 

Built as a personal practice project to master React hooks, component architecture, and API integration.

## ✨ Features
* **Full In-Browser Playback:** Deep integration with the Spotify Web Playback SDK allows you to stream entire tracks, albums, and artist discographies seamlessly from within the app.
* **Wikipedia Integration:** Dynamically fetches rich background information and critical reception for albums directly from the free Wikipedia API.
* **Interactive Player UI:** A persistent global Player bar featuring live progress tracking, volume control, and play/pause toggles.
* **Secure Authentication:** Uses Spotify's Authorization Code with PKCE flow for secure, client-side login with robust scope management.
* **User Profile & Stats:** Fetches and displays your most listened to artists and tracks over the long term.
* **Catalog Exploration:** Real-time search functionality across the entire Spotify catalog with dynamic routing and detailed Artist/Album pages.

## 🛠️ Tech Stack
* **Frontend:** React, HTML5, Vanilla CSS
* **Build Tool:** Vite
* **Routing:** React Router v6
* **API Integration:** `@spotify/web-api-ts-sdk`

## 🚀 Getting Started

### Prerequisites
1. You will need a Spotify account.
2. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app.
3. Set the Redirect URI in your Spotify app settings to: `http://127.0.0.1:5173/callback`
4. Copy your **Client ID**.

### Installation

1. Clone the repository and navigate into the folder:
```bash
git clone <your-repo-url>
cd album-finder
```

2. Install the dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Client ID:
```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://127.0.0.1:5173` to start using the app!
