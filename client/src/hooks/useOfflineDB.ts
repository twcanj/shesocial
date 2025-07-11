// React Hook for SheSocial Offline Database Operations

import { useState, useEffect, useCallback } from 'react'
import { offlineDB } from '../db/offline-db'
// TEMPORARILY DISABLED: import { syncService } from '../services/sync-service'
import type { UserProfile, EventData, BookingData } from '../shared-types'

// Generic hook for database operations
export const useOfflineDB = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  // TEMPORARILY DISABLED: const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus())
  const [syncStatus, setSyncStatus] = useState({
    inProgress: false,
    isOnline: navigator.onLine,
    networkQuality: 'good' as const,
    lastSync: {},
    pendingItems: { total: 0, byPriority: {} },
    errors: { count: 0, recent: [] }
  })

  useEffect(() => {
    const initDB = async () => {
      try {
        await offlineDB.open()
        setIsInitialized(true)
        console.log('✅ Database hook initialized')
      } catch (error) {
        console.error('❌ Database initialization failed:', error)
      }
    }

    initDB()

    // TEMPORARILY DISABLED: Update sync status periodically
    // const statusInterval = setInterval(() => {
    //   setSyncStatus(syncService.getSyncStatus())
    // }, 5000)

    // return () => clearInterval(statusInterval)
  }, [])

  const forcSync = useCallback(async () => {
    // TEMPORARILY DISABLED: return await syncService.forceSyncNow()
    console.log('Force sync temporarily disabled')
    return true
  }, [])

  return {
    isInitialized,
    syncStatus,
    forcSync,
    db: offlineDB,
    // Add missing event operations for compatibility
    events: {
      getAll: async () => await offlineDB.events.toArray(),
      get: async (id: string) => await offlineDB.events.get(id),
      add: async (event: any) => await offlineDB.events.add(event),
      update: async (id: string, changes: any) => await offlineDB.events.update(id, changes),
      delete: async (id: string) => await offlineDB.events.delete(id)
    },
    addEvent: async (event: any) => {
      return await offlineDB.events.add(event)
    },
    updateEvent: async (id: string, changes: any) => {
      return await offlineDB.events.update(id, changes)
    },
    deleteEvent: async (id: string) => {
      return await offlineDB.events.delete(id)
    }
  }
}

// Hook for user operations
export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async (membershipType?: UserProfile['membership']['type']) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = membershipType 
        ? await offlineDB.getUsersByMembership(membershipType)
        : await offlineDB.users.toArray()
      
      setUsers(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = useCallback(async (userData: Omit<UserProfile, '_id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const newUser = await offlineDB.createUser(userData)
      setUsers(prev => [...prev, newUser])
      return newUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    setLoading(true)
    setError(null)
    
    try {
      await offlineDB.updateUser(userId, updates)
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, ...updates } : user
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchUsers = useCallback(async (query: string, currentUserId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const results = await offlineDB.searchUsers(query, currentUserId)
      return results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    searchUsers
  }
}

// Hook for event operations
export const useEvents = () => {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUpcomingEvents = useCallback(async (limit: number = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await offlineDB.getUpcomingEvents(limit)
      setEvents(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = useCallback(async (eventData: Omit<EventData, '_id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const newEvent = await offlineDB.createEvent(eventData)
      setEvents(prev => [...prev, newEvent])
      return newEvent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchEvents = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const results = await offlineDB.searchEvents(query)
      return results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search events')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getEventParticipants = useCallback(async (eventId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const participants = await offlineDB.getEventParticipants(eventId)
      return participants
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load participants')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    events,
    loading,
    error,
    loadUpcomingEvents,
    createEvent,
    searchEvents,
    getEventParticipants
  }
}

// Hook for booking operations
export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUserBookings = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await offlineDB.getUserBookings(userId)
      setBookings(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  const createBooking = useCallback(async (bookingData: Omit<BookingData, '_id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const newBooking = await offlineDB.createBooking(bookingData)
      setBookings(prev => [...prev, newBooking])
      return newBooking
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateBookingStatus = useCallback(async (
    bookingId: string, 
    status: BookingData['status'],
    paymentStatus?: BookingData['paymentStatus']
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const updates: Partial<BookingData> = { status }
      if (paymentStatus) updates.paymentStatus = paymentStatus

      await offlineDB.bookings.update(bookingId, updates)
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId ? { ...booking, ...updates } : booking
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    bookings,
    loading,
    error,
    loadUserBookings,
    createBooking,
    updateBookingStatus
  }
}

// Hook for network status and sync
export const useNetworkSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // TEMPORARILY DISABLED: Update pending sync count periodically
    const updateSyncCount = async () => {
      // const count = await syncService.getPendingSyncCount()
      // setPendingSyncCount(count)
      setPendingSyncCount(0)
    }

    const syncInterval = setInterval(updateSyncCount, 10000)
    updateSyncCount() // Initial load

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(syncInterval)
    }
  }, [])

  const manualSync = useCallback(async () => {
    // TEMPORARILY DISABLED: const success = await syncService.forceSyncNow()
    console.log('Manual sync temporarily disabled')
    setLastSyncTime(new Date())
    setPendingSyncCount(0)
    return true
  }, [])

  return {
    isOnline,
    pendingSyncCount,
    lastSyncTime,
    manualSync
  }
}

// Hook for database statistics
export const useDBStats = () => {
  const [stats, setStats] = useState<{
    users: number
    events: number
    bookings: number
    syncQueue: number
    totalSize: string
  } | null>(null)

  const refreshStats = useCallback(async () => {
    try {
      const dbStats = await offlineDB.getStorageStats()
      setStats(dbStats)
    } catch (error) {
      console.error('Failed to get database stats:', error)
    }
  }, [])

  useEffect(() => {
    refreshStats()
    
    // Refresh stats every minute
    const interval = setInterval(refreshStats, 60000)
    return () => clearInterval(interval)
  }, [refreshStats])

  return {
    stats,
    refreshStats
  }
}
