<template>
  <Icon v-bind="$attrs" path="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
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
