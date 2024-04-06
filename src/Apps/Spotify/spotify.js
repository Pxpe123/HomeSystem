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
  if (!refreshToken) return;

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    const data = await response.json();
    if (data.access_token) {
      console.log("The access token has been refreshed:", data.access_token);
      localStorage.setItem("accessToken", data.access_token);
      spotifyApi.setAccessToken(data.access_token);
      // Optionally, update the refresh token if a new one is returned
      if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
        spotifyApi.setRefreshToken(data.refresh_token);
      }
    } else {
      throw new Error("Failed to refresh access token");
    }
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
  scheduleTokenRefresh();
  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  }
  if (refreshToken) {
    spotifyApi.setRefreshToken(refreshToken);
    await refreshAccessToken(); // Ensure the token is refreshed if needed
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
      // Token expired
      tokenRefreshAuto();
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
