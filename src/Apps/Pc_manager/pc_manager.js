const wol = require("wake_on_lan");
const { exec } = require("child_process");
const util = require("util");

let ManagerSettingsJson;
let macAddress;
let target;

function toggleSettings() {
  const sidebar = document.getElementById("settingsSidebar");
  const overlay = document.getElementById("overlay");
  let settingBtn = document.getElementById("settings-btn");

  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
  settingBtn.style.display = "none";
}

function closeSettings() {
  const sidebar = document.getElementById("settingsSidebar");
  const overlay = document.getElementById("overlay");
  let settingBtn = document.getElementById("settings-btn");

  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  settingBtn.style.display = "";
}

async function pc_managerInit() {
  ManagerSettingsJson = await getAllPageSettings("pcManagement");
  macAddress = ManagerSettingsJson.macAddress;
  target = ManagerSettingsJson.ipAddress;

  document.getElementById("macAddress").value = ManagerSettingsJson.macAddress;
  document.getElementById("ipAddress").value = ManagerSettingsJson.ipAddress;

  console.log(ManagerSettingsJson);
  continuousCheck();

  document.getElementById("macAddress").addEventListener("input", (e) => {
    let value = e.target.value;
    value = value.replace(/[^A-Fa-f0-9]/g, "");
    value =
      value
        .match(/.{1,2}/g)
        ?.join(":")
        .substr(0, 17) || "";
    e.target.value = value.toUpperCase();
  });

  document.getElementById("ipAddress").addEventListener("input", (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, "");
    const segments = value.split(".").slice(0, 4);
    value = segments.map((seg) => seg.substr(0, 3)).join(".");
    e.target.value = value;
  });

  document
    .getElementById("settingsForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const macAddress = document.getElementById("macAddress").value;
      const ipAddress = document.getElementById("ipAddress").value;

      setAppSettings("pcManagement", "ipAddress", ipAddress);
      setAppSettings("pcManagement", "macAddress", macAddress);

      showNotification(
        "Pc Manager",
        "Settings Saved",
        "https://img.icons8.com/ios-filled/50/spotify.png",
        "success",
        2000
      );
    });
}

function togglePc() {
  const button = document.getElementById("powerButton");
  wakeComputer();
}

function wakeComputer() {
  wol.wake(macAddress, function (error) {
    if (error) {
      console.error("Failed to send magic packet:", error);
    } else {
      console.log("Magic packet sent successfully");
    }
  });
}

function pcStatusCheck() {
  exec(`ping ${target}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`${target}: Offline or not reachable ${error}`);
      changeButtonBorderColor({ r: 255, g: 0, b: 0 }, "0.5s");
      changeButtonHighlightColor({ r: 255, g: 0, b: 0 }, "0.5s");
    } else {
      console.log(`${target}: Online`);
      changeButtonColor({ r: 0, g: 255, b: 0 }, "0.5s");
      changeButtonBorderColor({ r: 0, g: 255, b: 0 }, "0.5s");
      changeButtonHighlightColor({ r: 0, g: 255, b: 0 }, "0.5s");
    }
  });
}

async function continuousCheck() {
  while (true) {
    pcStatusCheck();
    await sleep(5);
  }
}

function togglePowerState() {
  const button = document.getElementById("powerButton");
}

function changeButtonColor(color, transitionTime = "0.5s") {
  const rootStyle = document.documentElement.style;
  const newColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
  rootStyle.setProperty("--button-color", newColor);
  rootStyle.setProperty("--button-transition-time", transitionTime);
}

function changeButtonBorderColor(color, transitionTime = "0.5s") {
  const rootStyle = document.documentElement.style;
  const newColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
  rootStyle.setProperty("--button-border-color", newColor);
  rootStyle.setProperty("--button-border-transition-time", transitionTime);
}

function changeButtonHighlightColor(color, transitionTime = "0.5s") {
  const rootStyle = document.documentElement.style;
  const newColor = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
  rootStyle.setProperty("--button-highlight-color", newColor);
  rootStyle.setProperty("--button-highlight-transition-time", transitionTime);
}
