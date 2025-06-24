<template>
  <div v-if="data || error">
    <ErrorMessage v-if="error" :message="error" />
    <UserName v-else-if="data.status == 'no-users'" @save="load_data()" />
    <Waiting v-else-if="data.status == 'pending'" />

    <div
      v-else
      class="page-container d-flex flex-column align-items-center justify-content-center"
      style="flex: auto"
    >
      <router-link class="home-link" :to="{ name: 'Home' }"> HOME </router-link>

      VOTER. [{{ lock }}] .{{ data }}.
      <br />
      ERRO: {{ error }}
    </div>
  </div>
</template>

<script>
import Api from "@/services/Api.js";

import ErrorMessage from "@/components/ErrorMessage.vue";
import UserName from "@/components/user/UserName.vue";
import Waiting from "@/components/user/Waiting.vue";

export default {
  components: {
    ErrorMessage,
    UserName,
    Waiting,
  },
  data: () => ({
    data: null,
    error: null,
    timer: null,
    lock: false,
  }),
  methods: {
    async load_data() {
      if (this.lock) {
        return;
      }

      this.lock = true;
      let self = this;
      await Api.get("/user/sync", null, function (status, data) {
        self.lock = false;

        if (!status) {
          self.error = data;
          return;
        }

        self.error = null;
        self.data = data;
      });
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
