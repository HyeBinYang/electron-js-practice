const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const isDev = require("electron-is-dev");

let win;

const createDefaultWindow = () => {
  win = new BrowserWindow();

  win.on("closed", () => {
    win = null;
  });

  win.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);

  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  return win;
};

app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  app.quit();
});

autoUpdater.on("checking-for-update", () => {
  console.info("Checking for update...");
});

autoUpdater.on("update-available", (info) => {
  console.info("Update available.");
});

autoUpdater.on("update-not-available", (info) => {
  console.info("Update not available.");
  createDefaultWindow();
});

autoUpdater.on("error", (err) => {
  console.info("Error in auto-updater. " + err);
});

autoUpdater.on("update-downloaded", (info) => {
  console.info("Update downloaded");
  autoUpdater.quitAndInstall();
});
