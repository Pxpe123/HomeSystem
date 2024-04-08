require("dotenv").config();

let currentApp;

const path = require("node:path");
let settingsFile = path.join(__dirname, "settings.json");

function AppInit() {
  openApp("home");
  appControl();
}

function sleep(ms) {
  ms = ms * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Refresh(seconds) {
  setTimeout(() => {
    location.reload();
  }, seconds * 1000);
}

//Refresh(2.3);

function toggleTheme() {
  var body = document.querySelector("body");
  var isLightMode = body.classList.contains("light");

  body.classList.toggle("light");

  localStorage.setItem("theme", isLightMode ? "dark" : "light");
}

window.onload = function () {
  var savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  }
};

// toggleThemeTest();

async function toggleThemeTest() {
  while (true) {
    await sleep(2);
    toggleTheme();
  }
}

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "l") {
    toggleTheme();
  }
});

function openApp(app) {
  const formattedApp = app.charAt(0).toUpperCase() + app.slice(1).toLowerCase();
  const path = `./Apps/${formattedApp}/${app}.html`;

  currentApp = app;

  const initFunctionName = `${app}Init`;
  let MainDiv = document.getElementById("MainContent");
  fetch(path)
    .then((response) => response.text())
    .then((html) => {
      MainDiv.innerHTML = html;
      window[initFunctionName]();
    })
    .catch((error) => {
      console.error("Error fetching app:", error);
    });
}

const fs = require("fs").promises;

async function getAppSettings(page, setting) {
  try {
    const data = await fs.readFile(settingsFile, "utf-8");
    const settings = JSON.parse(data);

    if (settings.pages && settings.pages[page]) {
      const pageSettings = settings.pages[page];

      if (pageSettings.hasOwnProperty(setting)) {
        return pageSettings[setting];
      }
    }
    return null;
  } catch (error) {
    console.error("Error reading settings:", error);
    return null;
  }
}

async function getAllPageSettings(page) {
  try {
    const data = await fs.readFile(settingsFile, "utf-8");
    const settings = JSON.parse(data);

    if (settings.pages && settings.pages[page]) {
      return settings.pages[page];
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error reading settings:", error);
    return null;
  }
}

async function setAppSettings(page, setting, value) {
  try {
    const data = await fs.readFile(settingsFile, "utf-8");
    const settings = JSON.parse(data);

    if (settings.pages && settings.pages[page]) {
      const pageSettings = settings.pages[page];
      pageSettings[setting] = value;
      const updatedData = JSON.stringify(settings, null, 2);
      await fs.writeFile(settingsFile, updatedData);

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error setting settings:", error);
    return false;
  }
}

async function appControl() {
  let homeBtn = document.getElementById("homeBtnGlobal");
  while (true) {
    if (currentApp == "home") {
      homeBtn.style.display = "none";
    } else {
      homeBtn.style.display = "block";
    }

    await sleep(0.1);
  }
}

AppInit();

async function fetchTrainDepartures(stationCode) {
  const endpoint = `https://api.rtt.io/api/v1/json/search/${stationCode}`;

  const username = process.env.RTTAPI_USERNAME;
  const password = process.env.RTTAPI_PASSWORD;

  const base64Credentials = btoa(`${username}:${password}`);

  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${base64Credentials}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();
  return data.services.map((service) => ({
    time: service.locationDetail.gbttBookedDeparture,
    origin: service.locationDetail.origin[0].description,
    destination: service.locationDetail.destination[0].description,
    trainId: service.trainIdentity,
  }));
}

async function displayDepartures() {
  try {
    const stations = await getAppSettings("trainTracker", "stationsCodes");
    for (const station of stations) {
      const departures = await fetchTrainDepartures(station);
      console.log(`Departures from ${station}:`, departures);
      // Here you would turn each departure into a div and append it to the DOM
      // For example:
      // departures.forEach(dep => {
      //     const div = document.createElement('div');
      //     div.textContent = `${dep.time} - ${dep.origin} to ${dep.destination} (${dep.trainId})`;
      //     document.body.appendChild(div);
      // });
    }
  } catch (error) {
    console.error("Error fetching train departures:", error);
  }
}

displayDepartures();
