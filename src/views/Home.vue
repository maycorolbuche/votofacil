<template>
  <div
    class="min-vh-100 min-vw-100 d-flex flex-column justify-content-center align-items-center"
  >
    <div class="page-container d-flex flex-column align-items-center">
      <img src="@/assets/imgs/logo.svg" class="logo" />

      <BCard class="w-100">
        <BFormInput
          class="uppercase"
          v-model="room"
          placeholder="Código da Sala"
        />
        <BButton class="w-100 my-2">Button</BButton>
        <div class="mt-2">Value: {{ room }}</div>
      </BCard>
    </div>
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
</style>
