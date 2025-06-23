<template>
  <div
    class="min-vh-100 min-vw-100 d-flex flex-column justify-content-center align-items-center"
  >
    <div
      class="page-container d-flex flex-column align-items-center justify-content-center"
      style="flex: auto"
    >
      <img src="@/assets/imgs/logo.svg" class="logo" />

      <BCard class="w-100">
        <div v-if="user_room?.room?.code">
          <input
            class="form-control room-input uppercase"
            disabled
            :value="user_room?.room?.code"
          />
          <BButton
            class="w-100 my-2"
            variant="dark"
            @click="$router.push({ name: 'Voter' })"
          >
            Voltar para esta sala
          </BButton>
          <BButton class="w-100" variant="danger" @click="exit_room">
            Sair desta sala
          </BButton>
        </div>
        <div v-else>
          <BFormInput
            class="room-input uppercase"
            v-model="room_code"
            placeholder="Código da sala"
          />
          <BButton
            class="w-100 mt-2"
            variant="dark"
            :disabled="loading_access_room"
            @click="access_room"
          >
            <BSpinner v-if="loading_access_room" small class="mx-1" />
            <span v-else>Acessar</span>
          </BButton>
        </div>

        <BAlert v-model="has_error" variant="danger" dismissible>
          {{ error }}
        </BAlert>
      </BCard>

      <div class="mt-2 text-white">
        <BLink
          v-if="!loading_create_room"
          class="home-link fw-bold"
          @click="create_room"
        >
          Criar sala
        </BLink>
        <BSpinner v-else small class="mx-1" />
        <span v-if="has_admin_room" class="px-3">|</span>
        <router-link
          v-if="has_admin_room"
          class="home-link fw-bold"
          :to="{ name: 'Room' }"
        >
          Voltar para a sala
          <BBadge variant="light">{{ admin_room.code }}</BBadge>
        </router-link>
      </div>
    </div>

    <small class="mb-2 text-white">
      <router-link class="home-link" :to="{ name: 'About' }">
        Termos e Privacidade
      </router-link>
      <span class="px-3">|</span>
      <router-link class="home-link" :to="{ name: 'About' }">
        Ajuda
      </router-link>
      <span class="px-3">|</span>
      <router-link class="home-link" :to="{ name: 'About' }">
        Contato
      </router-link>
    </small>
  </div>
</template>

<script>
import Api from "@/services/Api.js";
import Storage from "@/helpers/Storage.js";
import Swal from "sweetalert2";

export default {
  data: () => ({
    room_code: null,
    error: null,
    loading_access_room: false,
    loading_create_room: false,
    has_admin_room: false,
    has_user_room: false,
    admin_room: [],
    user_room: [],
  }),
  computed: {
    has_error: {
      get() {
        return !!this.error;
      },
      set(value) {
        if (!value) {
          this.error = null;
        }
      },
    },
  },
  methods: {
    async create_room() {
      this.loading_create_room = true;
      let self = this;
      await Api.post("/room", null, function (status, data) {
        self.loading_create_room = false;

        //console.log(status, data);

        if (!status) {
          Swal.fire({ title: data, icon: "error" });
          return;
        }

        Storage.set("admin-token", data.token);

        self.$router.push({ name: "Room" });
      });
    },
    async access_room() {
      this.loading_access_room = false;
      this.error = null;

      if (!this.room_code) {
        this.error = "Informe o código da sala!";
        return;
      }

      this.loading_access_room = true;
      let self = this;
      await Api.post(
        "/device",
        { room_code: this.room_code },
        function (status, data) {
          self.loading_access_room = false;

          console.log(status, data);

          if (!status) {
            self.error = data;
            return;
          }

          Storage.set("user-token", data.token);

          self.$router.push({ name: "Voter" });
        }
      );
    },
    async exit_room() {
      alert("sair");
    },
  },
  async mounted() {
    let admin_token = Storage.get("admin-token");
    if (admin_token) {
      let self = this;
      await Api.get("/room", null, function (status, data) {
        console.log("/room", status, data);

        if (!status) {
          return;
        }

        self.has_admin_room = true;
        self.admin_room = data;
      });
    }

    let user_token = Storage.get("user-token");
    if (user_token) {
      let self = this;
      await Api.get("/device", null, function (status, data) {
        console.log("/device", status, data);

        if (!status) {
          return;
        }

        self.has_user_room = true;
        self.user_room = data;
      });
    }
  },
};
</script>

<style scoped>
.logo {
  max-width: 200px;
  padding: 1.5em;
  padding-top: 0;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #fff);
}

.page-container {
  width: 400px;
}
@media (max-width: 410px) {
  .page-container {
    width: calc(100% - 50px);
  }

  .logo {
    width: 75%;
    max-width: 100%;
    padding: 1em;
  }
}

@media (max-width: 300px) {
  .page-container {
    width: 100%;
  }

  .logo {
    width: 90%;
  }
}

.room-input {
  letter-spacing: 0.3em;
}

.home-link {
  color: #fff;
}
</style>
