import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  VITE_API_URL: process.env.VITE_API_URL || "https://backend-oghbce1uy-haribs-projects-d3ee50f2.vercel.app/",
  VITE_SOCKET_URL: process.env.VITE_SOCKET_URL || "https://backend-oghbce1uy-haribs-projects-d3ee50f2.vercel.app/ws/tasks"
})
