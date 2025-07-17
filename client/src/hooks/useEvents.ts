// Events Hook for State Management and API Integration
import { useState, useEffect, useCallback, useRef } from 'react'
import type { EventData, BookingData } from '../shared-types'
import { useOfflineDB } from './useOfflineDB'
import { useAuthStore } from '../store/authStore'
import { API_CONFIG } from '../config/api'

interface UseEventsOptions {
  autoFetch?: boolean
  filters?: {
    status?: EventData['status']
    upcoming?: boolean
    userEvents?: boolean
  }
}

interface UseEventsReturn {
  events: EventData[]
  loading: boolean
  error: string | null
  refreshing: boolean
  
  // Event operations
  createEvent: (eventData: Omit<EventData, '_id' | 'createdAt' | 'updatedAt'>) => Promise<EventData | null>
  updateEvent: (eventId: string, updates: Partial<EventData>) => Promise<boolean>
  deleteEvent: (eventId: string) => Promise<boolean>
  getEventById: (eventId: string) => Promise<EventData | null>
  
  // Booking operations
  bookEvent: (eventId: string, bookingData?: Partial<BookingData>) => Promise<boolean>
  cancelBooking: (eventId: string) => Promise<boolean>
  
  // Participant management
    getEventParticipants: (eventId: string) => Promise<BookingData[]>
  
  // Data management
  refreshEvents: () => Promise<void>
  getUpcomingEvents: () => EventData[]
  getUserBookedEvents: () => EventData[]
  
  // Statistics
  getEventStats: () => {
    total: number
    upcoming: number
    participated: number
    created: number
  }
}

