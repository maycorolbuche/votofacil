const { contextBridge, ipcRenderer } = require("electron");

// Expor APIs específicas ao renderizador
contextBridge.exposeInMainWorld("electronAPI", {
  // SEND
  getData: () => ipcRenderer.send("get-data"),
  getVersion: () => ipcRenderer.send("get-version"),
  setParam: (name, value) => ipcRenderer.send("set-param", { name, value }),

  //ON
  onData: (callback) =>
    ipcRenderer.on("on-data", (event, text) => callback(text)),
  onVersion: (callback) =>
    ipcRenderer.on("on-version", (event, text) => callback(text)),
});
