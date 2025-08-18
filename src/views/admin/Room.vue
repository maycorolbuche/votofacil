<template>
  <ErrorMessage v-if="error" :message="error" />
  <div v-else-if="data" class="vh-100 d-flex flex-column" style="height: 100vh">
    <Header :data="data" @save="load_data(true)" />

    <div
      class="flex-grow-1 d-flex flex-column content-container"
      style="min-height: 0"
    >
      <BCard no-body class="mx-2">
        <BTabs card>
          <TabCandidates :data="data" @save="load_data(true)" />
          <BTab title="Eleitores">
            <BCardText>Tab contents 2</BCardText>
          </BTab>
          <BTab title="Projetar">
            <BCardText>Tab contents 2</BCardText>
            <BCardText class="overflow overflow-auto">
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
              Tab contents 2<br />
            </BCardText>
          </BTab>
          <TabConfigs :data="data" @save="load_data(true)" />
          <BTab v-if="isDebug" title="Params">
            <BCardText class="overflow overflow-auto">
              <pre>{{ data }}</pre>
            </BCardText>
          </BTab>
        </BTabs>
      </BCard>
    </div>

    <Footer :data="data" :lock="lock" />
  </div>
  <div
    v-else
    class="vh-100 d-flex flex-column align-items-center justify-content-center"
  >
    <BSpinner variant="light" style="width: 3rem; height: 3rem" class="me-2" />
  </div>
</template>

<script>
import Api from "@/services/Api.js";
import Storage from "@/helpers/Storage.js";

import Header from "@/components/admin/Header.vue";
import Footer from "@/components/admin/Footer.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import TabCandidates from "@/components/admin/TabCandidates.vue";
import TabConfigs from "@/components/admin/TabConfigs.vue";

export default {
  components: {
    Header,
    Footer,
    TabCandidates,
    TabConfigs,
    ErrorMessage,
  },
  data: () => ({
    data: null,
    error: null,
    timer: null,
    lock: false,
    count_error: 0,
    abort_controller: null,
  }),
  computed: {
    isDebug() {
      const isLocalhost = window.location.hostname === "localhost";
      const urlParams = new URLSearchParams(window.location.search);
      const hasDebugParam = urlParams.get("debug") === "true";
      return isLocalhost || hasDebugParam;
    },
  },
  methods: {
    async load_data(force) {
      if (force) {
        this.abort();
        console.log("FORCE");
      }

      if (this.lock) {
        return;
      }

      this.abort_controller = new AbortController();
      const signal = this.abort_controller.signal;

      this.lock = true;
      let self = this;
      await Api.get("/admin/sync", null, function (status, data) {
        self.lock = false;

        if (!status) {
          self.error = data;
          self.count_error++;

          if (self.count_error >= 10) {
            self.$router.push({ name: "Home" });
          }
          return;
        }

        Storage.set("admin-token-ts", Date.now());

        self.count_error = 0;
        self.error = null;
        self.data = data;
      });
    },
    abort() {
      if (this.abort_controller) {
        this.abort_controller.abort();
      }
    },
  },
  mounted() {
    this.timer = setInterval(this.load_data, 3000);
    this.load_data();
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
};
</script>

<style>
.content-container > .card .tabs,
.content-container > .card .tabs .tab-content,
.content-container > .card .tabs .tab-content .tab-pane.active {
  display: flex;
  flex-direction: column;
}
.content-container > .card,
.content-container > .card .tabs,
.content-container > .card .tabs .tab-content,
.content-container > .card .tabs .tab-content .tab-pane.active,
.content-container > .card .overflow {
  min-height: 0;
}

.content-container > .card,
.content-container > .card .tabs,
.content-container > .card .tabs .tab-content {
  flex: 1;
}

button.dropdown-toggle {
  margin: 0;
  padding: 0;
}
</style>
