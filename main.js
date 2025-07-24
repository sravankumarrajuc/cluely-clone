const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: true, // Start as focusable
    type: 'panel',
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.setContentProtection(true);
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile('index.html');
  if (process.platform === 'darwin') app.dock.hide();

  // IPC handlers for overlay mode
  ipcMain.on('set-overlay-mode', (event, enable) => {
    if (enable) {
      mainWindow.setFocusable(false);
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setFocusable(true);
      mainWindow.setIgnoreMouseEvents(false);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  // Global shortcut to toggle overlay (improved)
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      // Always restore to focusable mode when shown
      mainWindow.setFocusable(true);
      mainWindow.setIgnoreMouseEvents(false);
    } else {
      // If visible and not focusable (overlay mode), restore to focusable
      if (!mainWindow.isFocusable()) {
        mainWindow.setFocusable(true);
        mainWindow.setIgnoreMouseEvents(false);
      } else {
        mainWindow.hide();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); 