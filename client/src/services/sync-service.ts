// SheSocial Sync Service
// Handles bidirectional sync between IndexedDB (client) and NeDB (server)

import { offlineDB } from '../db/offline-db'
import type { SyncQueueItem, ApiResponse, SyncResponse, ConflictItem } from '../types/database'

export class SyncService {
  private syncInProgress = false
  private syncInterval: NodeJS.Timeout | null = null
  private readonly API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
    
    // Start periodic sync if online
    if (navigator.onLine) {
      this.startPeriodicSync()
    }
  }

  // Handle network status changes
  private handleOnline(): void {
    console.log('🌐 Network online - starting sync')
    this.startPeriodicSync()
    this.syncToServer() // Immediate sync when coming online
  }

  private handleOffline(): void {
    console.log('📴 Network offline - stopping sync')
    this.stopPeriodicSync()
  }

  // Periodic sync management
  private startPeriodicSync(): void {
    if (this.syncInterval) return
    
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncToServer()
      }
    }, 30000)
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Main sync function - called by Service Worker or periodic sync
  async syncToServer(): Promise<boolean> {
    if (this.syncInProgress || !navigator.onLine) {
      return false
    }

    this.syncInProgress = true
    console.log('🔄 Starting sync to server...')

    try {
      // Step 1: Push local changes to server
      await this.pushLocalChanges()
      
      // Step 2: Pull server changes to local
      await this.pullServerChanges()
      
      console.log('✅ Sync completed successfully')
      return true
    } catch (error) {
      console.error('❌ Sync failed:', error)
      return false
    } finally {
      this.syncInProgress = false
    }
  }

  // Push local changes to server
  private async pushLocalChanges(): Promise<void> {
    const pendingItems = await offlineDB.syncQueue
      .orderBy('priority')
      .reverse()
      .limit(50) // Process in batches
      .toArray()

    if (pendingItems.length === 0) {
      console.log('📤 No local changes to push')
      return
    }

    console.log(`📤 Pushing ${pendingItems.length} local changes...`)

    for (const item of pendingItems) {
      try {
        await this.pushSingleItem(item)
        
        // Remove from sync queue on success
        await offlineDB.syncQueue.delete(item.id!)
      } catch (error) {
        console.error(`Failed to push item ${item.id}:`, error)
        
        // Increment retry count
        await offlineDB.syncQueue.update(item.id!, {
          retries: item.retries + 1,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        })

        // Remove items with too many retries
        if (item.retries >= 5) {
          console.warn(`Removing item ${item.id} after 5 failed retries`)
          await offlineDB.syncQueue.delete(item.id!)
        }
      }
    }
  }

  // Push single item to server
  private async pushSingleItem(item: SyncQueueItem): Promise<void> {
    const endpoint = `${this.API_BASE_URL}/${item.collection}`
    
    let response: Response
    
    switch (item.operation) {
      case 'insert':
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })
        break
        
      case 'update':
        response = await fetch(`${endpoint}/${item.data._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })
        break
        
      case 'delete':
        response = await fetch(`${endpoint}/${item.data._id}`, {
          method: 'DELETE'
        })
        break
        
      default:
        throw new Error(`Unknown operation: ${item.operation}`)
    }

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
    }

    const result: ApiResponse<any> = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Server operation failed')
    }

    // Update local item with server response if needed
    if (result.data && item.operation !== 'delete') {
      await this.updateLocalItem(item.collection, result.data)
    }
  }

  // Pull server changes to local
  private async pullServerChanges(): Promise<void> {
    const collections = ['users', 'events', 'bookings'] as const
    
    for (const collection of collections) {
      try {
        await this.pullCollectionChanges(collection)
      } catch (error) {
        console.error(`Failed to pull ${collection} changes:`, error)
      }
    }
  }

  // Pull changes for specific collection
  private async pullCollectionChanges(collection: string): Promise<void> {
    const lastSync = localStorage.getItem(`lastSync_${collection}`) || '0'
    
    const response = await fetch(`${this.API_BASE_URL}/${collection}/changes?since=${lastSync}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${collection} changes: ${response.statusText}`)
    }

    const syncResponse: SyncResponse = await response.json()
    
    console.log(`📥 Received ${syncResponse.changes.length} ${collection} changes`)

    // Apply changes to local database
    for (const change of syncResponse.changes) {
      await this.applyServerChange(collection, change)
    }

    // Handle conflicts if any
    if (syncResponse.conflicts && syncResponse.conflicts.length > 0) {
      await this.resolveConflicts(syncResponse.conflicts)
    }

    // Update last sync timestamp
    localStorage.setItem(`lastSync_${collection}`, syncResponse.timestamp.toString())
  }

  // Apply server change to local database
  private async applyServerChange(collection: string, change: any): Promise<void> {
    const table = offlineDB[collection as keyof typeof offlineDB] as any
    
    if (!table) {
      console.warn(`Unknown collection: ${collection}`)
      return
    }

    try {
      // Check if item exists locally
      const existingItem = await table.get(change._id)
      
      if (existingItem) {
        // Update existing item
        await table.update(change._id, {
          ...change,
          lastSync: new Date()
        })
      } else {
        // Add new item
        await table.add({
          ...change,
          lastSync: new Date()
        })
      }
    } catch (error) {
      console.error(`Failed to apply change to ${collection}:`, error)
    }
  }

  // Update local item with server data
  private async updateLocalItem(collection: string, serverData: any): Promise<void> {
    const table = offlineDB[collection as keyof typeof offlineDB] as any
    
    if (table) {
      await table.update(serverData._id, {
        ...serverData,
        lastSync: new Date()
      })
    }
  }

  // Resolve sync conflicts
  private async resolveConflicts(conflicts: ConflictItem[]): Promise<void> {
    console.log(`🔧 Resolving ${conflicts.length} conflicts...`)
    
    for (const conflict of conflicts) {
      try {
        await this.resolveConflict(conflict)
      } catch (error) {
        console.error('Failed to resolve conflict:', error)
      }
    }
  }

  // Resolve individual conflict
  private async resolveConflict(conflict: ConflictItem): Promise<void> {
    const { collection, localData, serverData, resolution } = conflict
    const table = offlineDB[collection as keyof typeof offlineDB] as any
    
    switch (resolution) {
      case 'server_wins':
        // Server data overwrites local
        await table.update(serverData._id, {
          ...serverData,
          lastSync: new Date()
        })
        break
        
      case 'client_wins':
        // Keep local data, push to server
        await this.queueForSync(collection, 'update', localData, 'high')
        break
        
      case 'merge_required':
        // Manual merge logic (simplified)
        const mergedData = this.mergeData(localData, serverData)
        await table.update(mergedData._id, {
          ...mergedData,
          lastSync: new Date()
        })
        await this.queueForSync(collection, 'update', mergedData, 'high')
        break
    }
  }

  // Simple data merge strategy
  private mergeData(localData: any, serverData: any): any {
    // Use server data as base, overlay with newer local changes
    const localTime = new Date(localData.updatedAt).getTime()
    const serverTime = new Date(serverData.updatedAt).getTime()
    
    return localTime > serverTime ? localData : serverData
  }

  // Queue item for sync
  private async queueForSync(
    collection: string, 
    operation: 'insert' | 'update' | 'delete', 
    data: any, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    await offlineDB.queueSync(collection as any, operation, data, priority)
  }

  // Public methods for manual sync control
  async forceSyncNow(): Promise<boolean> {
    return await this.syncToServer()
  }

  getSyncStatus(): {
    inProgress: boolean
    isOnline: boolean
    lastSync: Record<string, string>
  } {
    return {
      inProgress: this.syncInProgress,
      isOnline: navigator.onLine,
      lastSync: {
        users: localStorage.getItem('lastSync_users') || 'never',
        events: localStorage.getItem('lastSync_events') || 'never',
        bookings: localStorage.getItem('lastSync_bookings') || 'never'
      }
    }
  }

  async getPendingSyncCount(): Promise<number> {
    return await offlineDB.syncQueue.count()
  }

  // Cleanup
  destroy(): void {
    this.stopPeriodicSync()
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }
}

// Singleton instance
export const syncService = new SyncService()

// Initialize sync service
export const initializeSyncService = (): void => {
  console.log('🔄 Sync service initialized')
  
  // Register service worker message handler for background sync
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC') {
        syncService.syncToServer()
      }
    })
  }
}
