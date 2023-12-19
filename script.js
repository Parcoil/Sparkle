const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;
const runCleanButton = document.getElementById('runClean');
const runDebloatButton = document.getElementById('runDebloat');

document.querySelector("#minimize").addEventListener("click", () => {
  ipc.send("manualMinimize");
});

document.querySelector("#maximize").addEventListener("click", () => {
  ipc.send("manualMaximize");
});

document.querySelector("#close").addEventListener("click", () => {
  ipc.send("manualClose");
});

runCleanButton.addEventListener('click', () => {
  ipcRenderer.send('run-clean');
  showNotification('Cleaner started');
});

runDebloatButton.addEventListener('click', () => {
  ipcRenderer.send('run-debloat');
  showNotification('Debloat started');
});

function showNotification(message) {
  const Notification = require('electron-notification');
  const notification = new Notification({ title: 'PC Cleaner', body: message });
  notification.show();
}
