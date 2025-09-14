const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (url) => ipcRenderer.send('navigate', url),
  newTab: (url) => ipcRenderer.send('new-tab', url),
  switchTab: (index) => ipcRenderer.send('switch-tab', index),
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app'),
  onTabsUpdated: (callback) => ipcRenderer.on('tabs-updated', (_, tabs) => callback(tabs)),
  continueToBlocked: () => ipcRenderer.send('continue-to-blocked')
});
