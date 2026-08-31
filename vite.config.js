import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The hosted API (https://vetta-backend.vercel.app) only sends CORS headers for
// http://localhost:3000, so the browser blocks calls made from the dev server.
// In dev we call a same-origin `/api/*` path instead and let Vite proxy it to
// the backend server-side (no CORS involved). Override the target with
// VITE_DEV_API_PROXY_TARGET if you run the backend locally.
const API_PROXY_TARGET =
  process.env.VITE_DEV_API_PROXY_TARGET || 'https://vetta-backend.vercel.app'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
