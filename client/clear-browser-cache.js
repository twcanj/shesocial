// Clear Browser Cache and Service Workers Script
// Run this in the browser console to completely clear all caches

(async function clearAllCaches() {
  console.log('🧹 Starting complete cache cleanup...')
  
  // 1. Unregister all service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    console.log(`Found ${registrations.length} service worker registrations`)
    
    for (const registration of registrations) {
      await registration.unregister()
      console.log('✅ Unregistered service worker:', registration.scope)
    }
  }
  
  // 2. Clear all caches
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    console.log(`Found ${cacheNames.length} cache entries`)
    
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName)
      console.log('✅ Deleted cache:', cacheName)
    }
  }
  
  // 3. Clear localStorage
  localStorage.clear()
  console.log('✅ Cleared localStorage')
  
  // 4. Clear sessionStorage
  sessionStorage.clear()
  console.log('✅ Cleared sessionStorage')
  
  // 5. Clear IndexedDB (SheSocial specific)
  try {
    const deleteDB = indexedDB.deleteDatabase('SheSocialOfflineDB')
    deleteDB.onsuccess = () => console.log('✅ Cleared IndexedDB: SheSocialOfflineDB')
    deleteDB.onerror = () => console.log('❌ Failed to clear IndexedDB')
  } catch (error) {
    console.log('❌ IndexedDB clear error:', error)
  }
  
  console.log('🎉 Cache cleanup complete! Please hard refresh the page (Ctrl+F5 or Cmd+Shift+R)')
  console.log('💡 Tip: Open DevTools → Application → Clear storage → Clear site data')
})()

// Manual steps for complete cleanup:
console.log(`
📋 Manual Cleanup Steps:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage" in the left sidebar
4. Check all boxes and click "Clear site data"
5. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
6. Or use "Disable cache" in Network tab while DevTools is open
`)