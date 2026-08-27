export const getRandomArtistTracks = async (artist, token, userMarket) => {
  // 1. Fetch all albums and singles for the artist
  // Spotify API throws "Invalid limit" for > 10 in some regions/apps. We safely fetch in chunks of 10.
  let rawAlbums = [];
  for (let offset = 0; offset < 50; offset += 10) {
    const albumsUrl = `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single&limit=10&offset=${offset}&market=${userMarket}`;
    const albumsRes = await fetch(albumsUrl, { 
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store"
    });

    if (!albumsRes.ok) {
      console.error("Failed to fetch artist albums batch:", await albumsRes.text());
      break;
    }

    const albumsData = await albumsRes.json();
    if (albumsData.items && albumsData.items.length > 0) {
      rawAlbums = [...rawAlbums, ...albumsData.items];
    }
    
    // Stop early if the artist has fewer albums than the current page
    if (albumsData.items.length < 10) {
      break;
    }
  }
  const uniqueAlbums = [];
  const seenAlbumNames = new Set();
  
  for (const album of rawAlbums) {
    // Clean album name to identify duplicates (e.g. "Songs for the Deaf (Deluxe)" -> "songs for the deaf")
    const cleanAlbumName = album.name.toLowerCase()
      .replace(/- .*?(remaster|deluxe|bonus|edit).*?/i, "")
      .replace(/\(.*?(remaster|deluxe|bonus|edit).*?\)/i, "")
      .trim();

    if (!seenAlbumNames.has(cleanAlbumName)) {
      seenAlbumNames.add(cleanAlbumName);
      uniqueAlbums.push(album);
    }
  }

  // 3. Extract the IDs of the unique albums
  const albumIds = uniqueAlbums.map(a => a.id);
  
  // 4. Fetch the tracks for each album individually using Promise.all to bypass the 403 Forbidden batch limit
  let allTracks = [];
  
  // Create an array of fetch promises
  const trackPromises = uniqueAlbums.map(async (album) => {
    const tracksUrl = `https://api.spotify.com/v1/albums/${album.id}/tracks?limit=50&market=${userMarket}`;
    const res = await fetch(tracksUrl, {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store"
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.items) {
        // Attach the album info to each track so TrackRow can display artwork
        return data.items.map(track => ({
          ...track,
          album: {
            id: album.id,
            name: album.name,
            images: album.images,
            uri: album.uri
          }
        }));
      }
    } else {
      console.error(`Failed to fetch tracks for album ${album.name}:`, await res.text());
    }
    return [];
  });

  // Wait for all album track fetches to complete concurrently
  const nestedTracks = await Promise.all(trackPromises);
  
  // Flatten the array of arrays into a single list of tracks
  allTracks = nestedTracks.flat();

  // 5. Filter out Live versions, guest features, and duplicate songs
  const liveRegex = /\b(?:Live|Live Version)\b/i;
  const uniqueTracks = [];
  const seenTrackNames = new Set();

  for (const track of allTracks) {
    const isTrackLive = liveRegex.test(track.name);
    const isAlbumLive = liveRegex.test(track.album.name);
    
    // Check if the primary artist of the track matches the artist we are randomizing
    // This removes compilation tracks where they are just a feature.
    const isPrimaryArtist = track.artists && track.artists[0] && track.artists[0].id === artist.id;
    
    if (!isTrackLive && !isAlbumLive && isPrimaryArtist) {
      const cleanTrackName = track.name.toLowerCase()
        .replace(/- .*?(remaster|mix|edit|version).*?/i, "")
        .replace(/\(.*?(remaster|mix|edit|version).*?\)/i, "")
        .trim();

      if (!seenTrackNames.has(cleanTrackName)) {
        seenTrackNames.add(cleanTrackName);
        uniqueTracks.push(track);
      }
    }
  }

  return uniqueTracks;
};
