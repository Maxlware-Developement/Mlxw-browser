const { session } = require('electron');
const fetch = require('node-fetch');
const { loadConfig } = require('./config_loader');

let blockedHosts = [];

async function loadBlockedHosts() {
  const settings = loadConfig();
  let hosts = [];

  if (Array.isArray(settings.adblock_sources)) {
    for (const url of settings.adblock_sources) {
      try {
        const res = await fetch(url);
        const text = await res.text();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        hosts.push(...lines);
      } catch (err) {
        console.error('[Config/Net/Adblock] :', url, err);
      }
    }
  }

  blockedHosts = hosts;
  console.log(blockedHosts)
  console.log('[ADBLOCK] Adblock hosts loaded:', blockedHosts.length);
}

function setupAdblock(view) {
  const ses = view.webContents.session;

  ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const url = details.url;
    const blocked = blockedHosts.some(domain => url.includes(domain));

    if (blocked) {
      console.log('[ADBLOCK] Ad blocked :', url);
      return callback({ cancel: true });
    }

    callback({ cancel: false });
  });
}

loadBlockedHosts();
module.exports = { setupAdblock, loadBlockedHosts };
