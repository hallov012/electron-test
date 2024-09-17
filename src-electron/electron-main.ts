import { app, BrowserWindow, autoUpdater } from 'electron';
import path from 'path';
import os from 'os';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);
  autoUpdater.setFeedURL({
    url: process.env.APP_URL,
  });
  autoUpdater.checkForUpdates();

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});

// Emitted when there is an error while updating.
autoUpdater.on('error', function (error: Error) {
  console.log('error');
  console.error(error);
  mainWindow?.webContents.send('updater-message', 'Got Error');
});

// Emitted when checking if an update has started.
autoUpdater.on('checking-for-update', function () {
  console.log('Checking-for-update');
  mainWindow?.webContents.send('updater-message', 'Checking for Update..');
});

// Emitted when there is an available update. The update is downloaded automatically.
autoUpdater.on('update-available', function () {
  console.log('A new update is available');
  mainWindow?.webContents.send('updater-message', 'A new update is available');
});

// Emitted when an update has been downloaded.
autoUpdater.on(
  'update-downloaded',
  function (
    event
    // releaseNotes: string,
    // releaseName: string,
    // releaseDate: Date,
    // updateURL: string
  ) {
    console.log('update-downloaded');
    console.log(event);
    mainWindow?.webContents.send('updater-message', 'update-downloaded');
  }
);

// Emitted when there is no available update.
autoUpdater.on('update-not-available', function () {
  console.log('update-not-available');
  mainWindow?.webContents.send('updater-message', 'update-not-available');
});
