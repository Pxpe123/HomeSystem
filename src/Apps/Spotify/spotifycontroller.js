let isPlaying = false; // Track play/pause state

// Fetch and update data from Spotify
async function DataUpdate() {
  try {
    // Fetch current playback state from Spotify
    // Update UI based on the fetched state

    updatePlayPauseButton();
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
  }
}

function updateSongData() {}

// Update the volume slider based on the current volume
function updateVolumeSlider(volumePercent) {
  // Update volume slider UI
}

// Update the playback slider based on the current playback position
function updatePlaybackSlider(currentPosition, trackDuration) {
  // Update playback slider UI
}

// Update the shuffle button based on the current shuffle state
function updateShuffleButton(isShuffled) {
  // Update shuffle button UI
}

// Update the repeat button based on the current repeat state
function updateRepeatButton(repeatState) {
  // Update repeat button UI
}

// Toggle playback between play and pause
function togglePlayPause() {
  if (isPlaying) {
    spotifyApi.pause();
    pauseSong();
  } else {
    spotifyApi.play();
    playSong();
  }
}

// Update the play/pause button based on playback state ( If Changed Else Where )
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
  // Use Spotify API to skip to the next song
}

// Play the previous track in the playlist or queue
function prevSong() {
  // Use Spotify API to skip to the previous song
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

      setTimeout(enableVolumeSlider, DISABLE_DURATION);
    } else {
      console.error("Error setting volume:", error);
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
  // Use Spotify API to set the playback position
}

// Toggle shuffle on or off
function toggleShuffle() {
  // Use Spotify API to toggle shuffle mode
}

// Toggle repeat mode
function toggleRepeat() {
  // Use Spotify API to toggle repeat mode
}
