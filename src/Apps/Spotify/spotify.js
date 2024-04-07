const { shell } = require("electron");
const SpotifyWebApi = require("spotify-web-api-node");

const clientId = "5cf13c1a5734406384e5f6ce468d21a1";
const clientSecret = "c1faa44b09dd4699a25afc1e5b263920";
const redirectUri = "http://localhost:5000/callback";

const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
  redirectUri,
});

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.error("No refresh token available");
    return;
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId, // Ensure your client ID is correct and available
    client_secret: clientSecret, // Ensure your client secret is correct and available
  });

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${data.error} - ${data.error_description}`
      );
    }

    console.log("The access token has been refreshed:", data.access_token);
    localStorage.setItem("accessToken", data.access_token);
    spotifyApi.setAccessToken(data.access_token);

    if (data.refresh_token) {
      // Spotify may return a new refresh token
      localStorage.setItem("refreshToken", data.refresh_token);
    }

    // Re-calculate the expiration time
    const expiresIn = data.expires_in || 3600; // Use default of 3600 seconds if not provided
    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(
      "accessTokenExpirationTime",
      expirationTime.toString()
    );
  } catch (error) {
    console.error("Could not refresh access token", error);
  }
}

function scheduleTokenRefresh() {
  let expiresIn = 3600;
  const refreshBufferTime = 300; // seconds
  const refreshTime = (expiresIn - refreshBufferTime) * 1000; // Convert to milliseconds

  setTimeout(async () => {
    await refreshAccessToken();
  }, refreshTime);
}

async function spotifyInit() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  refreshAccessToken();

  scheduleTokenRefresh();
  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  }
  if (refreshToken) {
    spotifyApi.setRefreshToken(refreshToken);
    await refreshAccessToken();
  } else {
    await spotifyauthInit(); // Initiate auth flow if no tokens are available
  }

  // Now you can fetch user data or start fetching Spotify data
  getMeFunct();
  startFetchingSpotifyData();
}

async function getMeFunct() {
  try {
    const me = await spotifyApi.getMe();
    console.log("Authenticated user data:", me.body);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    if (error.body.error.status === 401) {
      refreshAccessToken();
      return getMeFunct();
    }
  }
}

async function playSong() {
  try {
    await spotifyApi.play();
    console.log("Playback started");
  } catch (err) {
    console.error("Failed to start playback:", err);
  }
}

function pauseSong() {
  spotifyApi.pause().then(
    () => console.log("Playback paused"),
    (err) => console.error("Failed to pause playback:", err)
  );
}

function nextSong() {
  spotifyApi.skipToNext().then(
    () => console.log("Moved to next song"),
    (err) => console.error("Failed to skip to next song:", err)
  );
}

function prevSong() {
  spotifyApi.skipToPrevious().then(
    () => console.log("Moved to previous song"),
    (err) => console.error("Failed to skip to previous song:", err)
  );
}
