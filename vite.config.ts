import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve,dirname  } from 'path';
import { fileURLToPath } from 'url';
import Components from 'unplugin-vue-components/vite'
import {BootstrapVueNextResolver} from 'bootstrap-vue-next'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE_URL ?? "/",
  plugins: [
    vue(),
    Components({
      resolvers: [BootstrapVueNextResolver()],
    }),
  ],
  server: {
    port: 4001,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
