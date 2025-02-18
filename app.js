class App {
  id = null;
  data = {};
  init(id) {
    this.id = id;
    this.get_version();
    this.get_data();
    this.render();
  }
  refresh() {
    this.render();
  }
  render() {
    const elements = document.querySelectorAll(`#${this.id} [data-app]`);
    elements.forEach((element) => {
      let propName = "data";
      if (element.getAttribute("data-app")) {
        propName += "." + element.getAttribute("data-app");
      }

      const props = propName.split(".");
      let value = this;
      for (const prop of props) {
        value = value[prop];
      }

      if (typeof value === "object") {
        value = JSON.stringify(value);
      }

      if (element.tagName === "INPUT") {
        element.value = value;
      } else {
        element.innerHTML = value;
      }
    });

    this.adjust_layout();
  }
  adjust_layout() {
    const headerHeight = document.querySelector("header").offsetHeight;
    const footerHeight = document.querySelector("footer").offsetHeight;
    document.querySelector(
      "main"
    ).style.height = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
  }
  get_version() {
    window.electronAPI.getVersion();
  }
  set_version(version) {
    this.data.version = version.version;
    this.data.server_version = version.server;
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
