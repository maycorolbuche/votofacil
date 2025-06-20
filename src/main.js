import { createApp } from "vue";
import * as components from "bootstrap-vue-next"; // Importa todos os componentes

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Registrar todos os componentes do Bootstrap
Object.entries(components).forEach(([componentName, component]) => {
  if (componentName.startsWith("B")) {
    app.component(componentName, component);
  }
});

import "./assets/styles/main.css";
import "./assets/styles/input.css";

app.use(router);
app.mount("#app");
