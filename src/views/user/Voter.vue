<template>
  <div v-if="data || error">
    <ErrorMessage v-if="error" :message="error" />
    <UserName v-else-if="data.status == 'no-users'" @save="load_data()" />
    <Waiting v-else-if="data.status == 'pending'" :data="data" />

    <div v-else class="p-3 h-100" style="flex: auto">
      <img src="@/assets/imgs/logo.svg" class="watermark-logo" />
      <BCard class="user-card">
        <BCardTitle
          class="p-2 px-3 d-flex align-items-center flex-nowrap flex-row"
        >
          <div class="flex-auto">
            <span v-if="data.status == 'closed'" class="text-truncate">
              Votação pausada
            </span>
          </div>
          <div>
            <BDropdown
              size="lg"
              variant="link"
              toggle-class="text-decoration-none"
              no-caret
            >
              <template #button-content>
                <MenuIcon :size="24" />
              </template>
              <BDropdownItem :to="{ name: 'Home' }" tag="router-link">
                Página Inicial
              </BDropdownItem>
              <BDropdownItem href="#">Another action</BDropdownItem>
              <BDropdownItem href="#">Something else here...</BDropdownItem>
            </BDropdown>
          </div>
        </BCardTitle>

        <BCardText
          v-if="data.status == 'closed'"
          class="p-3 d-flex flex-column align-items-center justify-content-center h-100"
        >
          <span style="font-weight: 600"> Aguarde o início da votação! </span>
          <BSpinner style="width: 3rem; height: 3rem" class="m-3" />
        </BCardText>
        <BCardText v-else class="overflow-auto p-3 candidates-list">
          <TransitionGroup name="list" tag="ul">
            <li v-for="candidate in data?.candidates" :key="candidate.id">
              <BButton variant="warning">
                <span class="text-truncate">{{ candidate.name }}</span>
              </BButton>
            </li>
          </TransitionGroup>
        </BCardText>
      </BCard>
    </div>
  </div>
  <div
    v-else
    class="vh-100 d-flex flex-column align-items-center justify-content-center"
  >
    <BSpinner variant="light" style="width: 3rem; height: 3rem" class="m-2" />
  </div>
</template>

<script>
import Api from "@/services/Api.js";
import Storage from "@/helpers/Storage.js";

import ErrorMessage from "@/components/ErrorMessage.vue";
import UserName from "@/components/user/UserName.vue";
import Waiting from "@/components/user/Waiting.vue";
import MenuIcon from "@/components/icons/Menu.vue";

export default {
  components: {
    ErrorMessage,
    UserName,
    Waiting,
    MenuIcon,
  },
  data: () => ({
    data: null,
    error: null,
    timer: null,
    lock: false,
    count_error: 0,
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
          self.count_error++;

          if (self.count_error >= 10) {
            self.$router.push({ name: "Home" });
          }
          return;
        }

        Storage.set("user-token-ts", Date.now());

        self.count_error = 0;
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

<style lang="scss">
.user-card.card {
  height: calc(-33px + 100vh);

  .card-body {
    display: contents;
    height: 100%;
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.candidates-list {
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    li {
      flex: 1 1 300px;
      display: flex;
      justify-content: center;

      button {
        display: grid !important;
        width: 100%;
        align-items: center;
        justify-content: center;
        height: 60px !important;
        font-size: 16px !important;
      }
    }
  }
}
</style>
