<template>
  <ErrorMessage v-if="error" :message="error" />
  <div v-else-if="data" class="vh-100 d-flex flex-column" style="height: 100vh">
    <div>
      <BCard
        no-body
        class="m-3 p-2 d-flex align-items-center flex-nowrap flex-row"
      >
        <div class="mx-2">
          <BLink>
            <svg
              style="width: 20px"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <title>pencil</title>
              <path
                d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
              />
            </svg>
          </BLink>
        </div>
        <div style="flex: auto">
          <BCardTitle v-if="data?.room?.name" class="m-0">
            {{ data?.room?.name }}
          </BCardTitle>
          <BCardTitle v-else class="m-0 text-muted"> Sala sem nome </BCardTitle>
        </div>
        <div class="mx-2">
          <BDropdown
            size="lg"
            variant="link"
            toggle-class="text-decoration-none"
            no-caret
          >
            <template #button-content>
              <svg
                style="width: 24px"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <title>menu</title>
                <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
              </svg>
            </template>
            <BDropdownItem href="#">Action</BDropdownItem>
            <BDropdownItem href="#">Another action</BDropdownItem>
            <BDropdownItem href="#">Something else here...</BDropdownItem>
          </BDropdown>
        </div>
      </BCard>
    </div>
    <div
      class="flex-grow-1 d-flex flex-column content-container"
      style="min-height: 0"
    >
      <BCard no-body class="m-3">
        <BTabs card>
          <BTab title="Candidatos" active>
            <BCardText> sdfds </BCardText>
            <BCardText class="overflow">
              {{ data }}
              <p></p>
              <hr />
              Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />
              Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />
              Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />
              Tab contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />Tab contents 1<br />Tab contents 1<br />Tab
              contents 1<br />
            </BCardText>
          </BTab>
          <BTab title="Eleitores">
            <BCardText>Tab contents 2</BCardText>
          </BTab>
          <BTab title="Configurações">
            <BCardText>Tab contents 2</BCardText>
          </BTab>
        </BTabs>
      </BCard>
    </div>
    <div>
      <BCard
        no-body
        class="m-3 p-2 d-flex align-items-center flex-nowrap flex-row"
      >
        <div style="flex: auto">
          <BCardText class="m-0 small">Código da Sala:</BCardText>
          <BCardTitle class="m-0">
            {{ data?.room?.code }}
          </BCardTitle>
        </div>
        <div class="text-danger">
          <svg
            style="width: 24px"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              v-if="!lock"
              d="M16.5 12C16.5 11.32 16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12C20 12.37 19.97 12.73 19.92 13.08C20.61 13.18 21.25 13.4 21.84 13.72C21.94 13.16 22 12.59 22 12C22 6.5 17.5 2 12 2C6.47 2 2 6.5 2 12C2 17.5 6.5 22 12 22C12.59 22 13.16 21.94 13.72 21.84C13.26 21 13 20.03 13 19C13 18.71 13.03 18.43 13.07 18.15C12.75 18.78 12.4 19.39 12 19.96C11.17 18.76 10.5 17.43 10.09 16H13.81C14.41 14.96 15.31 14.12 16.4 13.6C16.46 13.07 16.5 12.54 16.5 12M12 4.03C12.83 5.23 13.5 6.57 13.91 8H10.09C10.5 6.57 11.17 5.23 12 4.03M4.26 14C4.1 13.36 4 12.69 4 12S4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12S7.56 13.34 7.64 14H4.26M5.08 16H8C8.35 17.25 8.8 18.45 9.4 19.56C7.57 18.93 6.03 17.65 5.08 16M8 8H5.08C6.03 6.34 7.57 5.06 9.4 4.44C8.8 5.55 8.35 6.75 8 8M14.34 14H9.66C9.56 13.34 9.5 12.68 9.5 12S9.56 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12S14.43 13.34 14.34 14M14.59 4.44C16.43 5.07 17.96 6.34 18.92 8H15.97C15.65 6.75 15.19 5.55 14.59 4.44M22.5 17.25L17.75 22L15 19L16.16 17.84L17.75 19.43L21.34 15.84L22.5 17.25Z"
            />
            <path
              v-else
              d="M16.5 11.74C16.5 11.15 16.43 10.58 16.36 10H19.74C19.82 10.33 19.89 10.67 19.93 11C20.65 11.07 21.34 11.23 22 11.5C21.71 6.21 17.35 2 12 2C6.47 2 2 6.5 2 12C2 17.5 6.5 22 12 22C12.87 22 13.71 21.88 14.5 21.67C13.71 20.71 13.18 19.5 13.04 18.2C12.73 18.81 12.39 19.4 12 19.96C11.17 18.76 10.5 17.43 10.09 16H13.18C13.35 15.28 13.64 14.61 14.03 14H9.66C9.56 13.34 9.5 12.68 9.5 12S9.56 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12C14.5 12.5 14.46 13 14.4 13.5C14.97 12.76 15.68 12.17 16.5 11.74M4.26 14C4.1 13.36 4 12.69 4 12S4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12S7.56 13.34 7.64 14H4.26M5.08 16H8C8.35 17.25 8.8 18.45 9.4 19.56C7.57 18.93 6.03 17.65 5.08 16M8 8H5.08C6.03 6.34 7.57 5.06 9.4 4.44C8.8 5.55 8.35 6.75 8 8M10.09 8C10.5 6.57 11.17 5.23 12 4.03C12.83 5.23 13.5 6.57 13.91 8H10.09M18.92 8H15.97C15.65 6.75 15.19 5.55 14.59 4.44C16.43 5.07 17.96 6.34 18.92 8M23 17.5C23 18.32 22.75 19.08 22.33 19.71L21.24 18.62C21.41 18.28 21.5 17.9 21.5 17.5C21.5 16.12 20.38 15 19 15V16.5L16.75 14.25L19 12V13.5C21.21 13.5 23 15.29 23 17.5M19 18.5L21.25 20.75L19 23V21.5C16.79 21.5 15 19.71 15 17.5C15 16.68 15.25 15.92 15.67 15.29L16.76 16.38C16.59 16.72 16.5 17.1 16.5 17.5C16.5 18.88 17.62 20 19 20V18.5Z"
            />
          </svg>
        </div>
      </BCard>
    </div>
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

import ErrorMessage from "@/components/ErrorMessage.vue";

export default {
  components: {
    ErrorMessage,
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
.content-container > .card .tabs .tab-content .tab-pane.active {
  min-height: 0;
}

.content-container > .card .overflow {
  overflow: auto;
  min-height: 0;
}

.content-container > .card {
  flex: 1;
}

button.dropdown-toggle {
  margin: 0;
  padding: 0;
}
</style>
