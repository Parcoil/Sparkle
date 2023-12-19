const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const uaup = require('uaup-js');

const defaultStages = {
  Checking: "Checking For Updates!", // When Checking For Updates.
  Found: "Update Found!",  // If an Update is Found.
  NotFound: "No Update Found.", // If an Update is Not Found.
  Downloading: "Downloading...", // When Downloading Update.
  Unzipping: "Installing...", // When Unzipping the Archive into the Application Directory.
  Cleaning: "Finalizing...", // When Removing Temp Directories and Files (ex: update archive and tmp directory).
  Launch: "Launching..." // When Launching the Application.
};
const updateOptions = {
  useGithub: true, // {Default is true} [Optional] Only Github is Currenlty Supported.
  gitRepo: "sparkle", // [Required] Your Repo Name
  gitUsername: "parcoil",  // [Required] Your GitHub Username.
  isGitRepoPrivate: false,  // {Default is false} [Optional] If the Repo is Private or Public  (Currently not Supported).
  appName: "sparkle", //[Required] The Name of the app archive and the app folder.
  appExecutableName: "sparkle.exe", //[Required] The Executable of the Application to be Run after updating.
  tempDirectory: "/tmp", // {Default is "Application directory/tmp"} [Optional] Where the Update archive will download to.
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1020,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);

  win.on('closed', () => {
    win = null;
  });
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

  ipcMain.on('run-clean', () => {
    const cleanBatPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'sparkle', 'clean.bat');
    if (!fs.existsSync(cleanBatPath)) {
      downloadFile('https://raw.githubusercontent.com/Parcoil/files/main/clean.bat', cleanBatPath, () => {
        runBatFile(cleanBatPath);
      });
    } else {
      runBatFile(cleanBatPath);
    }
  });

  ipcMain.on('run-debloat', () => {
    const debloatBatPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'sparkle', 'debloat.bat');
    if (!fs.existsSync(debloatBatPath)) {
      downloadFile('https://raw.githubusercontent.com/Parcoil/files/main/debloat.bat', debloatBatPath, () => {
        runBatFile(debloatBatPath);
      });
    } else {
      runBatFile(debloatBatPath);
    }
  });
}
ipcMain.on('get-ram-usage', (event) => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const ramUsage = {
    total: formatBytes(totalMemory),
    free: formatBytes(freeMemory),
    used: formatBytes(usedMemory),
  };

  event.reply('ram-usage', ramUsage);
});

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function downloadFile(url, filePath, callback) {
  const file = fs.createWriteStream(filePath);
  https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(callback);
    });
  });
}

function runBatFile(filePath) {
  if (os.platform() === 'win32') {
    exec(`powershell -Command "Start-Process -FilePath '${filePath}' -Verb RunAs"`, (error, stdout, stderr) => {
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
}

app.on('ready', createWindow);
uaup.Update(updateOptions);