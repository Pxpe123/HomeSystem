const crypto = require("crypto");

const app = express();
const port = 5000;

const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "streaming",
  "user-read-private",
  "user-top-read",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-follow-read",
];

// Define PKCE helper functions
function base64URLEncode(str) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

async function generateCodeChallenge(codeVerifier) {
  const hashed = sha256(Buffer.from(codeVerifier));
  return base64URLEncode(hashed);
}

// Global codeVerifier to ensure consistency across the flow
let codeVerifier = generateCodeVerifier();

async function generateAuthUrl() {
  // Generate the code challenge based on the verifier
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const authorizeURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&code_challenge_method=S256&code_challenge=${codeChallenge}&scope=${encodeURIComponent(
    scopes.join(" ")
  )}`;
  return { authorizeURL, codeVerifier };
}

async function spotifyauthInit() {
  app.listen(port, () => console.log(`Listening on port ${port}`));

  app.get("/callback", async (req, res) => {
    const { code } = req.query;
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier, // Use the global verifier
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await response.json();
    if (data.access_token) {
      console.log("Access Token:", data.access_token);
      store.set("accessToken", data.access_token);

      res.send("Logged in successfully. You can close this window now.");
    } else {
      console.error("Failed to obtain access token:", data);
      res.status(500).send("Authentication failed");
    }
  });

  if (store.has("accessToken")) {
    const accessToken = store.get("accessToken");
    console.log("Access token already exists:", accessToken);
    return;
  }

  const { authorizeURL } = await generateAuthUrl();
  shell.openExternal(authorizeURL);
}
