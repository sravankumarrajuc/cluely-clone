const { contextBridge, ipcRenderer } = require('electron');
 
contextBridge.exposeInMainWorld('electronAPI', {
  setOverlayMode: (enable) => ipcRenderer.send('set-overlay-mode', enable),
  dragWindow: (deltaX, deltaY) => ipcRenderer.send('drag-window', deltaX, deltaY)
}); 