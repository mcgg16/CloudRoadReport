import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Assisted by AI to get the proxy servers and targets
  server: {
    proxy: {
      '/api/reports': {
        target: 'http://127.0.0.1:5002',
      },
      '/api/accounts': {
        target: 'http://127.0.0.1:5001',
      },
    },
  },
})
