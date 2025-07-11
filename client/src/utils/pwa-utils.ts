// PWA utilities for SheSocial
// Handles Service Worker registration and PWA installation

import { useState, useEffect } from 'react'

export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null
  private _isInstalled = false
  private _isInstallable = false

  constructor() {
    this.init()
  }

  private async init(): Promise<void> {
    // TEMPORARILY DISABLE Service Worker during development
    console.log('⚠️ Service Worker registration disabled for development')
    return
    
    // Register Service Worker with improved caching strategy
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('✅ Service Worker registered:', registration.scope)
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found')
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                console.log('✅ Service Worker updated')
                this.notifyUpdate()
              }
            })
          }
        })
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
      }
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e as any
      this._isInstallable = true
      console.log('📱 PWA installation available')
      
      // Dispatch custom event for UI
      window.dispatchEvent(new CustomEvent('pwa-installable'))
    })

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this._isInstalled = true
      this._isInstallable = false
      this.deferredPrompt = null
      console.log('✅ PWA installed successfully')
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed'))
    })

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this._isInstalled = true
      console.log('📱 Running as PWA')
    }
  }

  // Show install prompt
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('No install prompt available')
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const choice = await this.deferredPrompt.userChoice
      
      if (choice.outcome === 'accepted') {
        console.log('✅ User accepted PWA installation')
        return true
      } else {
        console.log('❌ User dismissed PWA installation')
        return false
      }
    } catch (error) {
      console.error('PWA installation error:', error)
      return false
    } finally {
      this.deferredPrompt = null
      this._isInstallable = false
    }
  }

  // Check if PWA is installable
  isInstallable(): boolean {
    return this._isInstallable
  }

  // Check if PWA is installed
  isInstalled(): boolean {
    return this._isInstalled
  }

  // Notify about Service Worker updates
  private notifyUpdate(): void {
    // Show update notification
    if (Notification.permission === 'granted') {
      new Notification('SheSocial 更新可用', {
        body: '點擊重新載入以使用最新版本',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png'
      })
    }
    
    // Dispatch custom event for UI
    window.dispatchEvent(new CustomEvent('pwa-update-available'))
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  // Show notification
  showNotification(title: string, options: NotificationOptions = {}): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      })
    }
  }

  // Get device info
  getDeviceInfo(): {
    isStandalone: boolean
    isIOS: boolean
    isAndroid: boolean
    isMobile: boolean
    canInstall: boolean
  } {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    
    return {
      isStandalone,
      isIOS,
      isAndroid,
      isMobile,
      canInstall: this._isInstallable
    }
  }

  // Force Service Worker update
  async updateServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        console.log('🔄 Service Worker update triggered')
      }
    }
  }
}

// Singleton instance
export const pwaManager = new PWAManager()

// React Hook for PWA functionality
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(pwaManager.isInstallable())
  const [isInstalled, setIsInstalled] = useState(pwaManager.isInstalled())
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const handleInstallable = () => setIsInstallable(true)
    const handleInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
    }
    const handleUpdateAvailable = () => setUpdateAvailable(true)

    window.addEventListener('pwa-installable', handleInstallable)
    window.addEventListener('pwa-installed', handleInstalled)
    window.addEventListener('pwa-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable)
      window.removeEventListener('pwa-installed', handleInstalled)
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  const install = async () => {
    const success = await pwaManager.showInstallPrompt()
    if (success) {
      setIsInstallable(false)
    }
    return success
  }

  const requestNotifications = () => {
    return pwaManager.requestNotificationPermission()
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    pwaManager.showNotification(title, options)
  }

  const updateApp = async () => {
    await pwaManager.updateServiceWorker()
    window.location.reload()
  }

  return {
    isInstallable,
    isInstalled,
    updateAvailable,
    install,
    requestNotifications,
    showNotification,
    updateApp,
    deviceInfo: pwaManager.getDeviceInfo()
  }
}

