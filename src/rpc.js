// rpc.js
const RPC = require('discord-rpc');

const clientId = '1359597402096537620';
const startTimestamp = new Date();

const rpc = new RPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
  rpc.setActivity({
    details: 'Navigue avec Mxlw Browser',
    state: 'Disponible sur Github',
    startTimestamp,
    instance: false
  });
  console.log('[RPC] En ligne...');
});

rpc.login({ clientId }).catch(console.error);

