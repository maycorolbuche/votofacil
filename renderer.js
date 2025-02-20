console.log("Aplicação Electron iniciada!");
const app = new App();
app.init("app");

window.electronAPI.onData((data) => {
  app.set_data(data);
});

window.electronAPI.onError((data) => {
  app.error(data);
});
