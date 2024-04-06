// Define an object to store the fetched Spotify data
let spotifyData = {};

async function fetchSpotifyData() {
  while (true) {
    try {
      const playbackInfo = await spotifyApi.getMyCurrentPlaybackState({});

      if (playbackInfo.body) {
        spotifyData = playbackInfo.body;
      }
    } catch (err) {
      console.error("Error fetching Spotify data:", err);
    }
    await sleep(1.5);
  }
}

async function startFetchingSpotifyData() {
  fetchSpotifyData();
}
