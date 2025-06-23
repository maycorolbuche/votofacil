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
        <label>Digite seu nome:</label>
        <BFormInput placeholder="Nome" />
        <BButton class="w-100 mt-2" variant="dark" :disabled="loading">
          <BSpinner v-if="loading" small class="mx-1" />
          <span v-else>Confirmar</span>
        </BButton>

        <BAlert
          v-model="has_error"
          variant="danger"
          class="w-100 mt-2"
          dismissible
        >
          {{ error }}
        </BAlert>
      </BCard>
      <div class="mt-2 text-white">
        <router-link class="link-white fw-bold" :to="{ name: 'Home' }">
          Voltar
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    error: null,
    loading: false,
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
};
</script>
