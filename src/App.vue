<template>
  <nav>
    <router-link to="/">controller</router-link> |
    <router-link to="/voter">voter</router-link> |
    <router-link to="/viewer">viewer</router-link>
  </nav>
  <router-view />
</template>

<script>
export default {
  name: "App",
};
</script>
