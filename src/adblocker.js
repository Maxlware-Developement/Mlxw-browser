const { session } = require('electron');

const blockedHosts = [
  'doubleclick.net',
  'googlesyndication.com',
  'adservice.google.com',
  'ads.yahoo.com',
  'pagead2.googlesyndication.com',
  'facebook.net/ads',
  'pubmatic.com',
  'adnxs.com',
  'adsafeprotected.com',
  'amazon-adsystem.com',
  'taboola.com',
  'zedo.com'
];

function setupAdblock(view) {
  const ses = view.webContents.session;

  ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const url = details.url;

    const blocked = blockedHosts.some(domain => url.includes(domain));

    if (blocked) {
      console.log('🛑 Pub bloquée :', url);
      return callback({ cancel: true });
    }

    callback({ cancel: false });
  });
}

module.exports = { setupAdblock };
