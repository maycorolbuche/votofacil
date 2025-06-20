import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve,dirname  } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE_URL ?? "/",
  plugins: [vue()],
  server: {
    port: 4001,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
