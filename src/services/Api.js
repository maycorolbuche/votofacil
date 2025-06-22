export default {
  get(route, options = null, callback = function () {}) {
    this.call("get", route, options, null, (resp, data) => {
      callback(resp, data);
    });
  },

  post(route, body = null, callback = function () {}) {
    this.call("post", route, null, body, (resp, data) => {
      callback(resp, data);
    });
  },

  async call(
    method,
    route,
    options = null,
    body = null,
    callback = function () {}
  ) {
    let params = "";
    if (options) {
      params = `?${this.data_to_url(options)}`;
    }

    if (route.startsWith("/")) {
      route = route.slice(1);
    }

    let url = `${this.url()}/${route}${params}`;

    let headers = { "Content-Type": "application/json" };

    if (body) {
      body = JSON.stringify(body || {});
    }

    let response = await fetch(url, {
      method,
      headers,
      body,
    }).catch((err) => {
      callback(false, `Erro ao estabelecer conexão com o servidor!`);
      DevTools.write("%c" + err, "color:red");
      return false;
    });

    if (response && response.ok) {
      let data = await response.json();
      if (data.error != undefined && data.error != "") {
        callback(false, data.error);
        return false;
      }

      callback(true, data);
      return true;
    } else if (response) {
      let data = await response.json();
      callback(false, data.error);
      return false;
    }
  },

  base_url() {
    if (window && window.location && window.location.hostname === "localhost") {
      return "http://localhost:4002";
    }
    return "https://votofacil-api.maycorolbuche.com.br/";
  },

  url() {
    return `${this.base_url()}`;
  },

  data_to_url(data) {
    return new URLSearchParams(data).toString();
  },
};
