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

function closeDeviceModal() {
  document.getElementById("device-modal").classList.add("hidden");
}
async function openDeviceModal() {
  let devicesResponse = await spotifyApi.getMyDevices();
  let devices = devicesResponse.body.devices; // Assuming the API response has a 'devices' array

  const devicesContainer = document.createElement("div");
  devicesContainer.classList.add("flex", "flex-col", "space-y-2");

  devices.forEach((device) => {
    const deviceDiv = document.createElement("button");
    deviceDiv.textContent = device.name;
    deviceDiv.classList.add("py-2", "px-4", "rounded");

    deviceDiv.onclick = selectDevice(device.id);

    if (device.is_active) {
      deviceDiv.classList.add("text-green-500");
    } else {
      deviceDiv.classList.add("text-white");
    }

    devicesContainer.appendChild(deviceDiv);
  });

  const modalContent = document.getElementById("device-modal-content");
  modalContent.innerHTML = "";
  modalContent.appendChild(devicesContainer);

  document.getElementById("device-modal").classList.remove("hidden");
}

async function selectDevice(deviceId) {
  spotifyApi.play({ device_id: deviceId });
  openDeviceModal();
}
