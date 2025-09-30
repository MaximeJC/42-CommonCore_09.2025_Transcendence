import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://hgp_user_management:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        ws: true,
      },
      '/game': {
        target: 'http://hgp_game_management:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/game/, ''),
        ws: true,
      }
    },
    host: '0.0.0.0', 
    port: 5173,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
