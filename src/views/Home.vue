<template>
  <div>
    <img src="@/assets/logo.svg" class="logo" />
  </div>
</template>

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
@media (max-width: 350px) {
  .logo {
    width: 100%;
    max-width: 100%;
    padding: 1em;
  }
}
</style>
