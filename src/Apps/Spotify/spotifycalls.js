// Define an object to store the fetched Spotify data
let spotifyData = {
  playbackInfo: {},
  volume: {},
  trackData: {},
};

async function fetchSpotifyData() {
  while (true) {
    try {
      const playbackInfo = await spotifyApi.getMyCurrentPlaybackState({});
      spotifyData.playbackInfo = playbackInfo.body;

      // Additional API calls can be added here to fetch more data, such as volume and track details
      // For example, if the Spotify Web API supported direct volume fetching (it does not as of my last update), you would fetch it here
      // Since Spotify Web API does not allow fetching the volume directly, it's omitted from the example

      if (playbackInfo.body && playbackInfo.body.is_playing) {
        const trackData = await spotifyApi.getTrack(playbackInfo.body.item.id);
        spotifyData.trackData = trackData.body;
        console.log(spotifyData);
      }
    } catch (err) {
      console.error("Error fetching Spotify data:", err);
    }
  }
}

async function startFetchingSpotifyData() {
  fetchSpotifyData();
}
