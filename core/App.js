class App {
  data = {};
  async init(el) {
    let element = document.getElementById(el);

    let route = window.location.pathname;
    if (route == "" || route == "/" || route.endsWith("index.html")) {
      route = "/index";
    }
    if (route.startsWith("/")) {
      route = route.slice(1);
    }

    await this.load_file(element, `./views/${route}.html`);
    await this.load_components("layout");
    await this.load_components("component");

    this.render_attrs();

    M.AutoInit();

    if (typeof Page != "undefined") {
      if (typeof Page.init != "undefined") {
        Page.init();
      }
    }
  }
  async load_file(element, url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = text;
      if (typeof element !== "object") {
        element = document.getElementById(element);
      }

      const matches = tempDiv.innerHTML.match(/{{[\s\S]+?}}/g);
      if (matches) {
        matches.forEach((match) => {
          const [key, valueTrue, valueFalse] = match
            .replace(/{{\s*|}}/g, "")
            .split(/\s*\?\s*|\s*:\s*/);
          tempDiv.innerHTML = tempDiv.innerHTML.replace(
            match,
            `<span data="${key.trim()}"
            ${valueTrue ? 'data-true="' + valueTrue.trim() + '"' : ""}
            ${valueFalse ? 'data-false="' + valueFalse.trim() + '"' : ""}
            ></span>`
          );
        });
      }

      const attrs = element
        .getAttributeNames()
        .filter((attr) => attr.startsWith("data-"));
      attrs.forEach((attr) => {
        let attribute = attr.replace(/^data-/, "");
        let value = element.getAttribute(attr);

        tempDiv.querySelectorAll("[data-attrs]").forEach((el) => {
          el.setAttribute(attribute, value);
        });
      });

      tempDiv.querySelectorAll("[data-attrs]").forEach((el) => {
        el.removeAttribute("data-attrs");
      });

      element.outerHTML = tempDiv.innerHTML;

      // Executa os scripts no conteúdo carregado
      const scripts = tempDiv.querySelectorAll("script");
      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
      });
    } catch (error) {
      element.outerHTML = `<span class='red-text'>Erro ao carregar elemento "${url}" ${error}</span>`;
    }
  }
  async load_components(type) {
    while (true) {
      const components = document.body.querySelectorAll(type);
      if (components.length <= 0) {
        break;
      }
      const component = components[0];
      let id = component.getAttribute("data");
      if (!id) {
        component.outerHTML = `<span class='red-text'>ID do elemento não atribuído</span>`;
        continue;
      }
      id = id.replace(/\./g, "/");
      await this.load_file(component, `./${type}s/${id}.html`);
    }
  }
  render_attrs() {
    document.querySelectorAll("[onenter]").forEach((element) => {
      element.setAttribute(
        "onkeyup",
        `event.keyCode === 13 ? ${element.getAttribute("onenter")} : null;`
      );
      element.removeAttribute("onenter");
    });
  }
  error(message) {
    M.toast({ html: message, classes: "red darken-4" });
  }

  get_version() {
    try {
      window.electronAPI.getVersion();
    } catch (err) {
      //this.error(err);
    }
  }
  get_data() {
    try {
      window.electronAPI.getData();
    } catch (err) {
      //this.error(err);
    }
  }
  set_data(data) {
    this.data = data;
    this.render_data();

    if (typeof Page != "undefined") {
      if (typeof Page.after_data != "undefined") {
        Page.after_data();
      }
    }
  }
  set_param(name, value) {
    window.electronAPI.setParam(name, value);
  }

  render_data() {
    document.querySelectorAll("[data]").forEach((element) => {
      let value = this.tag_value(element, "data");
      let vtrue = (element.getAttribute("data-true") ?? "").trim();
      let vfalse = (element.getAttribute("data-false") ?? "").trim();

      if (vtrue != "" || vfalse != "") {
        value = value ? vtrue : vfalse;
      }

      if (element.tagName === "INPUT") {
        element.value = value;
      } else {
        element.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-class]").forEach((element) => {
      let data_class = element.getAttribute("data-class");
      let vif = data_class.split("?")[0].trim();
      let vtrue = (data_class.split("?")[1] ?? "").trim();
      let vfalse = (vtrue.split(":")[1] ?? vif.split(":")[1] ?? "").trim();
      vtrue = vtrue.split(":")[0].trim();
      vif = vif.split(":")[0].trim();

      element.setAttribute("data-class-if", vif.trim());
      element.setAttribute("data-class-true", vtrue.trim());
      element.setAttribute("data-class-false", vfalse.trim());

      const value = this.tag_value(element, "data-class-if");

      let tag_class = "";
      let classes = "";
      if (vtrue == "" && vfalse == "") {
        tag_class = value;
        classes = element.getAttribute("class");
      } else if (value) {
        tag_class = vtrue ?? "";
        classes = `${vtrue} ${vfalse}`;
      } else {
        tag_class = vfalse ?? "";
        classes = `${vtrue} ${vfalse}`;
      }

      classes = classes.replace(/\s+/g, " ").trim();
      tag_class = tag_class.replace(/\s+/g, " ").trim();
      if (classes != "") {
        element.classList.remove(...classes.split(" "));
      }
      if (tag_class != "") {
        element.classList.add(...tag_class.split(" "));
      }
    });
  }

  render_lists() {
    document.querySelectorAll("[data-list]").forEach((element) => {
      let list = element.getAttribute("data-list");
      let template = element.getAttribute("data-template");
      let data = this.data[list];

      element.innerHTML = "";

      Object.keys(data).forEach((key) => {
        console.log(key, data[key]);

        let elementItem = document.createElement("div");
        elementItem.setAttribute("data-id", key);
        element.appendChild(elementItem);

        this.load_file(elementItem, `./templates/${template}.html`);
      });

      console.log(list, data, template);
    });
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
        //value = null;
        value = "";
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

  resize() {
    if (typeof Page != "undefined") {
      if (typeof Page.resize != "undefined") {
        Page.resize();
      }
    }
  }

  add_candidate(name) {
    if (document.getElementById("candidate_name").value.trim() == "") {
      this.error("Digite o nome do candidato!");
      return;
    }
    if (
      this.data.candidates &&
      Object.values(this.data.candidates).some(
        (candidate) => candidate.name === name
      )
    ) {
      this.error(`O candidato "${name}" já existe!`);
      document.getElementById("candidate_name").value = "";
      return;
    }
    try {
      window.electronAPI.addCandidate(name);
      document.getElementById("candidate_name").value = "";
    } catch (err) {
      this.error(err);
    }
  }
  /*
  refresh() {
    this.render_data();
  }
  adjust_layout() {
    const headerHeight = document.querySelector("header").offsetHeight;
    const footerHeight = document.querySelector("footer").offsetHeight;
    document.querySelector(
      "main"
    ).style.height = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
  }
  load_components() {
    document.querySelectorAll("[onenter]").forEach((element) => {
      element.setAttribute(
        "onkeyup",
        `event.keyCode === 13 ? ${element.getAttribute("onenter")} : null;`
      );
      element.removeAttribute("onenter");
    });

    document.querySelectorAll(".__input__").forEach((element) => {
      element.classList.add("blue-grey", "darken-2", "white-text");
    });
  }



  
*/
}
