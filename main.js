const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const fs = require("fs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 540,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
    fullscreen: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    resizable: false,
    frame: false,
  });

  mainWindow.loadFile("./src/index.html");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });
  mainWindow.setPosition(2560, 900);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
