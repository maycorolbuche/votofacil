<template>OLA MUNBDO</template>

<script>
import Api from "@/services/Api.js";
import Storage from "@/helpers/Storage.js";

import Header from "@/components/admin/Header.vue";
import Footer from "@/components/admin/Footer.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import TabCandidates from "@/components/admin/TabCandidates.vue";
import TabUsers from "@/components/admin/TabUsers.vue";
import TabView from "@/components/admin/TabView.vue";
import TabConfigs from "@/components/admin/TabConfigs.vue";

export default {
  components: {
    Header,
    Footer,
    TabCandidates,
    TabUsers,
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
      const isLocalhost = Api.is_local();
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
      await Api.get(
        "/admin/sync",
        {
          __signal: signal,
        },
        function (status, data) {
          self.lock = false;

          if (!status) {
            if (!(typeof data === "string" && data.includes("signal"))) {
              self.error = data;
              self.count_error++;

              if (self.count_error >= 10) {
                self.$router.push({ name: "Home" });
              }
            }
            return;
          }

          Storage.set("admin-token-ts", Date.now());

          self.count_error = 0;
          self.error = null;

          if (data.datetime !== self.data?.datetime) {
            console.log("DATA UPDATED");
            self.data = data;
          }
        }
      );
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
