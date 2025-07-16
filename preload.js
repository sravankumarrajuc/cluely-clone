const { contextBridge } = require('electron');
 
contextBridge.exposeInMainWorld('electronAPI', {
  // Placeholder for future APIs (mic, screen, OpenAI)
}); 