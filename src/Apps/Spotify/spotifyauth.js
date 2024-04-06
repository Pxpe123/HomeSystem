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

// PKCE helper functions
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

let codeVerifier = generateCodeVerifier();

async function generateAuthUrl() {
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const authorizeURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&code_challenge_method=S256&code_challenge=${codeChallenge}&scope=${encodeURIComponent(
    scopes.join(" ")
  )}`;
  return { authorizeURL, codeVerifier };
}

function spotifyauthInit() {
  return new Promise((resolve, reject) => {
    app.listen(port, () => console.log(`Listening on port ${port}`));

    app.get("/callback", async (req, res) => {
      const { code } = req.query;
      const body = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      });

      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.access_token) {
          console.log("Access Token:", data.access_token);
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("refreshToken", data.refresh_token);
          spotifyApi.setAccessToken(data.access_token);
          res.send("Logged in successfully. You can close this window now.");
          resolve(); // Resolve the promise here
        } else {
          throw new Error("Failed to obtain access token");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).send("Authentication failed");
        reject(error); // Reject the promise here
      }
    });

    if (!localStorage.getItem("accessToken")) {
      generateAuthUrl()
        .then(({ authorizeURL }) => {
          shell.openExternal(authorizeURL);
        })
        .catch((error) => {
          console.error("Error generating auth URL:", error);
          reject(error); // Reject if unable to generate the auth URL
        });
    } else {
      // If the access token already exists, resolve immediately
      resolve();
    }
  });
}
