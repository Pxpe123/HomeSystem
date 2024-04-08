let isPlaying = false; // Track play/pause state

// Fetch and update data from Spotify
async function DataUpdate() {
  try {
    // Fetch current playback state from Spotify
    // Update UI based on the fetched state

    if (spotifyData.device) {
      updateCurrentTrackInfo();

      updatePlayPauseButton();
    }
  } catch (error) {}
}

function updateCurrentTrackInfo() {
  const currentTrack = spotifyData.item;
  // Map over the artists array to get each artist's name, then join them with " & "
  const artistNames = currentTrack.artists
    .map((artist) => artist.name)
    .join(" & ");
  const trackTitle = currentTrack.name;
  const albumImageUrl = currentTrack.album.images[1].url; // Assuming this is the desired image size
  const trackProgressMs = spotifyData.progress_ms;
  const trackDurationMs = currentTrack.duration_ms;

  document.getElementById("artist-name").textContent = artistNames;
  document.getElementById("song-title").textContent = trackTitle;
  document.getElementById("song-image").src = albumImageUrl;
  document.getElementById(
    "song-image"
  ).alt = `Album cover for ${trackTitle} by ${artistNames}`;

  const progressPercentage = (trackProgressMs / trackDurationMs) * 100;
  document.getElementById("playback-slider").value = progressPercentage;
}

function updateVolumeSlider() {}

// Update the shuffle button based on the current shuffle state
function updateShuffleButton(isShuffled) {
  // Update shuffle button UI
}

// Update the repeat button based on the current repeat state
function updateRepeatButton(repeatState) {
  // Update repeat button UI
}

// Toggle playback between play and pause
async function togglePlayPause() {
  if (isPlaying) {
    try {
      await spotifyApi.pause();
      pauseSong();
    } catch (error) {
      if (
        error.body.error.message ==
        "Player command failed: No active device found"
      ) {
      }
    }
  } else {
    try {
      await spotifyApi.play();
      playSong();
    } catch (error) {
      if (
        error.body.error.message ==
        "Player command failed: No active device found"
      ) {
        console.log("No Active Session");
        let Devices = await spotifyApi.getMyDevices();
        let devicesJsonString = JSON.stringify(Devices.body.devices);
        console.log(devicesJsonString);
      }
    }
  }
}

function updatePlayPauseButton(isPlaying) {
  if (spotifyData.is_playing == false) {
    pauseSong();
  } else {
    playSong();
  }
}

function playSong() {
  document.getElementById("play-pause-icon").classList.remove("fa-play");
  document.getElementById("play-pause-icon").classList.add("fa-pause");
  isPlaying = true;
}

function pauseSong() {
  document.getElementById("play-pause-icon").classList.remove("fa-pause");
  document.getElementById("play-pause-icon").classList.add("fa-play");

  isPlaying = false;
}

// Play the next track in the playlist or queue
function nextSong() {
  spotifyApi.skipToNext();
}

// Play the previous track in the playlist or queue
function prevSong() {
  spotifyApi.skipToPrevious();
}

// Set the playback volume
let lastVolumeSetTime = 0;
const VOLUME_SET_INTERVAL = 100; // Minimum interval between volume set operations in milliseconds
const DISABLE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

async function setVolume(volume) {
  const currentTime = new Date().getTime();

  // Check if the function is called too quickly after the last call
  if (currentTime - lastVolumeSetTime < VOLUME_SET_INTERVAL) {
    return;
  }

  console.log("Setting volume to:", volume);

  try {
    await spotifyApi.setVolume(volume);
    lastVolumeSetTime = currentTime;
  } catch (error) {
    if (
      error.body &&
      error.body.error &&
      error.body.error.reason === "VOLUME_CONTROL_DISALLOW"
    ) {
      console.error("Volume control is disallowed. Disabling slider.");
      disableVolumeSlider();

      showNotification(
        "Spotify",
        "Device Does not Support Volume Control",
        "https://img.icons8.com/ios-filled/50/spotify.png",
        "error",
        2000
      );

      setTimeout(enableVolumeSlider, DISABLE_DURATION);
    } else {
      console.error("Error setting volume:", error);
    }
  }
}

function disableVolumeSlider() {
  const slider = document.getElementById("volume-slider");
  if (slider) {
    slider.disabled = true;
    slider.classList.add("disabled");
  }
}

function enableVolumeSlider() {
  const slider = document.getElementById("volume-slider");
  if (slider) {
    slider.disabled = false;
    slider.classList.remove("disabled");
  }
}
// Set the playback position (seek)
function setPlaybackPoint(point) {
  // Assuming 'trackDurationMs' holds the total duration of the current track in milliseconds
  const trackDurationMs = spotifyData.item.duration_ms;

  // Convert the point (percentage) to the current position in milliseconds
  const currentPositionMs = (point / 100) * trackDurationMs;

  // Convert milliseconds to minutes and seconds

  spotifyApi.seek(currentPositionMs.toFixed(0));
  const progressPercentage = (currentPositionMs / trackDurationMs) * 100;
  this.value = progressPercentage;

  const seconds = ((currentPositionMs % 60000) / 1000).toFixed(0);
}

// Toggle shuffle on or off
function toggleShuffle() {
  // Use Spotify API to toggle shuffle mode
}

// Toggle repeat mode
function toggleRepeat() {
  // Use Spotify API to toggle repeat mode
}
