import {app, ipcMain, BrowserWindow} from 'electron';
import path from 'path';
import { Server } from '@hocuspocus/server';
import {isDev} from "./utils.js";
import {getPrelodePath} from "./pathResolver.js";

// Default constraints for macos
const HEADER_HEIGHT = 30;
const MACOS_TRAFFIC_LIGHTS_HEIGHT = 14;

// Create app window for production
const createWindow = (url) => {

  const win = new BrowserWindow({
    fullscreenable: false,
    maximizable: true,
    fullscreen: true,
    minHeight: 667,
    minWidth: 1300,
    webPreferences: {
      preload: getPrelodePath(),
    },
    frame: false,
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

let collabServer;

app.whenReady().then(() => {

  // Start service to enable collaboration
  collabServer = Server.configure({
    port: process.env.PORT || 3123,
    host: '0.0.0.0', // Allow access from any device on the network
  });

  collabServer.listen();

  const mainWindow = new BrowserWindow({
    fullscreenable: false,
    maximizable: true,
    fullscreen: true,
    minHeight: 667,
    minWidth: 1300,
    webPreferences: {
      preload: getPrelodePath(),
    },
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: process.platform !== 'darwin' ? {height: HEADER_HEIGHT} : undefined,
    trafficLightPosition: {
      x: 20,
      y: HEADER_HEIGHT / 2 - MACOS_TRAFFIC_LIGHTS_HEIGHT / 2,
    },
    acceptFirstMouse: true,
  })

  // Render if in dev mode
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
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      if(!collabServer) {
        collabServer = Server.configure({ port: 3123, host: '0.0.0.0' });
        collabServer.listen();
      }
    }
  })

})

app.on('window-all-closed', () => {
  collabServer.destroy();
  if (process.platform !== 'darwin') app.quit()
})