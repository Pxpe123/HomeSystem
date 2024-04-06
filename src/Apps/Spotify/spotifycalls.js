// Define an object to store the fetched Spotify data
let spotifyData = {};

async function fetchSpotifyData() {
  while (true) {
    try {
      const playbackInfo = await spotifyApi.getMyCurrentPlaybackState({});

      if (playbackInfo.body) {
        spotifyData = playbackInfo.body;
      }

      console.log(spotifyData);

      DataUpdate();
    } catch (err) {
      if (
        error.statusCode === 401 &&
        error.body.error.message === "The access token expired"
      ) {
        await refreshAccessToken();
        // Retry the API call with the refreshed token
        return await apiFunction(...args);
      } else {
        // If the error is not related to token expiration, rethrow it
        throw error;
      }
    }
    await sleep(1.5);
  }
}

async function startFetchingSpotifyData() {
  fetchSpotifyData();
}
