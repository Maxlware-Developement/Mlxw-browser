const fs = require('fs');
const path = require('path');


let settings = {
  "homePage": "renderer/home.html",
  "searchEngine": "https://duckduckgo.com/?t=ffab&ai=web&q=",
  "RpcEnabled": true,
  "apis": {
    "VerifiedSites": "https://browser.maxlware.fr/static/verified_sites.json"
  },
  "adblock_sources": [
    "https://browser.maxlware.fr/static/adblock.txt"
  ]
};



const settingsPath = path.join(__dirname, '../settings.json');
if (fs.existsSync(settingsPath)) {
  try {
    const file = fs.readFileSync(settingsPath, 'utf-8');
    const userSettings = JSON.parse(file);
    settings = { ...settings, ...userSettings };
  } catch (e) {
    console.error('Erreur settings.json:', e);
  }
}else {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}
function loadConfig() {
  return settings;
}

module.exports = { loadConfig };
