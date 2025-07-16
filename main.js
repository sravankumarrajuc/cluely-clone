const { app, BrowserWindow, globalShortcut } = require('electron');
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
    focusable: false, // Not focusable
    type: 'panel', // Try to make it less likely to be captured
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.setContentProtection(true); // Prevent screen sharing/recording
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile('index.html');
  // Hide from dock (macOS)
  if (process.platform === 'darwin') app.dock.hide();
}

app.whenReady().then(() => {
  createWindow();
  // Global shortcut to toggle overlay (optional)
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (mainWindow.isVisible()) mainWindow.hide();
    else mainWindow.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); 