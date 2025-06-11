import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'simple-peer': 'simple-peer/simplepeer.min.js'
    }
  },
  optimizeDeps: {
    include: ['simple-peer']
  }
})
