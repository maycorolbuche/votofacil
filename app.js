class App {
  id = null;
  data = {};
  init(id) {
    this.id = id;
    this.get_version();
    this.get_data();
    this.render();
    this.render_components();
  }
  refresh() {
    this.render();
  }
  render() {
    document.querySelectorAll(`#${this.id} [data-app]`).forEach((element) => {
      let value = this.tag_value(element, "data-app");

      if (element.tagName === "INPUT") {
        element.value = value;
      } else {
        element.innerHTML = value;
      }
    });

    document
      .querySelectorAll(`#${this.id} [data-app-if-text]`)
      .forEach((element) => {
        let value = this.tag_value(element, "data-app-if-text");

        let text = "";
        if (value) {
          text = element.getAttribute("data-app-text-true") ?? "";
        } else {
          text = element.getAttribute("data-app-text-false") ?? "";
        }

        element.innerHTML = text;
      });

    document
      .querySelectorAll(`#${this.id} [data-app-if-class]`)
      .forEach((element) => {
        let value = this.tag_value(element, "data-app-if-class");

        let tag_class = "";
        if (value) {
          tag_class = element.getAttribute("data-app-class-true") ?? "";
        } else {
          tag_class = element.getAttribute("data-app-class-false") ?? "";
        }
        let classes = `${element.getAttribute(
          "data-app-class-true"
        )} ${element.getAttribute("data-app-class-false")}`;

        if (classes != "") {
          element.classList.remove(...classes.split(" "));
        }
        if (tag_class != "") {
          element.classList.add(...tag_class.split(" "));
        }

        console.log("value", value, tag_class);
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
  render_components() {
    document.querySelectorAll("[onenter]").forEach((element) => {
      element.setAttribute(
        "onkeyup",
        `event.keyCode === 13 ? ${element.getAttribute("onenter")} : null;`
      );
    });

    document.querySelectorAll(".__input__").forEach((element) => {
      element.classList.add("blue-grey", "darken-2", "white-text");
    });
  }
  get_version() {
    window.electronAPI.getVersion();
  }
  get_data() {
    window.electronAPI.getData();
  }
  set_data(data) {
    this.data = data;
    console.log("data", data);
    this.render();
  }
  set_param(name, value) {
    window.electronAPI.setParam(name, value);
  }
  add_candidate(name) {
    if (document.getElementById("candidate_name").value.trim() == "") {
      this.error("Digite o nome do candidato!");
      return;
    }
    if (
      Object.values(this.data.candidates).some(
        (candidate) => candidate.name === name
      )
    ) {
      this.error(`O candidato "${name}" já existe!`);
      document.getElementById("candidate_name").value = "";
      return;
    }
    window.electronAPI.addCandidate(name);
    document.getElementById("candidate_name").value = "";
  }
  error(message) {
    M.toast({ html: message, classes: "red darken-4" });
  }
  tag_value(element, property) {
    let propName = "data";
    if (element.getAttribute(property)) {
      propName += "." + element.getAttribute(property);
    }

    const props = propName.split(".");
    let value = this;
    for (const prop of props) {
      if (!value.hasOwnProperty(prop)) {
        value = null;
        break;
      }
      value = value[prop];
    }

    if (typeof value === "object") {
      value = JSON.stringify(value);
    }

    if (value == "true") {
      value = true;
    }
    if (value == "false") {
      value = false;
    }
    return value;
  }
}
