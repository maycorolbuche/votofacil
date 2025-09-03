<template>
  <div
    class="min-vh-100 min-vw-100 d-flex flex-column justify-content-center align-items-center"
  >
    <div
      class="page-container d-flex flex-column align-items-center justify-content-center"
      style="flex: auto"
    >
      <img src="@/assets/imgs/logo.svg" class="main-logo" />

      <BCard class="w-100">
        <div
          v-if="loading_has_user_room"
          class="d-flex justify-content-center align-items-center"
        >
          <BSpinner class="mx-1" />
        </div>
        <div v-else-if="user_room?.code">
          <input
            class="form-control room-input uppercase"
            disabled
            :value="user_room?.code"
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
            :state="has_error ? false : null"
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

        <BAlert
          v-model="has_error"
          variant="danger"
          class="w-100 mt-2"
          dismissible
        >
          {{ error }}
        </BAlert>
      </BCard>

      <div v-if="loading_has_admin_room" class="mt-2 text-white">
        <BSpinner small class="mx-1" />
      </div>
      <div v-else class="mt-2 text-white">
        <BLink
          v-if="!loading_create_room"
          class="link-white fw-bold"
          @click="create_room"
        >
          Criar sala
        </BLink>
        <BSpinner v-else small class="mx-1" />
        <span v-if="has_admin_room" class="px-3">|</span>
        <router-link
          v-if="has_admin_room"
          class="link-white fw-bold"
          :to="{ name: 'Room' }"
        >
          Voltar para a sala
          <BBadge variant="light">{{ admin_room.code }}</BBadge>
        </router-link>
      </div>
    </div>

    <small class="mb-2 text-white">
      <router-link class="link-white" :to="{ name: 'About' }">
        Termos e Privacidade
      </router-link>
      <span class="px-3">|</span>
      <router-link class="link-white" :to="{ name: 'About' }">
        Ajuda
      </router-link>
      <span class="px-3">|</span>
      <router-link class="link-white" :to="{ name: 'About' }">
        Contato
      </router-link>

      <span v-if="is_local" class="px-3">|</span>
      <span v-if="is_local"> { localhost } </span>
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
    loading_has_admin_room: false,
    loading_has_user_room: false,
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
    is_local() {
      return Api.is_local();
    },
  },
  methods: {
    async create_room() {
      this.loading_create_room = true;
      let self = this;
      await Api.post("/admin/room", null, function (status, data) {
        self.loading_create_room = false;

        if (!status) {
          Swal.fire({ title: data, icon: "error" });
          return;
        }

        Storage.set("admin-token", data.token);
        Storage.set("admin-token-ts", Date.now());

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
        "/user/device",
        { room_code: this.room_code },
        function (status, data) {
          self.loading_access_room = false;

          if (!status) {
            self.error = data;
            return;
          }

          Storage.set("user-token", data.token);
          Storage.set("user-token-ts", Date.now());

          self.$router.push({ name: "Voter" });
        }
      );
    },
    async exit_room() {
      this.error = false;
      Swal.fire({
        title: "Deseja realmente sair desta sala?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.loading_has_user_room = true;

          let self = this;
          Api.delete("/user/device", null, function (status, data) {
            self.loading_has_user_room = false;

            if (!status) {
              self.error = data;
              return;
            }

            Storage.remove("user-token");
            self.has_user_room = false;
            self.user_room = [];
          });
        }
      });
    },
  },
  async mounted() {
    let admin_token = Storage.get("admin-token");
    if (admin_token) {
      let self = this;
      this.loading_has_admin_room = true;
      await Api.get("/admin/room", null, function (status, data) {
        self.loading_has_admin_room = false;

        if (!status) {
          let ts = Storage.get("admin-token-ts");
          let cts = Date.now();
          console.log(ts, cts, cts - ts);
          if (ts && cts - ts > 24 * 60 * 60 * 1000) {
            Storage.remove("admin-token");
            Storage.remove("admin-token-ts");
          }
          return;
        }

        self.has_admin_room = true;
        self.admin_room = data;
      });
    }

    let user_token = Storage.get("user-token");
    if (user_token) {
      let self = this;
      this.loading_has_user_room = true;
      await Api.get("/user/device", null, function (status, data) {
        self.loading_has_user_room = false;

        if (!status) {
          let ts = Storage.get("user-token-ts");
          let cts = Date.now();
          console.log(ts, cts, cts - ts);
          if (ts && cts - ts > 24 * 60 * 60 * 1000) {
            Storage.remove("user-token");
            Storage.remove("user-token-ts");
          }
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
.room-input {
  letter-spacing: 0.3em;
}
</style>
