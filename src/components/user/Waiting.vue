<template>
  <div
    class="min-vh-100 min-vw-100 d-flex flex-column justify-content-center align-items-center"
  >
    <div
      class="page-container d-flex flex-column align-items-center justify-content-center"
      style="flex: auto"
    >
      <img src="@/assets/imgs/logo.svg" class="main-logo" />

      <BCard class="w-100" variant="warning" header="Aguardando aprovação">
        <BCardText>
          <span>
            Aguarde
            <strong>{{ name }}</strong>
            ...
          </span>
          <span> O administrador deve aprovar sua entrada na sala! </span>
        </BCardText>
        <div class="d-flex justify-content-center align-items-center w-100">
          <BSpinner style="width: 3rem; height: 3rem" class="me-2" />
        </div>
      </BCard>
      <div class="mt-2 text-white">
        <router-link class="link-white fw-bold" :to="{ name: 'Home' }">
          Voltar para o início
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
  },
  computed: {
    name() {
      return this.data?.users?.filter((u) => u.is_primary == true)[0]?.name;
    },
  },
};
</script>
