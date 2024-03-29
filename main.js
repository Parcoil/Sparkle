const { app, BrowserWindow, ipcMain, Tray, Menu, shell } = require("electron"); // Import Tray and Menu
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");
const os = require("os");
const DiscordRPC = require("discord-rpc");
const electronDL = require("electron-dl");
const client = new DiscordRPC.Client({ transport: "ipc" });
const clientId = "1188686354490609754";

let win;
let tray = null;
function loading() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false, // Hide window frame
    alwaysOnTop: true, // Keep it on top
  });
  splashWindow.loadFile("splash.html");
  timeout = setTimeout(() => {
    splashWindow.close();
    win.show();
  }, 3000);
}
function createWindow() {
  win = new BrowserWindow({
    width: 1020,
    height: 600,
    frame: false,
    cache: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  function downloadAndExtractSparkle() {
    const githubRepo = "Parcoil/Sparkle"; // GitHub repository name
    const downloadURL = `https://github.com/${githubRepo}/releases/latest/download/win-unpacked.zip`;
    const downloadDir = app.getPath("userData");
    const downloadPath = path.join(downloadDir, "win-unpacked.zip");
    const extractionPath = `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\sparkle`;

    electronDL
      .download(BrowserWindow.getFocusedWindow(), downloadURL, {
        directory: downloadDir,
        filename: "win-unpacked.zip", // Set the desired filename
        overwrite: true, // Overwrite the file if it already exists
      })
      .then((dl) => {
        console.log(`Downloaded to ${dl.getSavePath()}`);

        // Extract the downloaded zip file to the specified path
        extractZip(dl.getSavePath(), extractionPath);

        // You can add further actions here after extraction if needed
      })
      .catch((error) => {
        console.error(`Error downloading the file: ${error}`);
      });
  }

  function extractZip(zipFilePath, extractionPath) {
    exec(
      `powershell Expand-Archive -Path "${zipFilePath}" -DestinationPath "${extractionPath}" -Force`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error extracting zip: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Zip extraction stderr: ${stderr}`);
          return;
        }
        console.log(`Zip extracted to ${extractionPath}`);
      }
    );
  }

  // Call the function to initiate the download and extraction process
  downloadAndExtractSparkle();

  // Trigger the batch file download when the app is ready

  client.on("ready", () => {
    client.setActivity({
      details: "The Finest Windows Optimizer.",
      state: "Sparkle",
      largeImageKey: "sparkle",
      largeImageText: "Sparkle",
      smallImageKey: "image_key",
      smallImageText: "Your text here",
      startTimestamp: new Date(),
      buttons: [{ label: "Download", url: "https:/parcoil.com/sparkle" }],
    });
  });
  win.loadFile("index.html");
  win.setMenuBarVisibility(false);

  win.on("closed", () => {
    win = null;
  });

  let maximizeToggle = false;

  ipcMain.on("manualMinimize", () => {
    if (win) {
      win.minimize();
    }
  });

  ipcMain.on("manualMaximize", () => {
    if (win) {
      if (maximizeToggle) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      maximizeToggle = !maximizeToggle;
    }
  });

  ipcMain.on("manualClose", () => {
    win.hide();
  });

  ipcMain.on("run-update-batch", () => {
    downloadAndExtractSparkle();
  });

  const batFilePath =
    "C:\\Program Files (x86)\\The Parcoil Network\\Sparkle\\clean.bat";

  function runBatttray() {
    exec(`start /B cmd /C "${batFilePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  }

  setInterval(runBatttray, 300000);

  function createDirectoryIfNotExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  function downloadNewerFile(url, filePath, callback) {
    https.get(url, function (response) {
      let remoteModDate = new Date(response.headers["last-modified"]);
      if (fs.existsSync(filePath)) {
        let localModDate = fs.statSync(filePath).mtime;
        if (remoteModDate > localModDate) {
          const file = fs.createWriteStream(filePath);
          response.pipe(file);
          file.on("finish", function () {
            file.close(callback);
          });
        } else {
          callback(); // Files are up to date
        }
      } else {
        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        file.on("finish", function () {
          file.close(callback);
        });
      }
    });
  }

  ipcMain.on("run-clean", () => {
    const installDir = "C:\\Program Files (x86)\\The Parcoil Network\\Sparkle";
    const cleanBatPath = path.join(installDir, "clean.bat");
    const cleanBatUrl =
      "https://raw.githubusercontent.com/Parcoil/files/main/clean.bat";

    createDirectoryIfNotExists(installDir);

    downloadNewerFile(cleanBatUrl, cleanBatPath, () => {
      runBatFile(cleanBatPath);

      // After running the batch file, run cleanmgr with /sagerun:1
      const { spawn } = require("child_process");
      const cleanmgrProcess = spawn("cleanmgr", ["/sagerun:1"]);

      cleanmgrProcess.on("close", (code) => {
        console.log(`cleanmgr exited with code ${code}`);
      });
    });
  });

  ipcMain.on("run-debloat", () => {
    const installDir = "C:\\Program Files (x86)\\The Parcoil Network\\Sparkle";
    const debloatBatPath = path.join(installDir, "debloat.bat");
    const debloatBatUrl =
      "https://raw.githubusercontent.com/Parcoil/files/main/debloat.bat";

    createDirectoryIfNotExists(installDir);

    downloadNewerFile(debloatBatUrl, debloatBatPath, () => {
      runBatFile(debloatBatPath);
    });
  });

  ipcMain.on("internet", () => {
    const installDir = "C:\\Program Files (x86)\\The Parcoil Network\\Sparkle";
    const internetBatPath = path.join(installDir, "internet.bat");
    const internetBatUrl =
      "https://raw.githubusercontent.com/Parcoil/files/main/internet.bat";

    createDirectoryIfNotExists(installDir);

    downloadNewerFile(internetBatUrl, internetBatPath, () => {
      runBatFile(internetBatPath);
    });
  });
}

ipcMain.on("get-ram-usage", (event) => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const ramUsage = {
    total: formatBytes(totalMemory),
    free: formatBytes(freeMemory),
    used: formatBytes(usedMemory),
  };

  event.reply("ram-usage", ramUsage);
});
ipcMain.on("start-discord-rpc", () => {
  // Set up the Discord RPC as before
  client.setActivity({
    details: "The Finest Windows Optimizer.",
    state: "Sparkle",
    largeImageKey: "sparkle",
    largeImageText: "Sparkle",
    smallImageKey: "image_key",
    smallImageText: "Your text here",
    startTimestamp: new Date(),
    buttons: [{ label: "Download", url: "https://parcoil.com/sparkle" }],
  });
});

ipcMain.on("stop-discord-rpc", () => {
  client.clearActivity();
});

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

function runBatFile(filePath) {
  if (os.platform() === "win32") {
    exec(
      `powershell -Command "Start-Process -FilePath '${filePath}' -Verb RunAs"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing the command: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Command execution error: ${stderr}`);
          return;
        }
        console.log(`Command output: ${stdout}`);
      }
    );
  } else {
    // Handle for other operating systems if needed
  }
}

app.on("ready", () => {
  loading();
  createWindow();

  // Tray icon setup
  const tray = new Tray(path.join(__dirname, "icon.ico")); // Replace with your icon path
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        win.show();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("✨ Sparkle"); // Replace with your app name
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    win.isVisible() ? win.hide() : win.show();
  });
});
client.login({ clientId }).catch(console.error);
