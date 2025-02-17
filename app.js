class App {
  id = null;
  version = null;
  server_version = null;
  data = null;
  init(id) {
    this.id = id;
    this.get_version();
    this.get_data();
    this.render();
  }
  render() {
    const elements = document.querySelectorAll(`#${this.id} [data-app]`);
    elements.forEach((element) => {
      const propName = element.getAttribute("data-app");
      if (typeof this[propName] === "object") {
        element.innerHTML = JSON.stringify(this[propName]);
      } else {
        element.innerHTML = this[propName];
      }
    });
  }
  get_version() {
    window.electronAPI.getVersion();
  }
  set_version(version) {
    this.version = version.version;
    this.server_version = version.server;
    this.render();
  }
  get_data() {
    window.electronAPI.getData();
  }
  set_data(data) {
    this.data = data;
    this.render();
  }
  set_param(name, value) {
    window.electronAPI.setParam(name, value);
  }
}
