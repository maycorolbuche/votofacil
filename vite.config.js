import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
  },
  server: {
    port: 3000,
  },
});
