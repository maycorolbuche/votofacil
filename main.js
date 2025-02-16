const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const https = require("https");

let mainWindow;
let params = {};

async function serverVersion() {
  const gitPackageJsonUrl =
    "https://raw.githubusercontent.com/maycorolbuche/votofacil/main/package.json";

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.get(gitPackageJsonUrl, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });

      req.on("error", (err) => {
        reject(err);
      });
    });

    const remotePackageJson = JSON.parse(response);
    const remoteVersion = remotePackageJson.version;

    return remoteVersion;
  } catch (err) {
    console.error("Error fetching the remote package.json:", err);
    return null;
  }
}

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets/icon.png"),
  });
  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadFile("index.html");

  // Capturar o evento F12
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F12") {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Capturar eventos
  ipcMain.on("get-data", (event) => {
    try {
      event.reply("on-data", params);
    } catch (err) {
      console.log("Erro", err);
    }
  });
  ipcMain.on("get-version", async (event) => {
    try {
      const packageJson = require("./package.json");
      event.reply("on-version", {
        version: packageJson.version,
        server: null,
      });
      event.reply("on-version", {
        version: packageJson.version,
        server: await serverVersion(),
      });
    } catch (err) {
      console.log("Erro", err);
    }
  });
  ipcMain.on("set-param", (event, data) => {
    try {
      params[data.name] = data.value;
      event.reply("on-data", params);
    } catch (err) {
      console.log("Erro", err);
    }
  });
});
