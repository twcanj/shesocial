import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001/api'),
    'process.env.VITE_APP_ENV': JSON.stringify(process.env.VITE_APP_ENV || 'development')
  },
  server: {
    // Re-enable HMR for proper development experience
    hmr: true,
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    include: ['dexie']
  },
  build: {
    // Ensure proper cache busting in production
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  }
})
