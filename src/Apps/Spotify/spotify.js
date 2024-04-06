const express = require("express");
const { shell } = require("electron");
const SpotifyWebApi = require("spotify-web-api-node");

const clientId = "5cf13c1a5734406384e5f6ce468d21a1";
const clientSecret = "c1faa44b09dd4699a25afc1e5b263920";
const redirectUri = "http://localhost:5000/callback";

const spotifyApi = new SpotifyWebApi({
  clientId: "5cf13c1a5734406384e5f6ce468d21a1",
  clientSecret: "c1faa44b09dd4699a25afc1e5b263920",
  redirectUri: "http://localhost:5000/callback",
});

async function refreshAccessToken() {
  const accessToken = localStorage.getItem("refreshTokens");
  if (!refreshToken) return;
  try {
    const data = await spotifyApi.refreshAccessToken();
    localStorage.setItem("accessToken", data.body.access_token);
    spotifyApi.setAccessToken(data["access_token"]);
    console.log("The access token has been refreshed.");
  } catch (error) {
    console.error("Could not refresh access token", error);
  }
}

async function spotifyInit() {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  } else {
    await spotifyauthInit();
  }

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
      await refreshAccessToken();
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
