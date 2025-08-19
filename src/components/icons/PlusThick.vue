<template>
  <Icon v-bind="$attrs" path="M20 14H14V20H10V14H4V10H10V4H14V10H20V14Z" />
</template>

<script>
import Icon from "@/components/Icon.vue";

export default {
  components: {
    Icon,
  },
  inheritAttrs: false,
};
</script>
