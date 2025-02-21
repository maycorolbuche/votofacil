const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { serverVersion, validateParams, initials } = require("./node/functions");

let mainWindow;
let params = {};
const hash = uuidv4();

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
      event.reply("on-error", err);
      console.log("Erro", err);
    }
  });
  ipcMain.on("get-version", async (event) => {
    try {
      const packageJson = require("./package.json");

      params["version"] = packageJson.version;
      params["server_version"] = await serverVersion();
      params = validateParams(params);
      event.reply("on-data", params);
    } catch (err) {
      event.reply("on-error", err);
      console.log("Erro", err);
    }
  });
  ipcMain.on("set-param", (event, data) => {
    try {
      const key = data.name.split(".");
      if (key.length > 1) {
        let obj = params;
        for (let i = 0; i < key.length - 1; i++) {
          if (!obj.hasOwnProperty(key[i])) {
            obj[key[i]] = {};
          }
          obj = obj[key[i]];
        }
        obj[key[key.length - 1]] = data.value;
      } else {
        params[data.name] = data.value;
      }
      params = validateParams(params);
      event.reply("on-data", params);
    } catch (err) {
      event.reply("on-error", err);
      console.log("Erro", err);
    }
  });

  ipcMain.on("add-candidate", (event, name) => {
    try {
      /*params["candidates"][uuidv4()] = {
        name: name.trim(),
        voters_votes: 0,
        admin_votes: 0,
        votes: 0,
        votes_text: "nenhum voto",
        initials: initials(name),
        avatar: initials(name),
        position: 1,
        percent: 0,
        highlight:false,
        color: "teal",
      };*/
      params["candidates"][uuidv4()] = {
        name: name.trim(),
        voters_votes: 0,
        admin_votes: 0,
        votes: 0,
        votes_text: "nenhum voto",
        initials: initials(name),
        avatar: initials(name),
        position: 1,
        percent: Math.floor(Math.random() * 101),
        highlight: Math.random() >= 0.5,
        color: ["teal", "pink", "red", "blue", "green", "orange"][
          Math.floor(Math.random() * 6)
        ],
      };
      params = validateParams(params);
      event.reply("on-data", params);
    } catch (err) {
      event.reply("on-error", err);
      console.log("Erro", err);
    }
  });

  ipcMain.on("remove-candidate", (event, key) => {
    try {
      delete params["candidates"][key];
      params = validateParams(params);
      event.reply("on-data", params);
    } catch (err) {
      event.reply("on-error", err);
      console.log("Erro", err);
    }
  });
});

/* ====== SERVER ====== */
async function startServer(port) {
  const networkInterfaces = require("os").networkInterfaces();
  let externalAddress;
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interfaceAddress) => {
      if (interfaceAddress.family === "IPv4") {
        externalAddress = interfaceAddress.address;
      }
    });
  });

  const url = `http://${externalAddress}:${port}`;
  const url_voter = `http://${externalAddress}:${port}/voter`;
  const url_viewer = `http://${externalAddress}:${port}/viewer`;

  try {
    const server = http.createServer((req, res) => {
      if (req.url === "/voter") {
        res.writeHead(200, { "Content-Type": "text/html" });
        const filePath = path.join(__dirname, `index.html`);
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      } else if (req.method === "POST" && req.url === "/send") {
        res.writeHead(200, { "Content-Type": "text/html" });
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
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(JSON.stringify(params));
      } else if (req.method === "GET" && req.url === "/test") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(hash);
      } else if (req.url === "/favicon.ico") {
        // Ignora a requisi o do favicon
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end();
        return;
      } else if (req.url.endsWith(".css")) {
        res.writeHead(200, { "Content-Type": "text/css" });
        const filePath = path.join(__dirname, req.url);
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      } else if (req.url.endsWith(".js")) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        const filePath = path.join(__dirname, req.url);
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      } else if (
        req.url.startsWith("/assets") ||
        req.url.startsWith("/core") ||
        req.url.startsWith("/views") ||
        req.url.startsWith("/components")
      ) {
        const filePath = path.join(__dirname, req.url);
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        const filePath = path.join(__dirname, "server.html");
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      }
    });

    server.listen(port);

    let address = server.address();

    const response = await new Promise((resolve, reject) => {
      const req = http.get(`${url}/test`, (res) => {
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

    if (response !== hash) {
      throw new Error("Servidor não conectado!");
    }

    return {
      ...address,
      port,
      url,
      url_voter,
      url_viewer,
      connected: true,
    };
  } catch (err) {
    return {
      port,
      url,
      url_voter,
      url_viewer,
      message: err.message,
      connected: false,
    };
  }
}

(async () => {
  let port = 5500;
  while (true) {
    data_server = await startServer(port);

    params["server"] = data_server;
    params = validateParams(params);

    mainWindow.webContents.send("on-data", params);

    if (data_server.connected) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
    port += 1;
  }
})();
