export const getRandomArtistTracks = async (artist, token, userMarket) => {
  // 1. Get total number of tracks for this artist using Search API
  const query = encodeURIComponent(`artist:"${artist.name}"`);
  const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1&market=${userMarket}`;
  const searchRes = await fetch(searchUrl, { headers: { Authorization: `Bearer ${token.access_token}` } });
  
  if (!searchRes.ok) {
    throw new Error("Failed to search artist tracks: " + await searchRes.text());
  }
  
  const searchData = await searchRes.json();
  // Spotify's Search API limits pagination offset to 1000 max
  const totalTracks = Math.min(searchData.tracks.total, 1000); 

  // 2. Fetch a few random pages of 10 tracks to create a diverse pool of songs
  let allTracks = [];
  // We'll fetch up to 25 random pages (250 tracks total) to pick from
  const numPagesToFetch = totalTracks > 250 ? 25 : Math.ceil(totalTracks / 10);
  
  for (let i = 0; i < numPagesToFetch; i++) {
    // Generate a random offset (0 to totalTracks - 10)
    const randomOffset = Math.floor(Math.random() * Math.max(1, totalTracks - 10));
    const pageUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10&offset=${randomOffset}&market=${userMarket}`;
    
    const pageRes = await fetch(pageUrl, { headers: { Authorization: `Bearer ${token.access_token}` } });
    if (pageRes.ok) {
      const pageData = await pageRes.json();
      if (pageData.tracks && pageData.tracks.items) {
        allTracks = [...allTracks, ...pageData.tracks.items];
      }
    } else {
      console.error(`Search API Error (Offset ${randomOffset}):`, await pageRes.text());
    }
  }

  // FILTER OUT LIVE VERSIONS, GUEST FEATURES, AND DEDUPLICATE SONGS
  const liveRegex = /\b(?:Live|Live Version)\b/i;
  const uniqueTracks = [];
  const seenTrackNames = new Set();

  for (const track of allTracks) {
    const isTrackLive = liveRegex.test(track.name);
    const isAlbumLive = liveRegex.test(track.album.name);
    const isPrimaryArtist = track.artists[0].id === artist.id;
    
    if (!isTrackLive && !isAlbumLive && isPrimaryArtist) {
      // Clean the track name to strip out "(Remastered)", "- 2011 Mix", etc.
      // We no longer blindly strip all parentheses, so tracks like "(Acoustic)" 
      // or "(Alive in the Catacombs)" are treated as distinct, awesome alternate versions!
      const cleanTrackName = track.name.toLowerCase()
        .replace(/- .*?(remaster|mix|edit).*?/i, "")
        .replace(/\(.*?(remaster|mix|edit).*?\)/i, "")
        .trim();

      if (!seenTrackNames.has(cleanTrackName)) {
        seenTrackNames.add(cleanTrackName);
        uniqueTracks.push(track);
      }
    }
  }

  return uniqueTracks;
};
