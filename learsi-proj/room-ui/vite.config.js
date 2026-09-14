import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Built files land in Flask's static folder and are served at /static/room-ui/
export default defineConfig({
  plugins: [react()],
  base: '/static/room-ui/',
  build: {
    outDir: '../srcs/static/room-ui',
    emptyOutDir: true,
    // Stable names so Flask templates can link without a manifest dance
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:5000',
    },
  },
})
