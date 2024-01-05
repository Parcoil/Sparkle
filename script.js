const { ipcRenderer } = require("electron");
const ipc = ipcRenderer;
const runCleanButton = document.getElementById("runClean");
const runDebloatButton = document.getElementById("runDebloat");
const ramUsageDiv = document.getElementById("ramUsage");
const totalRamSpan = document.getElementById("totalRam");
const freeRamSpan = document.getElementById("freeRam");
const usedRamSpan = document.getElementById("usedRam");
const progressBar = document.getElementById("progressBar");
const internetButton = document.getElementById("internet");

document.querySelector("#minimize").addEventListener("click", () => {
  ipc.send("manualMinimize");
});

document.querySelector("#maximize").addEventListener("click", () => {
  ipc.send("manualMaximize");
});

document.querySelector("#close").addEventListener("click", () => {
  ipc.send("manualClose");
});

runCleanButton.addEventListener("click", () => {
  ipcRenderer.send("run-clean");
});

runDebloatButton.addEventListener("click", () => {
  ipcRenderer.send("run-debloat");
});

document.querySelector("#internet").addEventListener("click", () => {
  ipc.send("internet");
});

function updateRamUsage() {
  ipcRenderer.send("get-ram-usage");
}

ipcRenderer.send("get-ram-usage");
setInterval(updateRamUsage, 5000); // Update every 5 seconds (adjust as needed)

ipcRenderer.on("ram-usage", (event, ramUsage) => {
  const total = ramUsage.total;
  const free = ramUsage.free;
  const used = ramUsage.used;
  const usedPercentage = (parseFloat(used) / parseFloat(total)) * 100;

  totalRamSpan.textContent = total;
  freeRamSpan.textContent = free;
  usedRamSpan.textContent = used;
  progressBar.style.width = usedPercentage + "%";
  progressBar.setAttribute("aria-valuenow", usedPercentage);
});

document.addEventListener("DOMContentLoaded", () => {
  // Check if the checkbox is checked (on) or unchecked (off)
  const discordRpcCheckbox = document.getElementById("flexSwitchCheckDefault");
  const isRpcEnabled = discordRpcCheckbox.checked;

  if (isRpcEnabled) {
    ipcRenderer.send("start-discord-rpc");
  }

  discordRpcCheckbox.addEventListener("change", (event) => {
    if (event.target.checked) {
      ipcRenderer.send("start-discord-rpc");
    } else {
      ipcRenderer.send("stop-discord-rpc");
    }
  });
});
