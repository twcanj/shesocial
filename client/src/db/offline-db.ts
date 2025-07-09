// SheSocial Offline Database
// IndexedDB implementation with Dexie.js matching NeDB structure

import Dexie from 'dexie'
import type { 
  UserProfile, 
  EventData, 
  BookingData, 
  SyncQueueItem,
  CollectionName,
  DocumentType
} from '../types/database'

export class SheSocialOfflineDB extends Dexie {
  // Tables matching NeDB collections
  users!: Dexie.Table<UserProfile>
  events!: Dexie.Table<EventData>
  bookings!: Dexie.Table<BookingData>
  syncQueue!: Dexie.Table<SyncQueueItem>

  constructor() {
    super('SheSocialOfflineDB')
    
    this.version(1).stores({
      // Index definitions for fast queries
      users: '_id, email, profile.name, profile.location, membership.type, lastSync',
      events: '_id, name, metadata.date, metadata.location, metadata.type, status, lastSync',
      bookings: '_id, userId, eventId, status, paymentStatus, lastSync',
      syncQueue: '++id, collection, operation, timestamp, priority, retries'
    })

    // Hooks for automatic timestamps
    this.users.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
      obj.lastSync = null
    })

    this.users.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
      modifications.lastSync = null
    })

    this.events.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
      obj.lastSync = null
    })

    this.events.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
      modifications.lastSync = null
    })

    this.bookings.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
      obj.lastSync = null
    })

    this.bookings.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
      modifications.lastSync = null
    })
  }

  // Generate NeDB-compatible IDs
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Offline-first CRUD operations
  async createUser(userData: Omit<UserProfile, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const user: UserProfile = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSync: null
    }
    
    await this.users.add(user)
    await this.queueSync('users', 'insert', user)
    return user
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    await this.users.update(userId, {
      ...updates,
      updatedAt: new Date(),
      lastSync: null
    })
    
    const updatedUser = await this.users.get(userId)
    if (updatedUser) {
      await this.queueSync('users', 'update', updatedUser)
    }
  }

  async createEvent(eventData: Omit<EventData, '_id' | 'createdAt' | 'updatedAt'>): Promise<EventData> {
    const event: EventData = {
      _id: this.generateId(),
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSync: null
    }
    
    await this.events.add(event)
    await this.queueSync('events', 'insert', event)
    return event
  }

  async createBooking(bookingData: Omit<BookingData, '_id' | 'createdAt' | 'updatedAt'>): Promise<BookingData> {
    const booking: BookingData = {
      _id: this.generateId(),
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSync: null
    }
    
    await this.bookings.add(booking)
    await this.queueSync('bookings', 'insert', booking)
    return booking
  }

  // Sync queue management
  async queueSync<T extends CollectionName>(
    collection: T, 
    operation: 'insert' | 'update' | 'delete', 
    data: DocumentType<T>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    await this.syncQueue.add({
      collection,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0,
      priority
    })

    // Trigger background sync if online
    this.triggerBackgroundSync()
  }

  // Background sync trigger
  private triggerBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('sync-shesocial-data')
      }).catch(err => {
        console.warn('Background sync registration failed:', err)
        // Fallback to immediate sync
        this.syncNow()
      })
    } else {
      // Fallback for browsers without background sync
      this.syncNow()
    }
  }

  // Immediate sync (fallback)
  private async syncNow(): Promise<void> {
    if (!navigator.onLine) return

    try {
      const pendingItems = await this.syncQueue
        .orderBy('priority')
        .reverse()
        .limit(10)
        .toArray()

      // Process sync items (will be implemented in sync service)
      console.log('Processing sync queue:', pendingItems.length, 'items')
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  // Query helpers for business logic
  async getUsersByMembership(membershipType: UserProfile['membership']['type']): Promise<UserProfile[]> {
    return await this.users
      .where('membership.type')
      .equals(membershipType)
      .toArray()
  }

  async getUpcomingEvents(limit: number = 10): Promise<EventData[]> {
    const now = new Date()
    return await this.events
      .where('metadata.date')
      .above(now)
      .and(event => event.status === 'published')
      .limit(limit)
      .toArray()
  }

  async getUserBookings(userId: string): Promise<BookingData[]> {
    return await this.bookings
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('createdAt')
  }

  async getEventParticipants(eventId: string): Promise<BookingData[]> {
    return await this.bookings
      .where('eventId')
      .equals(eventId)
      .and(booking => booking.status === 'confirmed')
      .toArray()
  }

  // Search functionality
  async searchEvents(query: string): Promise<EventData[]> {
    const lowerQuery = query.toLowerCase()
    return await this.events
      .filter(event => 
        event.name.toLowerCase().includes(lowerQuery) ||
        event.metadata.location.toLowerCase().includes(lowerQuery) ||
        event.metadata.category.toLowerCase().includes(lowerQuery)
      )
      .and(event => event.status === 'published')
      .toArray()
  }

  async searchUsers(query: string, currentUserId: string): Promise<UserProfile[]> {
    // Only premium_2500 members can search users
    const currentUser = await this.users.get(currentUserId)
    if (!currentUser || currentUser.membership.type !== 'premium_2500') {
      throw new Error('Insufficient permissions to search users')
    }

    const lowerQuery = query.toLowerCase()
    return await this.users
      .filter(user => 
        user.profile.name.toLowerCase().includes(lowerQuery) ||
        user.profile.location.toLowerCase().includes(lowerQuery) ||
        user.profile.interests.some(interest => 
          interest.toLowerCase().includes(lowerQuery)
        )
      )
      .toArray()
  }

  // Data cleanup and maintenance
  async clearSyncedItems(): Promise<void> {
    // Remove successfully synced items older than 7 days
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    await this.syncQueue
      .where('timestamp')
      .below(weekAgo)
      .and(item => item.retries === 0)
      .delete()
  }

  async getStorageStats(): Promise<{
    users: number
    events: number
    bookings: number
    syncQueue: number
    totalSize: string
  }> {
    const [userCount, eventCount, bookingCount, queueCount] = await Promise.all([
      this.users.count(),
      this.events.count(),
      this.bookings.count(),
      this.syncQueue.count()
    ])

    // Estimate storage size (rough calculation)
    const estimatedSize = (userCount * 2 + eventCount * 1 + bookingCount * 0.5) * 1024 // KB
    const sizeStr = estimatedSize > 1024 
      ? `${(estimatedSize / 1024).toFixed(1)} MB`
      : `${estimatedSize.toFixed(0)} KB`

    return {
      users: userCount,
      events: eventCount,
      bookings: bookingCount,
      syncQueue: queueCount,
      totalSize: sizeStr
    }
  }
}

// Singleton instance
export const offlineDB = new SheSocialOfflineDB()

// Initialize database
export const initializeOfflineDB = async (): Promise<void> => {
  try {
    await offlineDB.open()
    console.log('✅ SheSocial Offline Database initialized')
    
    // Clean up old sync items
    await offlineDB.clearSyncedItems()
    
    // Log storage stats
    const stats = await offlineDB.getStorageStats()
    console.log('📊 Database stats:', stats)
  } catch (error) {
    console.error('❌ Failed to initialize offline database:', error)
    throw error
  }
}
