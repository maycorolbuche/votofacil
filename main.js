const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");

let mainWindow;
let params = {};

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
      params = validateParams(params);
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
      params = validateParams(params);
      event.reply("on-data", params);
    } catch (err) {
      console.log("Erro", err);
    }
  });
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  if (req.url === "/voter") {
    const filePath = path.join(__dirname, "voter.html");
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else if (req.method === "POST" && req.url === "/send") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log("Dados recebidos do navegador:", body);
      res.end("Dados recebidos com sucesso!");
    });
  } else if (req.method === "GET" && req.url === "/get") {
    // Envia dados para o navegador
    res.end(JSON.stringify(params));
  } else if (req.url === "/favicon.ico") {
    // Ignora a requisição do favicon
    res.end();
    return;
  }
});
let port = 3200;
while (true) {
  try {
    server.listen(port);
    break;
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      console.log(`Porta ${port} está  em uso, tentando outra...`);
      port++;
    } else {
      throw err;
    }
  }
}
const address = server.address();
const networkInterfaces = require("os").networkInterfaces();
let externalAddress;
Object.keys(networkInterfaces).forEach((interfaceName) => {
  networkInterfaces[interfaceName].forEach((interfaceAddress) => {
    if (interfaceAddress.family === "IPv4") {
      externalAddress = interfaceAddress.address;
    }
  });
});

params["server"] = address;
params["server"]["external_address"] = `${externalAddress}:${address.port}`;
params = validateParams(params);
ipcMain.emit("on-data", params);

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

function validateParams(params) {
  if (!params["room_name"]) {
    params["room_name"] = "Sala de Votação";
  }
  return Object.assign({}, { ...params });
}
