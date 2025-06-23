<template>
  <div
    class="min-vh-100 min-vw-100 d-flex flex-column justify-content-center align-items-center"
  >
    <div
      class="page-container d-flex flex-column align-items-center justify-content-center"
      style="flex: auto"
    >
      <img src="@/assets/imgs/logo.svg" class="main-logo" />

      <BCard class="w-100" variant="danger" header="Erro">
        <BCardText> {{ message }}</BCardText>

        <BButton
          class="w-100 mt-2"
          variant="dark"
          @click="$router.push({ name: 'Home' })"
        >
          Voltar para o início
        </BButton>
      </BCard>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: String,
  },
};
</script>
