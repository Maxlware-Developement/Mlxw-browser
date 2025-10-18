const { Menu, clipboard, shell, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

function setupContextMenu(mainWindow, view) {
  view.webContents.on('context-menu', async (_, params) => {
    const template = [
      ...(params.linkURL ? [{
        label: 'Aller sur le lien',
        click: () => shell.openExternal(params.linkURL)
      }] : []),
      {
        label: 'Copier',
        role: 'copy',
        enabled: params.selectionText.trim().length > 0
      },
      {
        label: 'Coller',
        role: 'paste'
      },
      {
        label: 'Voir le code source',
        click: async () => {
          const html = await view.webContents.executeJavaScript('document.documentElement.outerHTML');
          const filePath = path.join(__dirname, 'renderer', 'view-source.html');
          fs.writeFileSync(filePath, `<pre>${html.replace(/</g, '&lt;')}</pre>`);
          mainWindow.webContents.send('open-source-view');
        }
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  });
}

function setupCreditsShortcut(mainWindow) {
  const { globalShortcut } = require('electron');

  globalShortcut.register('Control+M', () => {
    const creditsWindow = new BrowserWindow({
      width: 400,
      height: 300,
      title: 'Crédits',
      resizable: false,
      minimizable: false,
      maximizable: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: false
      }
    });

    creditsWindow.loadURL(`data:text/html,
      <html>
      <head><title>Crédits</title></head>
      <body style="font-family:sans-serif;padding:20px;">
        <h2>Mxlw Browser</h2>
        <p>Développé par <b>Maxlware</b>.</p>
        <p>Design : Frugiser / Aero / Bento</p>
        <p>License : Mozilla Public License 2.0</p>
      </body>
      </html>`);
  });
}

module.exports = {
  setupContextMenu,
  setupCreditsShortcut
};
