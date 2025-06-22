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
        <BFormInput
          class="room-input uppercase"
          v-model="room"
          placeholder="Código da Sala"
        />
        <BButton class="w-100 my-2" variant="dark">Acessar</BButton>
      </BCard>
      <div class="mt-2 text-white">
        <router-link class="home-link fw-bold" to="/te">Criar Sala</router-link>
      </div>
    </div>
    <small class="mb-2 text-white">
      <router-link class="home-link" to="/te">Termos e Privacidade</router-link>
      <span class="px-3">|</span>
      <router-link class="home-link" to="/te">Ajuda</router-link>
      <span class="px-3">|</span>
      <router-link class="home-link" to="/te">Contato</router-link>
    </small>
  </div>
</template>

<script>
export default {
  data: () => ({
    room: null,
  }),
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
