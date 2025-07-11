import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
