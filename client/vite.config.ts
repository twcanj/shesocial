import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      manifest: {
        name: 'SheSocial - 奢華社交活動平台',
        short_name: 'SheSocial',
        description: '台灣高端社交活動平台，專注於隱私保護、會員分級和優質體驗',
        theme_color: '#d4af37',
        background_color: '#faf0e6',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['social', 'lifestyle'],
        lang: 'zh-TW',
        dir: 'ltr',
        shortcuts: [
          {
            name: '瀏覽活動',
            short_name: '活動',
            description: '查看最新的社交活動',
            url: '/events',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: '個人資料',
            short_name: '資料',
            description: '管理個人資料和設定',
            url: '/profile',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192'
              }
            ]
          }
        ]
      }
    })
  ]
})