export const useEvents = (options: UseEventsOptions = {}): UseEventsReturn => {
  const { autoFetch = true, filters = {} } = options
  
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const hasFetchedOnce = useRef(false)
  
  const { events: dbEvents, addEvent, updateEvent: updateEventDB, deleteEvent: deleteEventDB } = useOfflineDB()
  const { user, isAuthenticated, token } = useAuthStore()

  const API_BASE = API_CONFIG.BASE_URL

  // Simple reload function for after operations
  const reloadEvents = useCallback(async () => {
    try {
      const eventList = await dbEvents.getAll()
      let filtered = [...eventList]

      // Apply status filtering
      if (filters.status) {
        filtered = filtered.filter(event => event.status === filters.status)
      }
      else if (!user || !user.membership?.type || user.membership.type !== 'vvip') {
        filtered = filtered.filter(event => event.status === 'published' || event.status === 'draft')
      }

      // Apply upcoming filter
      if (filters.upcoming) {
        const now = new Date()
        filtered = filtered.filter(event => new Date(event.metadata.date) > now)
      }

      // Apply user events filter
      if (filters.userEvents && user) {
        filtered = filtered.filter(event => 
          event.participants?.some(p => p.userId === user._id)
        )
      }

      const sorted = filtered.sort((a, b) => new Date(a.metadata.date).getTime() - new Date(b.metadata.date).getTime())
      setEvents(sorted)
    } catch (err) {
      console.error('Failed to reload events:', err)
    }
  }, []) // Remove dependencies to prevent loops

  // Load events from database with immediate filtering
  const loadEventsWithFilter = useCallback(async () => {
    try {
      setError(null)
      const eventList = await dbEvents.getAll()
      let filtered = [...eventList]

      // Apply status filtering
      if (filters.status) {
        filtered = filtered.filter(event => event.status === filters.status)
      }
      else if (!user || !user.membership?.type || user.membership.type !== 'vvip') {
        filtered = filtered.filter(event => event.status === 'published' || event.status === 'draft')
      }

      // Apply upcoming filter
      if (filters.upcoming) {
        const now = new Date()
        filtered = filtered.filter(event => new Date(event.metadata.date) > now)
      }

      // Apply user events filter
      if (filters.userEvents && user) {
        filtered = filtered.filter(event => 
          event.participants?.some(p => p.userId === user._id)
        )
      }

      const sorted = filtered.sort((a, b) => new Date(a.metadata.date).getTime() - new Date(b.metadata.date).getTime())
      setEvents(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入活動失敗')
    } finally {
      setLoading(false)
    }
  }, []) // Remove all dependencies to prevent loops

  // Fetch events from server
  const fetchEventsFromServer = useCallback(async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // Add auth header if available (events API is public)
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/events`, {
        headers
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        // Update local database with server data
        for (const event of result.data) {
          try {
            await addEvent(event)
          } catch (err) {
            // If event already exists, try to update it instead
            if (err instanceof Error && err.name === 'ConstraintError') {
              await updateEventDB(event._id!, event)
            } else {
              console.warn('Failed to add event:', event._id, err)
            }
          }
        }
        // Reload events after server sync
        await loadEventsWithFilter()
      }
    } catch (err) {
      console.error('Failed to fetch events from server:', err)
    }
  }, [API_BASE, addEvent, updateEventDB, loadEventsWithFilter, isAuthenticated, token])

  // Refresh events (from server and local)
  const refreshEvents = useCallback(async () => {
    setRefreshing(true)
    await fetchEventsFromServer()
    await loadEventsWithFilter()
    setRefreshing(false)
  }, [fetchEventsFromServer, loadEventsWithFilter])

  // Create new event
  const createEvent = useCallback(async (eventData: Omit<EventData, '_id' | 'createdAt' | 'updatedAt'>): Promise<EventData | null> => {
    if (!isAuthenticated || !token) {
      setError('請先登入')
      return null
    }

    try {
      const newEvent: EventData = {
        ...eventData,
        _id: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        participants: [],
        notifications: {
          sent: false,
          recipients: []
        }
      }

      // Add to local database first (offline-first)
      const localEvent = await addEvent(newEvent)
      
      // Try to sync to server
      if (navigator.onLine) {
        try {
          const response = await fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEvent)
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
              // Update with server ID
              await updateEventDB(localEvent._id!, result.data)
            }
          }
        } catch (serverError) {
          console.error('Failed to sync event to server:', serverError)
          // Event is still saved locally
        }
      }

      await reloadEvents()
      return localEvent
    } catch (err) {
      setError(err instanceof Error ? err.message : '創建活動失敗')
      return null
    }
  }, [isAuthenticated, token, API_BASE, addEvent, updateEventDB, reloadEvents])

  // Update event
  const updateEvent = useCallback(async (eventId: string, updates: Partial<EventData>): Promise<boolean> => {
    if (!isAuthenticated || !token) {
      setError('請先登入')
      return false
    }

    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }

      // Update local database first
      await updateEventDB(eventId, updateData)

      // Try to sync to server
      if (navigator.onLine) {
        try {
          const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          })

          if (!response.ok) {
            console.error('Failed to sync event update to server')
          }
        } catch (serverError) {
          console.error('Failed to sync event update to server:', serverError)
        }
      }

      await reloadEvents()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新活動失敗')
      return false
    }
  }, [isAuthenticated, token, API_BASE, updateEventDB, reloadEvents])

  // Delete event
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!isAuthenticated || !token) {
      setError('請先登入')
      return false
    }

    try {
      // Delete from local database first
      await deleteEventDB(eventId)

      // Try to sync to server
      if (navigator.onLine) {
        try {
          const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            console.error('Failed to sync event deletion to server')
          }
        } catch (serverError) {
          console.error('Failed to sync event deletion to server:', serverError)
        }
      }

      await reloadEvents()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除活動失敗')
      return false
    }
  }, [isAuthenticated, token, API_BASE, deleteEventDB, reloadEvents])

  // Get event by ID
  const getEventById = useCallback(async (eventId: string): Promise<EventData | null> => {
    try {
      return await dbEvents.get(eventId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取活動失敗')
      return null
    }
  }, [dbEvents])

  // Book event
  const bookEvent = useCallback(async (eventId: string, bookingData: Partial<BookingData> = {}): Promise<boolean> => {
    if (!isAuthenticated || !user || !token) {
      setError('請先登入')
      return false
    }

    try {
      const event = await getEventById(eventId)
      if (!event) {
        setError('找不到活動')
        return false
      }

      // Check if user already booked
      const isAlreadyBooked = event.participants?.some(p => p.userId === user._id)
      if (isAlreadyBooked) {
        setError('您已報名此活動')
        return false
      }

      // Check if event is full
      const currentParticipants = event.participants?.length || 0
      if (currentParticipants >= event.maxParticipants) {
        setError('活動名額已滿')
        return false
      }

      // Add participant to event
      const newParticipant = {
        userId: user._id!,
        status: 'pending' as const,
        paid: false,
        joinedAt: new Date()
      }

      const updatedParticipants = [...(event.participants || []), newParticipant]
      await updateEvent(eventId, { participants: updatedParticipants })

      // Create booking record
      const booking: Omit<BookingData, '_id' | 'createdAt' | 'updatedAt'> = {
        userId: user._id!,
        eventId,
        status: 'pending',
        paymentStatus: 'pending',
        ...bookingData
      }

      // Try to sync booking to server
      if (navigator.onLine) {
        try {
          const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
          })

          if (!response.ok) {
            console.error('Failed to sync booking to server')
          }
        } catch (serverError) {
          console.error('Failed to sync booking to server:', serverError)
        }
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '報名失敗')
      return false
    }
  }, [isAuthenticated, user, token, API_BASE, getEventById, updateEvent])

  // Cancel booking
  const cancelBooking = useCallback(async (eventId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      setError('請先登入')
      return false
    }

    try {
      const event = await getEventById(eventId)
      if (!event) {
        setError('找不到活動')
        return false
      }

      // Remove participant from event
      const updatedParticipants = event.participants?.filter(p => p.userId !== user._id) || []
      await updateEvent(eventId, { participants: updatedParticipants })

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消報名失敗')
      return false
    }
  }, [isAuthenticated, user, getEventById, updateEvent])

  // Get event participants (premium only)
    const getEventParticipants = useCallback(async (eventId: string): Promise<BookingData[]> => {
    if (!isAuthenticated || !token) return []

    try {
      const response = await fetch(`${API_BASE}/events/${eventId}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        return result.success ? result.data : []
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err)
    }

    return []
  }, [isAuthenticated, token, API_BASE])

  // Get upcoming events
  const getUpcomingEvents = useCallback((): EventData[] => {
    const now = new Date()
    return events.filter(event => new Date(event.metadata.date) > now)
  }, [events])

  // Get user booked events
  const getUserBookedEvents = useCallback((): EventData[] => {
    if (!user) return []
    return events.filter(event => 
      event.participants?.some(p => p.userId === user._id)
    )
  }, [events, user])

  // Get event statistics
  const getEventStats = useCallback(() => {
    const total = events.length
    const upcoming = getUpcomingEvents().length
    const participated = getUserBookedEvents().length
    const created = user ? events.filter(() => 
      // Assuming events have a createdBy field (not in current schema)
      false // TODO: Add createdBy field to EventData schema
    ).length : 0

    return { total, upcoming, participated, created }
  }, [events, getUpcomingEvents, getUserBookedEvents, user])

  // Load events on mount
  useEffect(() => {
    if (autoFetch) {
      loadEventsWithFilter()
    }
  }, [autoFetch]) // Only depend on autoFetch

  // Fetch from server once on mount
  useEffect(() => {
    if (autoFetch && !hasFetchedOnce.current) {
      hasFetchedOnce.current = true
      fetchEventsFromServer()
    }
  }, [autoFetch]) // Remove fetchEventsFromServer dependency

  return {
    events,
    loading,
    error,
    refreshing,
    
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    
    bookEvent,
    cancelBooking,
    
    getEventParticipants,
    
    refreshEvents,
    getUpcomingEvents,
    getUserBookedEvents,
    
    getEventStats
  }
}