import {app, ipcMain, BrowserWindow} from 'electron';
import path from 'path';
import {isDev} from "./utils.js";
import {pollResources} from "./resourceManager.js";
import {getPrelodePath} from "./pathResolver.js";

const HEADER_HEIGHT = 30;
const MACOS_TRAFFIC_LIGHTS_HEIGHT = 14;

const createWindow = (url) => {

  const win = new BrowserWindow({
    fullscreenable: false,
    maximizable: true,
    fullscreen: true,
    webPreferences: {
      preload: getPrelodePath(),
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: process.platform !== 'darwin' ? {height: HEADER_HEIGHT} : undefined,
    trafficLightPosition: {
      x: 20,
      y: HEADER_HEIGHT / 2 - MACOS_TRAFFIC_LIGHTS_HEIGHT / 2,
    },
    acceptFirstMouse: true,

  })
  win.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'));

  // Add IPC Handlers for Window Control
  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('maximize-window', () => {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.on('close-window', () => {
    win.close();
  });


}

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    fullscreenable: false,
    maximizable: true,
    webPreferences: {
      preload: getPrelodePath(),
    },
    fullscreen: true,
    frame: false,
    acceptFirstMouse: true,
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    createWindow()
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
  });

  // Add IPC Handlers for Window Control
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('maximize-window', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})