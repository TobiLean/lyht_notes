const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lyhtAPI', {
  saveNote: (content) => ipcRenderer.send('save-note', content),
  loadNote: (callback) => ipcRenderer.once('load-note', (_, data) => callback(data)),
  getUserPreferences: (callback) => ipcRenderer.once('get-preferences', (_, prefs) => callback(prefs)),
  syncWithCloud: () => ipcRenderer.send('sync-cloud'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

});
