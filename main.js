const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1020,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      icon: path.join(__dirname, 'icon.ico'),
    },
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);

  win.on('closed', () => {
    win = null;
  });
}

let maximizeToggle = false;

ipcMain.on('manualMinimize', () => {
  if (win) {
    win.minimize();
  }
});

ipcMain.on('manualMaximize', () => {
  if (win) {
    if (maximizeToggle) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    maximizeToggle = !maximizeToggle;
  }
});

ipcMain.on('manualClose', () => {
  app.quit();
});

ipcMain.on('run-clean', async (event) => {
  const batPath = path.join(__dirname, 'clean.bat');

  if (os.platform() === 'win32') {
    exec(`powershell -Command "Start-Process -FilePath '${batPath}' -Verb RunAs"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing the command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Command execution error: ${stderr}`);
        return;
      }
      console.log(`Command output: ${stdout}`);
    });
  } else {
    // Handle for other operating systems if needed
  }
});

ipcMain.on('run-debloat', async (event) => {
  const debloatBatPath = path.join(__dirname, 'debloat.bat');

  if (os.platform() === 'win32') {
    exec(`powershell -Command "Start-Process -FilePath '${debloatBatPath}' -Verb RunAs"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing the command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Command execution error: ${stderr}`);
        return;
      }
      console.log(`Command output: ${stdout}`);
    });
  } else {
    // Handle for other operating systems if needed
  }
});

app.on('ready', createWindow);
