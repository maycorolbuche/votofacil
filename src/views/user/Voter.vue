<template>
  <div v-if="data || error" class="h-100">
    <div v-if="vote_processing">
      <div class="position-absolute z-1 w-100 h-100 bg-white opacity-50" />
      <div
        class="position-absolute z-2 w-100 h-100 d-flex align-items-center justify-content-center"
      >
        <BCard no-body class="card d-flex align-items-center flex-row p-3">
          <BSpinner class="m-2" />
          <span class="ms-2" style="font-weight: 600">
            Processando seu voto, aguarde...
          </span>
        </BCard>
      </div>
    </div>

    <div v-if="user_modal && data.status == 'open'">
      <div
        class="position-absolute z-1 w-100 h-100 bg-white d-flex align-items-center justify-content-center"
      >
        <BCard no-body class="card d-flex align-items-center flex-col p-3">
          <span v-if="!primary_user" class="ms-2" style="font-weight: 600">
            Agora, entregue o dispositivo para
          </span>
          <span class="ms-2 fs-1" style="font-weight: 600">
            {{ user_name }}
          </span>
          <span v-if="primary_user" class="ms-2" style="font-weight: 600">
            Você começa a votação!
          </span>
          <BSpinner class="m-4" />
          <BButton variant="info" @click="user_modal = false">
            Continuar
          </BButton>
        </BCard>
      </div>
    </div>

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
            <span class="text-truncate">
              {{ data?.room_name || "Sala de votação" }}
            </span>
            <!--
            <span v-if="data.status == 'closed'" class="text-truncate">
              Votação pausada
            </span>
            <span
              v-else-if="data.status == 'no-votes-left'"
              class="text-truncate"
            >
              Votação concluída
            </span>
            <span v-else class="text-truncate">
              {{ user_name }}, faça sua escolha:
            </span>
            -->
          </div>
          <BBadge v-if="data?.status == 'open'" class="mx-2">
            <AccountCircleIcon color="#FFF" />
            {{ user_name }}
          </BBadge>
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
          <BAlert
            :model-value="true"
            variant="warning"
            class="w-100 d-flex align-items-center justify-content-center"
          >
            Votação Pausada
          </BAlert>
          <span style="font-weight: 600"> Aguarde o início da votação! </span>
          <BSpinner style="width: 3rem; height: 3rem" class="m-3" />
          <div class="text-center mt-2">
            <div v-if="data?.users?.length > 1" style="font-weight: 600">
              Dispositivo Compartilhado
            </div>
            <div>
              <BBadge
                v-for="user in data?.users"
                :key="user.id"
                :variant="user.is_primary ? 'info' : 'warning'"
                class="m-1"
              >
                <AccountCircleIcon />
                {{ user.name }}
              </BBadge>
            </div>
          </div>
        </BCardText>
        <BCardText
          v-if="data.status == 'no-votes-left'"
          class="p-3 d-flex flex-column align-items-center justify-content-center h-100"
        >
          <span class="text-center" style="font-weight: 600">
            Você já finalizou sua votação! Aguarde a apuração dos votos...
          </span>
          <BSpinner style="width: 3rem; height: 3rem" class="m-3" />
        </BCardText>
        <BCardText v-else class="overflow-auto p-3 candidates-list">
          <TransitionGroup name="list" tag="ul">
            <li v-for="candidate in data?.candidates" :key="candidate.id">
              <BButton
                :variant="
                  vote_processing?.id == candidate?.id ||
                  vote_select?.id == candidate?.id
                    ? 'warning'
                    : data.votes.includes(candidate?.id)
                    ? 'light'
                    : 'info'
                "
                @click="vote(data?.user, candidate)"
              >
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
import Swal from "sweetalert2";

import ErrorMessage from "@/components/ErrorMessage.vue";
import UserName from "@/components/user/UserName.vue";
import Waiting from "@/components/user/Waiting.vue";
import AccountCircleIcon from "@/components/icons/AccountCircle.vue";
import MenuIcon from "@/components/icons/Menu.vue";

export default {
  components: {
    ErrorMessage,
    UserName,
    Waiting,
    AccountCircleIcon,
    MenuIcon,
  },
  data: () => ({
    data: null,
    error: null,
    timer: null,
    lock: false,
    count_error: 0,
    vote_select: null,
    vote_processing: null,
    processing: 0,
    user_modal: false,

    abort_controller: null,
  }),
  computed: {
    user_name() {
      return this.data?.user?.name;
    },
    primary_user() {
      return this.data?.user?.is_primary;
    },
  },
  watch: {
    data: {
      handler(newVal) {
        if (this.processing == 0) {
          this.vote_processing = null;
          this.vote_select = null;
        }
      },
      deep: true,
    },
    user_name(newVal, oldVal) {
      newVal = newVal ?? "";
      oldVal = oldVal ?? "";

      if (newVal !== oldVal && newVal !== "" && this.data?.users?.length > 1) {
        this.user_modal = true;
      }
    },
  },
  methods: {
    async load_data() {
      if (this.lock) {
        return;
      }

      this.abort_controller = new AbortController();
      const signal = this.abort_controller.signal;

      this.lock = true;
      let self = this;
      await Api.get(
        "/user/sync",
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

          Storage.set("user-token-ts", Date.now());

          self.count_error = 0;
          self.error = null;
          self.data = data;
        }
      );
    },

    async vote(user, candidate) {
      if (this.data.votes.includes(candidate?.id)) {
        return;
      }

      this.vote_select = candidate;

      Swal.fire({
        title: 'Confirma voto em "' + candidate.name + '"?',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.vote_processing = candidate;

          this.processing++;
          let self = this;
          Api.post(
            "/user/vote",
            {
              user_id: user.id,
              candidate_id: candidate.id,
            },
            function (status, data) {
              if (!status) {
                Swal.fire({ title: data, icon: "error" });
                return;
              } else {
                self.data.votes.push(candidate.id);
              }
              setTimeout(() => {
                self.processing--;
              }, 10);
            }
          );
        } else {
          this.vote_select = null;
        }
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

<style lang="scss">
.user-card.card {
  height: 100%;

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
