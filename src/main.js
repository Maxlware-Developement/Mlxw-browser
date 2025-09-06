const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tabs = [];
let settings = {
  homePage: `file://${path.join(__dirname, 'renderer', 'home.html')}`,
  searchEngine: 'https://www.google.com/search?q='
};

const settingsPath = path.join(__dirname, 'settings.json');
if (fs.existsSync(settingsPath)) {
  try {
    const file = fs.readFileSync(settingsPath, 'utf-8');
    const userSettings = JSON.parse(file);
    settings = { ...settings, ...userSettings };
  } catch (e) {
    console.error('Erreur dans settings.json:', e);
  }
}

function saveSettings() {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('renderer/index.html');

  createTab(settings.homePage);

  mainWindow.on('resize', () => {
    resizeActiveTab();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTab(url) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
    },
  });

  view.webContents.loadURL(url);
  view.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  mainWindow.setBrowserView(view);
  tabs.push(view);
  resizeActiveTab();

  view.webContents.on('page-title-updated', () => {
    sendTabsToRenderer();
  });

  view.webContents.on('did-finish-load', () => {
    sendTabsToRenderer();
  });
}

function resizeActiveTab() {
  if (!mainWindow || tabs.length === 0) return;
  const bounds = mainWindow.getBounds();
  const view = tabs[tabs.length - 1];
  view.setBounds({
    x: 0,
    y: 80,
    width: bounds.width,
    height: bounds.height - 80,
  });
  view.setAutoResize({ width: true, height: true });
}

function sendTabsToRenderer() {
  const tabData = tabs.map(tab => ({
    title: tab.webContents.getTitle(),
    favicon: tab.webContents.getURL().startsWith('http')
      ? `https://www.google.com/s2/favicons?sz=64&domain_url=${tab.webContents.getURL()}`
      : null
  }));
  mainWindow.webContents.send('tabs-updated', tabData);
}

ipcMain.on('navigate', (_, input) => {
  const view = tabs[tabs.length - 1];
  if (!input) return;

  const url = isValidUrl(input)
    ? (input.startsWith('http') ? input : `https://${input}`)
    : `${settings.searchEngine}${encodeURIComponent(input)}`;

  view.webContents.loadURL(url);
});

ipcMain.on('new-tab', (_, inputUrl) => {
  const url = inputUrl || settings.homePage;
  createTab(url);
});

ipcMain.on('switch-tab', (_, index) => {
  const tab = tabs[index];
  if (!tab) return;
  mainWindow.setBrowserView(tab);
  resizeActiveTab();
});

ipcMain.on('close-app', () => app.quit());
ipcMain.on('minimize-app', () => mainWindow.minimize());
ipcMain.on('maximize-app', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});

function isValidUrl(str) {
  return str.includes('.') || str.startsWith('http');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
