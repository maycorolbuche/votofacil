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

    this.js_init();

    if (typeof Page != "undefined") {
      if (typeof Page.init != "undefined") {
        Page.init();
      }
    }
  }
  js_init() {
    M.AutoInit();
  }
  refresh() {
    this.render_data();
  }
  async load_file(element, url, inner = false) {
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

      if (inner) {
        element.innerHTML = tempDiv.innerHTML;
      } else {
        element.outerHTML = tempDiv.innerHTML;
      }

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
      try {
        element.outerHTML = `<span class='red-text'>Erro ao carregar elemento "${url}" ${error}</span>`;
      } catch (error) {}
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
  async set_data(data) {
    this.data = data;
    await this.render_lists();
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

      let remove_class = element.getAttribute("data-class-remove") ?? "";

      element.setAttribute("data-class-if", vif.trim());
      element.setAttribute("data-class-true", vtrue.trim());
      element.setAttribute("data-class-false", vfalse.trim());

      const value = this.tag_value(element, "data-class-if");

      let tag_class = "";
      let classes = `${vtrue} ${vfalse} ${remove_class}`;
      if (vtrue == "" && vfalse == "") {
        tag_class = value;
      } else if (value) {
        tag_class = vtrue ?? "";
      } else {
        tag_class = vfalse ?? "";
      }

      classes = classes.replace(/\s+/g, " ").trim();
      tag_class = tag_class.replace(/\s+/g, " ").trim();
      if (classes != "") {
        element.classList.remove(...classes.split(" "));
      }
      if (tag_class != "") {
        element.classList.add(...tag_class.split(" "));
      }

      if (element?.getAttribute("data-class-adic")) {
        try {
          let class_adic = this.tag_value(element, "data-class-adic");
          element.classList.add(...class_adic.split(" "));
        } catch (error) {}
      }
    });

    document.querySelectorAll("[data-width]").forEach((element) => {
      const value = this.tag_value(element, "data-width");
      element.style.width = `${value}px`;
    });
  }
  async render_lists() {
    const elements = document.querySelectorAll("[data-list]");

    for (const element of elements) {
      if (element.getAttribute("render")) {
        continue;
      }
      element.setAttribute("render", true);
      const list = element.getAttribute("data-list");
      const zoom = element.getAttribute("data-zoom");
      const template = element.getAttribute("data-template");
      const data = this.data[list];
      const cl_height = element.clientHeight;
      let top = 5;
      let left = 5;

      element
        .querySelectorAll("[data-id]")
        .forEach((el) => el.setAttribute("remove", true));

      for (const key of Object.keys(data)) {
        console.log(key, data[key]);

        let elementItem = element.querySelector(`[data-id="${key}"]`);
        if (!elementItem) {
          elementItem = document.createElement("div");
          elementItem.setAttribute("data-id", key);
          elementItem.style.width = "fit-content";
          elementItem.style.position = "absolute";
          elementItem.style.top = "-100px";
          elementItem.style.left = "-100px";
          element.appendChild(elementItem);

          await this.load_file(
            elementItem,
            `./templates/${template}.html`,
            true
          );

          elementItem.innerHTML = elementItem.innerHTML.replace(/#key/g, key);
          elementItem.innerHTML = elementItem.innerHTML.replace(
            /#list_colors/g,
            "red pink purple deep-purple indigo blue light-blue cyan teal green light-green lime yellow amber orange deep-orange brown grey blue-grey black white"
          );
        }

        if (zoom) {
          const v_zoom = document.getElementById(zoom).value / 100;
          console.log("zoom", zoom);
          elementItem.querySelector("*").style.zoom = v_zoom;
        }

        const rect = elementItem.getBoundingClientRect();
        const height = rect.height + 10;
        const width = rect.width + 10;

        if (top + height > cl_height) {
          top = 5;
          left += width;
        }

        elementItem.style.top = `${top}px`;
        elementItem.style.left = `${left}px`;

        elementItem.setAttribute("data-width", width);
        elementItem.setAttribute("data-height", height);
        elementItem.setAttribute("data-top", top);
        elementItem.setAttribute("data-left", left);
        elementItem.setAttribute("data-client-height", cl_height);
        elementItem.removeAttribute("remove");

        console.log("elementItem", { width, height, top, left, cl_height });
        top += height;
      }

      element.querySelectorAll("[data-id][remove]").forEach((el) => {
        el.innerHTML = el.innerHTML.replace(/data-/g, "d-");
        el.style.transition = "opacity 0.5s";
        el.style.opacity = 0;
        setTimeout(() => el.remove(), 500);
      });

      console.log(list, data, template);
      element.removeAttribute("render");
    }

    this.js_init();
    await this.load_components("component");
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

  remove_candidate(key) {
    try {
      window.electronAPI.removeCandidate(key);
    } catch (err) {
      this.error(err);
    }
  }
  /*

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
