const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: "5cf13c1a5734406384e5f6ce468d21a1",
  clientSecret: "c1faa44b09dd4699a25afc1e5b263920",
  redirectUri: "http://localhost:5000/callback",
});

const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-email",
  "streaming",
  "user-read-private",
  //"user-library-read",
  // "user-library-modify",
  "user-top-read",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-follow-read",
];

async function spotifyInit() {
  try {
    const authorizeURL = spotifyApi.createAuthorizeURL(
      scopes,
      "state-of-my-choice"
    );
    res.redirect(authorizeURL);

    console.log("The access token expires in " + data.body["expires_in"]);
    console.log("The access token is " + data.body["access_token"]);

    spotifyApi.setAccessToken(data.body["access_token"]);
  } catch (err) {
    console.error("Something went wrong when retrieving an access token", err);
  }
}

function GetMeFunct() {
  const me = spotifyApi.getMe();
  console.log(me.body);
}
function playSong() {
  spotifyApi.play().then(
    () => console.log("Playback started"),
    (err) => console.error("Something went wrong!", err)
  );
}

function pauseSong() {
  spotifyApi.pause().then(
    () => console.log("Playback paused"),
    (err) => console.error("Something went wrong!", err)
  );
}

function nextSong() {
  spotifyApi.skipToNext().then(
    () => console.log("Skipped to next song"),
    (err) => console.error("Something went wrong!", err)
  );
}

function prevSong() {
  spotifyApi.skipToPrevious().then(
    () => console.log("Skipped to previous song"),
    (err) => console.error("Something went wrong!", err)
  );
}
