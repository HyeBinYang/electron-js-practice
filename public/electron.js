const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const isDev = require("electron-is-dev");
const log = require("electron-log");
const Store = require("electron-store");

const store = new Store();
const version = app.getVersion();
let win;

const createReleaseNoteWindow = () => {
  let releaseNoteWindow = new BrowserWindow({
    width: 600,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
  });

  releaseNoteWindow.on("closed", () => {
    releaseNoteWindow = null;
  });

  releaseNoteWindow.loadURL(
    isDev ? "http://localhost:3000/releaseNote.html" : `file://${path.join(__dirname, "../build/releaseNote.html")}`
  );

  if (isDev) {
    releaseNoteWindow.webContents.openDevTools({ mode: "detach" });
  }

  return releaseNoteWindow;
};

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
  const storedVersion = store.get("version");
  autoUpdater.checkForUpdates();

  if (storedVersion) {
    if (storedVersion !== version) {
      createReleaseNoteWindow();
      store.set("version", version);
    }
  } else {
    store.set("version", version);
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

autoUpdater.on("checking-for-update", () => {
  log.info("업데이트 체크중...");
});

autoUpdater.on("update-available", (info) => {
  log.info("업데이트 가능");
});

autoUpdater.on("update-not-available", (info) => {
  log.info("최신버전 입니다.");
  createDefaultWindow();
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;
  log_message = log_message + " - 현재 " + progressObj.percent + "%";
  log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
  log.info(log_message);
});

autoUpdater.on("error", (err) => {
  log.info("에러발생: " + err);
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("업데이트 완료");
  autoUpdater.quitAndInstall();
});
