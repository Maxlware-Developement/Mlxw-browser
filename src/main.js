const { app, BrowserWindow, BrowserView, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const sudo = require('sudo-prompt');
const { setupContextMenu, setupCreditsShortcut } = require('./context-menu');
const { setupAdblock } = require('./adblocker');

if (process.platform === 'win32' && !process.argv.includes('--elevated')) {
  const execPath = process.execPath;
  const options = { name: 'Mxlw Browser' };
  const command = `"${execPath}" ${process.argv.slice(1).join(' ')} --elevated`;

  sudo.exec(command, options, (error) => {
    if (error) console.error('Échec élévation :', error);
    app.quit();
  });
  return;
}

require('./rpc.js');

const verifiedSites = [
  'maxlware.fr',
  'github.com',
  'developer.mozilla.org',
  'electronjs.org'
];

const blockedTLDs = [
  '.xyz', '.top', '.click', '.zip', '.review', '.cam', '.tk',
  '.ml', '.ga', '.cf', '.gq', '.men', '.party', '.stream',
  '.work', '.buzz', '.loan', '.download', '.win', '.pw'
];

let mainWindow;
let tabs = [];
let blockedUrlTemp = null;
let blockedReasonTemp = null;

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
    console.error('Erreur settings.json:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    title: 'Mxlw Browser',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('renderer/index.html');
  setupCreditsShortcut(mainWindow);

  createTab(settings.homePage);

  mainWindow.on('resize', () => resizeActiveTab());
  mainWindow.on('closed', () => mainWindow = null);

  globalShortcut.register('Control+Alt+I', () => {
    const activeTab = tabs[tabs.length - 1];
    if (activeTab) activeTab.webContents.openDevTools({ mode: 'detach' });
  });
}

function createTab(url) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  setupAdblock(view);
  mainWindow.setBrowserView(view);
  tabs.push(view);
  resizeActiveTab();
  view.webContents.loadURL(url);

view.webContents.on('did-finish-load', () => {
  try {
    const currentURL = view.webContents.getURL();
    const hostname = new URL(currentURL).hostname;

    if (verifiedSites.includes(hostname)) {
      console.log(`[VÉRIFIÉ] ${hostname}`);
      mainWindow.webContents.send('site-verified', hostname);
    } else {
      console.log(`[NON VÉRIFIÉ] ${hostname}`);
      mainWindow.webContents.send('site-unverified');
    }
  } catch (err) {
    mainWindow.webContents.send('site-unverified');
  }

  sendTabsToRenderer();
});

  view.webContents.on('will-navigate', (event, newUrl) => {
    const parsed = new URL(newUrl);
    const hostname = parsed.hostname;
    if (parsed.protocol === 'http:') {
      event.preventDefault();
      blockedUrlTemp = newUrl;
      blockedReasonTemp = 'Connexion non sécurisée (HTTP)';
      loadWarningTab();
    }
    if (blockedTLDs.some(tld => hostname.endsWith(tld))) {
      event.preventDefault();
      blockedUrlTemp = newUrl;
      blockedReasonTemp = `Extension de domaine suspecte (${hostname})`;
      loadWarningTab();
    }
  });

  setupContextMenu(mainWindow, view);
  view.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
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

function loadWarningTab() {
  const warningUrl = `file://${path.join(__dirname, 'renderer', 'warning.html')}?reason=${encodeURIComponent(blockedReasonTemp)}&url=${encodeURIComponent(blockedUrlTemp)}`;
  createTab(warningUrl);
}

ipcMain.on('navigate', (_, input) => {
  const view = tabs[tabs.length - 1];
  if (!input) return;

  const url = input.includes('.') ? (input.startsWith('http') ? input : `https://${input}`) : `${settings.searchEngine}${encodeURIComponent(input)}`;
  view.webContents.loadURL(url);
});

ipcMain.on('new-tab', (_, inputUrl) => createTab(inputUrl || settings.homePage));
ipcMain.on('switch-tab', (_, index) => {
  const tab = tabs[index];
  if (tab) {
    mainWindow.setBrowserView(tab);
    resizeActiveTab();
  }
});

ipcMain.on('close-app', () => app.quit());
ipcMain.on('minimize-app', () => mainWindow.minimize());
ipcMain.on('maximize-app', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
