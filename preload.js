const { contextBridge, ipcRenderer } = require('electron');
 
contextBridge.exposeInMainWorld('electronAPI', {
  setOverlayMode: (enable) => ipcRenderer.send('set-overlay-mode', enable)
}); 