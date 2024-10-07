import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import path from 'path';
import os from 'os';
import { createMenu } from './menu';
import { downloadYouTubeVideo } from './yt-dlp';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1920,
    height: 1080,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      sandbox: false,
    },
    show: false,
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.once('ready-to-show', () => {
    console.log('ready-to-show', Date.now());
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}
app.disableHardwareAcceleration();
app.whenReady().then(createWindow);

ipcMain.handle('show-save-dialog', async (event, options) => {
  if (!mainWindow) {
    return;
  }
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle(
  'download-youtbue-video',
  async (event, { url, startTime, endTime }) => {
    return await downloadYouTubeVideo(url, startTime, endTime, (progress) => {
      event.sender.send('download-youtbue-video-progress', {
        url,
        value: progress,
      });
    });
  }
);

ipcMain.handle('get-app-path', async (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('show-item-in-folder', async (event, fullPath) => {
  return shell.showItemInFolder(fullPath);
});

Menu.setApplicationMenu(createMenu());

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
