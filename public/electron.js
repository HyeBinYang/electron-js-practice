const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const isDev = require("electron-is-dev");
const log = require("electron-log");
const Store = require("electron-store");
const ProgressBar = require("electron-progressbar");

const store = new Store();
const version = app.getVersion();
let win;
let progressBar;

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

  // win.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);
  win.loadURL(isDev ? "http://localhost:3000" : "https://practice-317cc.web.app/");

  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  return win;
};

app.on("ready", () => {
  // const storedVersion = store.get("version");
  // autoUpdater.autoDownload = false;
  // autoUpdater.checkForUpdates();

  createDefaultWindow();
  // if (storedVersion) {
  //   if (storedVersion !== version) {
  //     createReleaseNoteWindow();
  //     store.set("version", version);
  //   }
  // } else {
  //   store.set("version", version);
  // }
});

app.on("window-all-closed", () => {
  app.quit();
});

autoUpdater.on("checking-for-update", () => {
  log.info("업데이트 체크중...");
});

autoUpdater.on("update-available", (info) => {
  log.info("업데이트 가능");
  dialog
    .showMessageBox({
      type: "info",
      title: "약국하이패스 업데이트",
      message: "새 버전이 있습니다. 업데이트 하시겠습니까?",
      buttons: ["업데이트", "취소"],
    })
    .then((result) => {
      const buttonIndex = result.response;
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate();

        progressBar = new ProgressBar({
          title: "약국하이패스 업데이트",
          text: "업데이트 준비중...",
          style: {
            text: {
              height: "30px",
            },
          },
        });
      } else {
        createDefaultWindow();
      }
    });
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
  log.info("업데이트가 완료되었습니다.");

  log.info(`isCompleted: ${progressBar.isCompleted()}`);

  if (!progressBar.isCompleted()) {
    progressBar.setCompleted();
  }

  dialog
    .showMessageBox({
      type: "info",
      title: "업데이트 완료",
      message: "업데이트 준비가 완료되었습니다. 업데이트 하시겠습니까?",
      buttons: ["업데이트", "취소"],
    })
    .then((result) => {
      const buttonIndex = result.response;

      if (buttonIndex === 0) {
        autoUpdater.quitAndInstall(false, true);
      } else {
        autoUpdater.autoInstallOnAppQuit();
        progressBar.close();
        createDefaultWindow();
      }
    });
});
