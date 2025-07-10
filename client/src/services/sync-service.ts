// SheSocial Sync Service
// Handles bidirectional sync between IndexedDB (client) and NeDB (server)

import { offlineDB } from '../db/offline-db'
import { useAuthStore } from '../store/authStore'
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

    // Check authentication status
    const authStore = useAuthStore.getState()
    if (!authStore.isAuthenticated) {
      console.log('⚠️ Skipping sync - user not authenticated')
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
      
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🔑 Authentication error - attempting token refresh')
        await authStore.refreshToken()
        return false
      }
      
      return false
    } finally {
      this.syncInProgress = false
    }
  }

  // Push local changes to server with improved queue management
  private async pushLocalChanges(): Promise<void> {
    // Get pending items with exponential backoff for retries
    const pendingItems = await this.getPendingItemsWithBackoff()

    if (pendingItems.length === 0) {
      console.log('📤 No local changes to push')
      return
    }

    console.log(`📤 Pushing ${pendingItems.length} local changes...`)

    // Process high priority items first
    const sortedItems = pendingItems.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    for (const item of sortedItems) {
      try {
        await this.pushSingleItem(item)
        
        // Remove from sync queue on success
        await offlineDB.syncQueue.delete(item.id!)
        console.log(`✅ Successfully synced ${item.operation} on ${item.collection}`)
        
      } catch (error) {
        await this.handleSyncError(item, error)
      }
    }
  }

  // Get pending items with exponential backoff logic
  private async getPendingItemsWithBackoff(): Promise<SyncQueueItem[]> {
    const now = Date.now()
    const allPendingItems = await offlineDB.syncQueue
      .orderBy('timestamp')
      .toArray()

    // Filter items based on exponential backoff
    return allPendingItems.filter(item => {
      if (item.retries === 0) return true // First attempt
      
      // Exponential backoff: 2^retries minutes (max 30 minutes)
      const backoffMinutes = Math.min(Math.pow(2, item.retries), 30)
      const backoffMs = backoffMinutes * 60 * 1000
      const lastAttempt = item.timestamp
      
      return (now - lastAttempt) >= backoffMs
    }).slice(0, 20) // Process max 20 items per sync
  }

  // Handle sync errors with intelligent retry logic
  private async handleSyncError(item: SyncQueueItem, error: any): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Failed to push item ${item.id}:`, errorMessage)

    // Determine if error is retryable
    const isRetryable = this.isRetryableError(error)
    const newRetryCount = item.retries + 1

    if (!isRetryable || newRetryCount >= this.getMaxRetries(item.priority)) {
      console.warn(`Removing item ${item.id} - ${isRetryable ? 'max retries exceeded' : 'non-retryable error'}`)
      await offlineDB.syncQueue.delete(item.id!)
      
      // Store failed item for manual review if it's important
      if (item.priority === 'high') {
        await this.storeFinalFailedItem(item, errorMessage)
      }
      return
    }

    // Update retry count and error info
    await offlineDB.syncQueue.update(item.id!, {
      retries: newRetryCount,
      lastError: errorMessage,
      timestamp: Date.now() // Update timestamp for backoff calculation
    })
  }

  // Determine if an error is retryable
  private isRetryableError(error: any): boolean {
    if (!(error instanceof Error)) return true
    
    const message = error.message.toLowerCase()
    
    // Non-retryable errors
    if (message.includes('400') || // Bad request
        message.includes('401') || // Unauthorized (will be handled by auth refresh)
        message.includes('403') || // Forbidden
        message.includes('404') || // Not found
        message.includes('422')) { // Unprocessable entity
      return false
    }
    
    // Retryable errors (network issues, server errors, etc.)
    return true
  }

  // Get maximum retries based on priority
  private getMaxRetries(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 10
      case 'medium': return 5
      case 'low': return 3
    }
  }

  // Store permanently failed items for manual review
  private async storeFinalFailedItem(item: SyncQueueItem, error: string): Promise<void> {
    const failedItem = {
      ...item,
      finalError: error,
      finalFailedAt: new Date(),
      requiresManualReview: true
    }
    
    // Store in a separate failed items collection (implement if needed)
    console.error('High priority item failed permanently:', failedItem)
  }

  // Push single item to server
  private async pushSingleItem(item: SyncQueueItem): Promise<void> {
    const endpoint = `${this.API_BASE_URL}/${item.collection}`
    const authStore = useAuthStore.getState()
    
    // Build headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    let response: Response
    
    switch (item.operation) {
      case 'insert':
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(item.data)
        })
        break
        
      case 'update':
        response = await fetch(`${endpoint}/${item.data._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(item.data)
        })
        break
        
      case 'delete':
        response = await fetch(`${endpoint}/${item.data._id}`, {
          method: 'DELETE',
          headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {}
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
    const authStore = useAuthStore.getState()
    
    // Skip sync if user doesn't have permissions for certain collections
    const allowedCollections = collections.filter(collection => {
      switch (collection) {
        case 'users':
          return authStore.hasPermission('viewParticipants')
        case 'events':
          return true // Events are visible to all authenticated users
        case 'bookings':
          return true // Users can see their own bookings
        default:
          return false
      }
    })
    
    for (const collection of allowedCollections) {
      try {
        await this.pullCollectionChanges(collection)
      } catch (error) {
        console.error(`Failed to pull ${collection} changes:`, error)
        
        // Handle specific errors for different collections
        if (error instanceof Error && error.message.includes('403')) {
          console.warn(`Access denied for ${collection} - user may not have required permissions`)
        }
      }
    }
  }

  // Pull changes for specific collection
  private async pullCollectionChanges(collection: string): Promise<void> {
    const lastSync = localStorage.getItem(`lastSync_${collection}`) || '0'
    const authStore = useAuthStore.getState()
    
    const headers: Record<string, string> = {}
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    const response = await fetch(
      `${this.API_BASE_URL}/${collection}/sync/${lastSync}`,
      { headers }
    )
    
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

  // Advanced data merge strategy with field-level merging
  private mergeData(localData: any, serverData: any): any {
    const localTime = new Date(localData.updatedAt).getTime()
    const serverTime = new Date(serverData.updatedAt).getTime()
    
    // If times are significantly different, use newer version
    if (Math.abs(localTime - serverTime) > 60000) { // 1 minute threshold
      return localTime > serverTime ? localData : serverData
    }
    
    // Field-level merge for simultaneous edits
    const merged = { ...serverData }
    
    // Merge profile fields for users
    if (localData.profile && serverData.profile) {
      merged.profile = {
        ...serverData.profile,
        ...localData.profile
      }
      
      // Merge arrays (interests, videos) without duplicates
      if (localData.profile.interests && serverData.profile.interests) {
        merged.profile.interests = [...new Set([
          ...serverData.profile.interests,
          ...localData.profile.interests
        ])]
      }
      
      if (localData.profile.videos && serverData.profile.videos) {
        merged.profile.videos = this.mergeVideoArrays(
          serverData.profile.videos,
          localData.profile.videos
        )
      }
    }
    
    // Merge participants for events
    if (localData.participants && serverData.participants) {
      merged.participants = this.mergeParticipants(
        serverData.participants,
        localData.participants
      )
    }
    
    // Use latest timestamp and set merge flag
    merged.updatedAt = new Date(Math.max(localTime, serverTime))
    merged.mergedAt = new Date()
    
    return merged
  }
  
  // Merge video arrays by type, keeping newest for each type
  private mergeVideoArrays(serverVideos: any[], localVideos: any[]): any[] {
    const videoMap = new Map()
    
    // Add server videos first
    serverVideos.forEach(video => {
      videoMap.set(video.type, video)
    })
    
    // Override with local videos if newer
    localVideos.forEach(localVideo => {
      const serverVideo = videoMap.get(localVideo.type)
      if (!serverVideo || new Date(localVideo.uploadedAt) > new Date(serverVideo.uploadedAt)) {
        videoMap.set(localVideo.type, localVideo)
      }
    })
    
    return Array.from(videoMap.values())
  }
  
  // Merge participant arrays, avoiding duplicates
  private mergeParticipants(serverParticipants: any[], localParticipants: any[]): any[] {
    const participantMap = new Map()
    
    // Add server participants first
    serverParticipants.forEach(participant => {
      participantMap.set(participant.userId, participant)
    })
    
    // Add or update with local participants
    localParticipants.forEach(localParticipant => {
      const existing = participantMap.get(localParticipant.userId)
      if (!existing || new Date(localParticipant.joinedAt) > new Date(existing.joinedAt)) {
        participantMap.set(localParticipant.userId, localParticipant)
      }
    })
    
    return Array.from(participantMap.values())
  }

  // Queue item for sync
  private async queueForSync(
    collection: string, 
    operation: 'insert' | 'update' | 'delete', 
    data: any, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    await offlineDB.queueSync(collection as any, operation, data, priority)
    
    // Trigger background sync for this priority
    await this.triggerBackgroundSync(priority)
    
    // If high priority and online, attempt immediate sync
    if (priority === 'high' && navigator.onLine && !this.syncInProgress) {
      this.syncToServer()
    }
  }

  // Public methods for manual sync control
  async forceSyncNow(): Promise<boolean> {
    return await this.syncToServer()
  }

  // Sync specific collection only
  async syncSpecificCollection(collection: 'users' | 'events' | 'bookings'): Promise<boolean> {
    if (this.syncInProgress || !navigator.onLine) {
      return false
    }

    const authStore = useAuthStore.getState()
    if (!authStore.isAuthenticated) {
      console.log('⚠️ Skipping collection sync - user not authenticated')
      return false
    }

    this.syncInProgress = true
    console.log(`🔄 Starting sync for ${collection} collection...`)

    try {
      // Push local changes for this collection
      const pendingItems = await offlineDB.syncQueue
        .where('collection')
        .equals(collection)
        .toArray()

      for (const item of pendingItems) {
        try {
          await this.pushSingleItem(item)
          await offlineDB.syncQueue.delete(item.id!)
        } catch (error) {
          await this.handleSyncError(item, error)
        }
      }

      // Pull server changes for this collection
      await this.pullCollectionChanges(collection)

      console.log(`✅ ${collection} sync completed successfully`)
      return true
    } catch (error) {
      console.error(`❌ ${collection} sync failed:`, error)
      return false
    } finally {
      this.syncInProgress = false
    }
  }

  // Register background sync with Service Worker
  async registerBackgroundSync(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background Sync not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      // Register sync events for different priorities
      await registration.sync.register('sync-high-priority')
      await registration.sync.register('sync-medium-priority') 
      await registration.sync.register('sync-low-priority')
      
      console.log('✅ Background sync events registered')
    } catch (error) {
      console.error('Failed to register background sync:', error)
    }
  }

  // Trigger background sync when adding items to queue
  private async triggerBackgroundSync(priority: 'high' | 'medium' | 'low'): Promise<void> {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      if ('sync' in registration) {
        await registration.sync.register(`sync-${priority}-priority`)
      }
    } catch (error) {
      console.error('Failed to trigger background sync:', error)
    }
  }

  async getSyncStatus(): Promise<{
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
  }> {
    const pendingItems = await offlineDB.syncQueue.toArray()
    const recentErrors = pendingItems.filter(
      item => item.retries > 0 && item.timestamp > Date.now() - 3600000 // Last hour
    ).length

    const priorityCounts = pendingItems.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const oldestPending = pendingItems.length > 0 
      ? new Date(Math.min(...pendingItems.map(item => item.timestamp)))
      : undefined

    const lastErrorTime = pendingItems
      .filter(item => item.lastError)
      .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp

    return {
      inProgress: this.syncInProgress,
      isOnline: navigator.onLine,
      networkQuality: await this.detectNetworkQuality(),
      lastSync: {
        users: localStorage.getItem('lastSync_users') || 'never',
        events: localStorage.getItem('lastSync_events') || 'never',
        bookings: localStorage.getItem('lastSync_bookings') || 'never'
      },
      pendingItems: {
        total: pendingItems.length,
        byPriority: priorityCounts,
        oldestPending
      },
      errors: {
        recentErrors,
        lastErrorTime: lastErrorTime ? new Date(lastErrorTime) : undefined
      }
    }
  }

  // Enhanced network quality detection
  private async detectNetworkQuality(): Promise<'good' | 'slow' | 'offline'> {
    if (!navigator.onLine) return 'offline'

    try {
      // Check connection speed with a small request
      const startTime = Date.now()
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'HEAD',
        cache: 'no-cache'
      })
      const endTime = Date.now()
      
      if (!response.ok) return 'offline'
      
      const latency = endTime - startTime
      return latency < 1000 ? 'good' : 'slow'
    } catch {
      return 'offline'
    }
  }

  async getPendingSyncCount(): Promise<number> {
    return await offlineDB.syncQueue.count()
  }

  // Get detailed sync statistics
  async getSyncStatistics(): Promise<{
    totalSynced: number
    lastSyncTime: Date | null
    avgSyncTime: number
    errorRate: number
    collectionStats: Record<string, {
      lastSync: Date | null
      pendingCount: number
    }>
  }> {
    const totalSynced = parseInt(localStorage.getItem('totalSyncedItems') || '0')
    const pendingItems = await offlineDB.syncQueue.toArray()
    
    const collectionStats: Record<string, any> = {}
    const collections = ['users', 'events', 'bookings']
    
    for (const collection of collections) {
      const lastSyncStr = localStorage.getItem(`lastSync_${collection}`)
      const pendingCount = pendingItems.filter(item => item.collection === collection).length
      
      collectionStats[collection] = {
        lastSync: lastSyncStr && lastSyncStr !== 'never' ? new Date(parseInt(lastSyncStr)) : null,
        pendingCount
      }
    }

    const errorCount = pendingItems.filter(item => item.retries > 0).length
    const errorRate = totalSynced > 0 ? errorCount / totalSynced : 0

    return {
      totalSynced,
      lastSyncTime: this.getLastOverallSyncTime(),
      avgSyncTime: parseInt(localStorage.getItem('avgSyncTime') || '0'),
      errorRate,
      collectionStats
    }
  }

  private getLastOverallSyncTime(): Date | null {
    const collections = ['users', 'events', 'bookings']
    const times = collections
      .map(c => localStorage.getItem(`lastSync_${c}`))
      .filter(t => t && t !== 'never')
      .map(t => parseInt(t!))
    
    return times.length > 0 ? new Date(Math.max(...times)) : null
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

// Initialize sync service with enhanced background sync integration
export const initializeSyncService = (): void => {
  console.log('🔄 Sync service initialized')
  
  // Register service worker message handler for background sync
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { data } = event
      
      switch (data?.type) {
        case 'BACKGROUND_SYNC':
          console.log('📱 Background sync triggered by Service Worker')
          syncService.syncToServer()
          break
          
        case 'NETWORK_CHANGED':
          console.log(`🌐 Network status changed: ${data.isOnline ? 'online' : 'offline'}`)
          if (data.isOnline) {
            syncService.syncToServer()
          }
          break
          
        case 'SYNC_REQUEST':
          console.log(`🔄 Manual sync requested: ${data.collection || 'all'}`)
          if (data.collection) {
            syncService.syncSpecificCollection(data.collection)
          } else {
            syncService.syncToServer()
          }
          break
      }
    })

    // Register for background sync if supported
    navigator.serviceWorker.ready.then(registration => {
      if ('sync' in registration) {
        console.log('✅ Background Sync API supported')
        syncService.registerBackgroundSync()
      } else {
        console.warn('⚠️ Background Sync API not supported - using periodic sync only')
      }
    })
  }

  // Listen for authentication changes to trigger sync
  const authStore = useAuthStore.getState()
  authStore.subscribe((state) => {
    if (state.isAuthenticated && navigator.onLine) {
      console.log('🔑 User authenticated - triggering sync')
      syncService.syncToServer()
    }
  })
}
