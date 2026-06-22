// Electron main process — loads the built web bundle into a desktop window.
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    title: 'Realm Quest',
    backgroundColor: '#0c0f0a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.removeMenu();
  // dist/index.html is produced by `vite build`
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
