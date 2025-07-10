// Hook for managing sync status
import { useState, useEffect } from 'react'
import { syncService } from '../services/sync-service'

interface SyncStatus {
  inProgress: boolean
  isOnline: boolean
  networkQuality: 'good' | 'slow' | 'offline'
  lastSync: Record<string, string>
  pendingItems: {
    total: number
    byPriority: Record<string, number>
    oldestPending?: Date
  }
  errors: {
    recentErrors: number
    lastErrorTime?: Date
  }
}

export const useSyncStatus = (refreshInterval: number = 5000) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const status = await syncService.getSyncStatus()
        setSyncStatus(status)
      } catch (error) {
        console.error('Failed to get sync status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const forceSyncNow = async () => {
    return await syncService.forceSyncNow()
  }

  const syncCollection = async (collection: 'users' | 'events' | 'bookings') => {
    return await syncService.syncSpecificCollection(collection)
  }

  return {
    syncStatus,
    isLoading,
    forceSyncNow,
    syncCollection,
    // Computed values for easy access
    hasErrors: syncStatus?.errors.recentErrors ? syncStatus.errors.recentErrors > 0 : false,
    hasPendingItems: syncStatus?.pendingItems.total ? syncStatus.pendingItems.total > 0 : false,
    isOffline: syncStatus ? !syncStatus.isOnline : false,
    isSyncing: syncStatus?.inProgress || false
  }
}