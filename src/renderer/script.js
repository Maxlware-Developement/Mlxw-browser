const urlInput = document.getElementById('url');
const goBtn = document.getElementById('go');
const tabBar = document.getElementById('tabs');
const newTabBtn = document.getElementById('new-tab');

goBtn.addEventListener('click', () => {
  window.electronAPI.navigate(urlInput.value);
});
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goBtn.click();
});

document.getElementById('close').addEventListener('click', () => window.electronAPI.closeApp());
document.getElementById('minimize').addEventListener('click', () => window.electronAPI.minimizeApp());
document.getElementById('maximize').addEventListener('click', () => window.electronAPI.maximizeApp());

newTabBtn.addEventListener('click', () => window.electronAPI.newTab());

window.electronAPI.onTabsUpdated((tabs) => {
  tabBar.innerHTML = '';
  tabs.forEach((tab, i) => {
    const el = document.createElement('div');
    el.className = 'tab';
    el.innerHTML = tab.favicon
      ? `<img src="${tab.favicon}" width="16" height="16" /> ${tab.title}`
      : tab.title;
    el.onclick = () => window.electronAPI.switchTab(i);
    tabBar.appendChild(el);
  });
});

const { ipcRenderer } = require('electron');

ipcRenderer.on('open-source-view', () => {
  window.location.href = 'view-source.html';
});
