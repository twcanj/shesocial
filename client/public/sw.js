// TEMPORARILY DISABLED SERVICE WORKER
// This service worker is disabled during development to prevent caching issues

console.log('⚠️ Service Worker temporarily disabled for development')

// Skip installation and activation
self.addEventListener('install', event => {
  console.log('SW: Skipping installation')
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  console.log('SW: Skipping activation')
  return self.clients.claim()
})

// Disable all caching - pass through all requests
self.addEventListener('fetch', event => {
  // Just pass through to network, no caching
  return
})

/*
// ORIGINAL SERVICE WORKER CODE - DISABLED
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies'
import { BackgroundSync } from 'workbox-background-sync'

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Background sync for offline operations
const bgSync = new BackgroundSync('shesocial-sync', {
  maxRetentionTime: 24 * 60 // 24 hours
})

// Cache strategies for different types of resources
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          return `${request.url}?${Date.now()}`
        }
      }
    ]
  })
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response.status === 200 ? response : null
        }
      }
    ]
  })
)

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new NetworkFirst({
    cacheName: 'static-resources',
    networkTimeoutSeconds: 3,
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          // Add timestamp to prevent aggressive caching of modules during development
          return process.env.NODE_ENV === 'development' 
            ? `${request.url}?dev=${Date.now()}` 
            : request.url
        }
      }
    ]
  })
)

// API cache strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response.status === 200 ? response : null
        }
      }
    ]
  })
)

// Background sync for IndexedDB sync queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-shesocial-data') {
    event.waitUntil(syncData())
  }
})

// Handle background sync
async function syncData() {
  try {
    // Open IndexedDB connection
    const db = await openDB()
    
    // Get pending sync items
    const syncItems = await getSyncQueue(db)
    
    if (syncItems.length === 0) {
      console.log('🔄 No items to sync')
      return
    }
    
    console.log(`🔄 Background sync: ${syncItems.length} items`)
    
    // Process each sync item
    for (const item of syncItems) {
      try {
        await processSyncItem(item)
        await removeSyncItem(db, item.id)
      } catch (error) {
        console.error('Sync item failed:', error)
        await incrementRetryCount(db, item.id)
      }
    }
    
    // Notify main thread
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          processed: syncItems.length
        })
      })
    })
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Open IndexedDB connection
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SheSocialOfflineDB', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Get sync queue items
async function getSyncQueue(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly')
    const store = transaction.objectStore('syncQueue')
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

// Process individual sync item
async function processSyncItem(item) {
  const apiUrl = `${self.location.origin}/api/${item.collection}`
  let url = apiUrl
  let method = 'POST'
  
  switch (item.operation) {
    case 'insert':
      method = 'POST'
      break
    case 'update':
      method = 'PUT'
      url = `${apiUrl}/${item.data._id}`
      break
    case 'delete':
      method = 'DELETE'
      url = `${apiUrl}/${item.data._id}`
      break
  }
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: item.operation !== 'delete' ? JSON.stringify(item.data) : undefined
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

// Remove sync item after successful processing
async function removeSyncItem(db, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    const request = store.delete(itemId)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Increment retry count for failed items
async function incrementRetryCount(db, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite')
    const store = transaction.objectStore('syncQueue')
    const getRequest = store.get(itemId)
    
    getRequest.onsuccess = () => {
      const item = getRequest.result
      if (item) {
        item.retries = (item.retries || 0) + 1
        item.lastError = new Date().toISOString()
        
        // Remove items with too many retries
        if (item.retries >= 5) {
          store.delete(itemId)
        } else {
          store.put(item)
        }
      }
      resolve()
    }
    
    getRequest.onerror = () => reject(getRequest.error)
  })
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || '您有新的活動通知',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || '1'
      },
      actions: [
        {
          action: 'view',
          title: '查看',
          icon: '/pwa-192x192.png'
        },
        {
          action: 'close',
          title: '關閉'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SheSocial', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    )
  }
})

// Handle app install prompt
self.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  
  // Send to main thread for custom install UI
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'INSTALL_PROMPT_READY',
        event: event
      })
    })
  })
})

// Handle installation
self.addEventListener('appinstalled', (event) => {
  console.log('✅ SheSocial PWA installed successfully')
  
  // Track installation
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'APP_INSTALLED'
      })
    })
  })
})

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'BACKGROUND_SYNC') {
    // Trigger immediate sync
    syncData()
  }
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all clients
      self.clients.claim(),
      
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('shesocial-') && 
                cacheName !== 'shesocial-v1') {
              return caches.delete(cacheName)
            }
          })
        )
      })
    ])
  )
})

console.log('🚀 SheSocial Service Worker activated')