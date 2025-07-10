import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA plugin temporarily disabled due to Vite 7 compatibility issue
    // Will be re-enabled once a compatible version is available
  ]
})
