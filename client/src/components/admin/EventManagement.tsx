// Event Management - Admin interface for managing events
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import type { EventData } from '../../shared-types'
import { CreateEventModal } from './CreateEventModal'
import DatePicker, { DatePickerHandle } from '../common/DatePicker'
import { buildUrl, API_ENDPOINTS } from '../../config/api'
import { EventStatusManager, EventStatusBadge } from './events/EventStatusManager'

interface EventType {
  typeId: string
  name: string
  displayName: string
  description?: string
  color?: string
  icon?: string
  isActive: boolean
  sortOrder: number
  metadata?: {
    defaultDuration?: number
    suggestedPricing?: {
      male?: number
      female?: number
    }
    commonRequirements?: {
      ageMin?: number
      ageMax?: number
    }
  }
}

interface EditEventModalProps {
  event: EventData
  onClose: () => void
  onEventUpdated: () => void
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, onClose, onEventUpdated }) => {
  const { apiCall } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loadingEventTypes, setLoadingEventTypes] = useState(true)
  const datePickerRef = useRef<DatePickerHandle>(null)
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description || '',
    dateTime: new Date(event.metadata.date),
    location: event.metadata.location,
    category: event.metadata.category,
    type: event.metadata.type as '1day_trip' | '4hour_dining' | '2day_trip',
    maxParticipants: event.maxParticipants?.toString() || '',
    pricing: {
      male: event.metadata.pricing.male?.toString() || '',
      female: event.metadata.pricing.female?.toString() || '',
      voucherDiscount: {
        '100': event.metadata.pricing.voucherDiscount?.['100']?.toString() || '',
        '200': event.metadata.pricing.voucherDiscount?.['200']?.toString() || ''
      }
    },
    requirements: {
      ageMin: event.metadata.requirements.ageMin?.toString() || '',
      ageMax: event.metadata.requirements.ageMax?.toString() || '',
      maritalStatus: event.metadata.requirements.maritalStatus || 'any' as 'single' | 'divorced' | 'any'
    }
  })

  // Fetch event types on component mount
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const url = buildUrl(API_ENDPOINTS.EVENT_TYPES.LIST)
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setEventTypes(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch event types:', error)
      } finally {
        setLoadingEventTypes(false)
      }
    }

    fetchEventTypes()
  }, [])

  // Auto-fill pricing when event type is selected
  const handleCategoryChange = (eventTypeName: string) => {
    setFormData(prev => ({ ...prev, category: eventTypeName }))
    
    // Find the selected event type and auto-fill suggested pricing
    const selectedEventType = eventTypes.find(et => et.name === eventTypeName)
    if (selectedEventType?.metadata?.suggestedPricing) {
      setFormData(prev => ({
        ...prev,
        category: eventTypeName,
        pricing: {
          ...prev.pricing,
          male: selectedEventType.metadata?.suggestedPricing?.male?.toString() || prev.pricing.male,
          female: selectedEventType.metadata?.suggestedPricing?.female?.toString() || prev.pricing.female
        },
        requirements: {
          ...prev.requirements,
          ageMin: selectedEventType.metadata?.commonRequirements?.ageMin?.toString() || prev.requirements.ageMin,
          ageMax: selectedEventType.metadata?.commonRequirements?.ageMax?.toString() || prev.requirements.ageMax
        }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        name: formData.name,
        description: formData.description,
        metadata: {
          date: formData.dateTime.toISOString(),
          location: formData.location,
          category: formData.category,
          type: formData.type,
          pricing: {
            male: parseFloat(formData.pricing.male) || 0,
            female: parseFloat(formData.pricing.female) || 0,
            voucherDiscount: {
              '100': parseFloat(formData.pricing.voucherDiscount['100']) || 0,
              '200': parseFloat(formData.pricing.voucherDiscount['200']) || 0
            }
          },
          requirements: {
            ageMin: parseInt(formData.requirements.ageMin) || 18,
            ageMax: parseInt(formData.requirements.ageMax) || 65,
            maritalStatus: formData.requirements.maritalStatus
          }
        },
        maxParticipants: parseInt(formData.maxParticipants) || undefined
      }

      const response = await apiCall(`/events/${event._id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
      })

      const result = await response.json()
      
      if (result.success) {
        onEventUpdated()
        onClose()
      } else {
        throw new Error(result.error || '更新活動失敗')
      }
    } catch (error) {
      console.error('Failed to update event:', error)
      alert('更新活動失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-luxury-midnight-black border border-luxury-gold/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-luxury-gold">編輯活動</h3>
            <button
              onClick={onClose}
              className="text-luxury-platinum/60 hover:text-luxury-gold transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-luxury-platinum mb-2">
                  活動名稱 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                  placeholder="輸入活動名稱"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-luxury-platinum mb-2">
                  活動類別 <span className="text-red-400">*</span>
                </label>
                {loadingEventTypes ? (
                  <div className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum/60">
                    載入中...
                  </div>
                ) : (
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                  >
                    <option value="">請選擇活動類別</option>
                    {eventTypes.map((eventType) => (
                      <option key={eventType.typeId} value={eventType.name}>
                        {eventType.displayName}
                        {eventType.description && ` - ${eventType.description}`}
                      </option>
                    ))}
                  </select>
                )}
                {formData.category && (
                  <p className="text-xs text-luxury-platinum/60 mt-1">
                    已選擇：{eventTypes.find(et => et.name === formData.category)?.displayName}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-luxury-platinum mb-2">
                活動描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                placeholder="輸入活動描述..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-luxury-platinum mb-2 flex items-center">
                  活動日期與時間 <span className="text-red-400">*</span>
                  <button 
                    type="button" 
                    className="ml-2 text-luxury-gold hover:text-luxury-gold/80 transition-colors"
                    onClick={() => {
                      if (datePickerRef.current) {
                        datePickerRef.current.open();
                      }
                    }}
                    title="開啟日期選擇器"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </label>
                <DatePicker
                  ref={datePickerRef}
                  value={formData.dateTime}
                  onChange={(date) => setFormData({...formData, dateTime: date})}
                  showTime={true}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-luxury-platinum mb-2">
                  活動類型 <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as typeof formData.type})}
                  className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                >
                  <option value="1day_trip">一日遊</option>
                  <option value="4hour_dining">四小時用餐</option>
                  <option value="2day_trip">二日遊</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-luxury-platinum mb-2">
                  活動地點 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                  placeholder="輸入活動地點"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-luxury-platinum mb-2">
                  參與人數限制
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                  className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                  placeholder="留空表示無限制"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-luxury-gold/20">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-luxury-gold/30 text-luxury-platinum hover:bg-luxury-gold/10 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="luxury-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '更新中...' : '更新活動'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// CreateEventModal moved to separate file: ./CreateEventModal.tsx

interface EventStats {
  total: number
  upcoming: number
  recruiting: number
  cancelled: number
  suspended: number
}

export const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([])
  const [stats, setStats] = useState<EventStats>({ 
    total: 0, 
    upcoming: 0, 
    recruiting: 0, 
    cancelled: 0,
    suspended: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'recruiting' | 'suspended' | 'cancelled'>('all')

    const { apiCall, hasPermission } = useAdminAuth()

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
                  const response = await apiCall('/events')
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.data)
        
        // Calculate stats
        const total = data.data.length
        const upcoming = data.data.filter((event: EventData) => 
          new Date(event.metadata.date) > new Date()
        ).length
        const recruiting = data.data.filter((event: EventData) => 
          event.status === 'published' && new Date(event.metadata.date) > new Date()
        ).length
        const cancelled = data.data.filter((event: EventData) => 
          event.status === 'cancelled'
        ).length
        const suspended = data.data.filter((event: EventData) => 
          event.status === 'suspended'
        ).length
        
        setStats({ total, upcoming, recruiting, cancelled, suspended })
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
    }, [apiCall])

    useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleEventAction = async (eventId: string, action: 'cancel' | 'complete') => {
    try {
                  await apiCall(`/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: action === 'cancel' ? 'cancelled' : 'ready' })
      })
      loadEvents() // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} event:`, error)
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return new Date(event.metadata.date) > new Date()
    if (filter === 'recruiting') return event.status === 'published' && new Date(event.metadata.date) > new Date()
    if (filter === 'suspended') return event.status === 'suspended'
    if (filter === 'cancelled') return event.status === 'cancelled'
    return true
  })

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'full':
        return 'bg-orange-500/20 text-orange-400'
      case 'ready':
        return 'bg-blue-500/20 text-blue-400'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-luxury-gold/20 text-luxury-gold'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-luxury-gold">活動管理</h2>
          <p className="text-luxury-platinum/80">管理所有平台活動</p>
        </div>
        {hasPermission('events') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="luxury-button flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>新增活動</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-luxury-platinum/60">總活動數</p>
              <p className="text-2xl font-bold text-luxury-gold">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3m2 0v-3a2 2 0 012-2h1a2 2 0 012 2v3m1-5V7a2 2 0 012-2h2a2 2 0 012 2v10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-luxury-platinum/60">即將舉行</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.upcoming}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-luxury-platinum/60">募集中</p>
              <p className="text-2xl font-bold text-blue-400">{stats.recruiting}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-luxury-platinum/60">已暫停</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.suspended}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-luxury-platinum/60">已取消</p>
              <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 border-b border-luxury-gold/20">
        {[
          { key: 'all', label: '全部', count: stats.total },
          { key: 'upcoming', label: '即將舉行', count: stats.upcoming },
          { key: 'recruiting', label: '募集中', count: stats.recruiting },
          { key: 'suspended', label: '已暫停', count: stats.suspended },
          { key: 'cancelled', label: '已取消', count: stats.cancelled }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              filter === tab.key
                ? 'border-luxury-gold text-luxury-gold'
                : 'border-transparent text-luxury-platinum/60 hover:text-luxury-platinum hover:border-luxury-gold/50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="luxury-card">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-gold/20">
                  <th className="text-left py-3 px-4 text-luxury-platinum font-medium">活動名稱</th>
                  <th className="text-left py-3 px-4 text-luxury-platinum font-medium">日期時間</th>
                  <th className="text-left py-3 px-4 text-luxury-platinum font-medium">地點</th>
                  <th className="text-left py-3 px-4 text-luxury-platinum font-medium">狀態</th>
                  <th className="text-left py-3 px-4 text-luxury-platinum font-medium">參與人數</th>
                  {hasPermission('events:edit') && (
                    <th className="text-left py-3 px-4 text-luxury-platinum font-medium">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="border-b border-luxury-gold/10 hover:bg-luxury-gold/5">
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-medium text-luxury-gold">{event.name}</h4>
                        <p className="text-sm text-luxury-platinum/60 mt-1">{event.metadata.category}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-luxury-platinum">
                      {formatDate(event.metadata.date)}
                    </td>
                    <td className="py-4 px-4 text-luxury-platinum">
                      {event.metadata.location}
                    </td>
                    <td className="py-4 px-4">
                      <EventStatusBadge status={event.status || 'draft'} />
                    </td>
                    <td className="py-4 px-4 text-luxury-platinum">
                      {event.participants?.length || 0} / {event.maxParticipants || '無限制'}
                    </td>
                    {hasPermission('events') && (
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="text-luxury-gold hover:text-luxury-gold/80 transition-colors"
                            title="查看詳情"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {(event.status === 'draft' || event.status === 'published') && (
                            <button
                              onClick={() => setEditingEvent(event)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="編輯活動"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {(event.status === 'published' || event.status === 'full') && (
                            <>
                              <button
                                onClick={() => handleEventAction(event._id!, 'complete')}
                                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                title="標記為準備就緒"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEventAction(event._id!, 'cancel')}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="取消活動"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-luxury-platinum/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3m2 0v-3a2 2 0 012-2h1a2 2 0 012 2v3m1-5V7a2 2 0 012-2h2a2 2 0 012 2v10" />
                </svg>
                <p className="text-luxury-platinum/60">目前沒有活動</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)}
          onEventCreated={loadEvents}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal 
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onEventUpdated={loadEvents}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-luxury-midnight-black border border-luxury-gold/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-luxury-gold">{selectedEvent.name}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-luxury-platinum/60 hover:text-luxury-platinum"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-luxury-platinum">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>類別:</strong> {selectedEvent.metadata.category}</p>
                  <p><strong>日期:</strong> {formatDate(selectedEvent.metadata.date)}</p>
                  <p><strong>地點:</strong> {selectedEvent.metadata.location}</p>
                  <p><strong>參與人數:</strong> {selectedEvent.participants?.length || 0}</p>
                </div>
                <div>
                  <p><strong>價格 (男):</strong> NT${selectedEvent.metadata.pricing?.male || 0}</p>
                  <p><strong>價格 (女):</strong> NT${selectedEvent.metadata.pricing?.female || 0}</p>
                  <p><strong>年齡限制:</strong> {selectedEvent.metadata.requirements?.ageMin || 18}-{selectedEvent.metadata.requirements?.ageMax || 65}歲</p>
                </div>
              </div>
              
              {/* Status Management - Highlighted Section */}
              <div className="mt-6 border border-luxury-gold/30 rounded-lg p-4 bg-luxury-midnight-black/50">
                <h4 className="text-lg font-medium text-luxury-gold mb-3">活動狀態管理</h4>
                <EventStatusManager 
                  eventId={selectedEvent._id || ''}
                  currentStatus={selectedEvent.status || 'draft'}
                  onStatusChange={async (newStatus) => {
                    try {
                      const response = await apiCall(`/api/admin/events/${selectedEvent._id}/status`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: newStatus })
                      });
                      
                      if (response.ok) {
                        // Update the selected event status
                        setSelectedEvent({
                          ...selectedEvent,
                          status: newStatus as EventData['status']
                        });
                        
                        // Reload events to update the list
                        loadEvents();
                      } else {
                        const errorData = await response.json();
                        console.error('Failed to update event status:', errorData);
                        throw new Error(errorData.error || 'Failed to update event status');
                      }
                    } catch (error) {
                      console.error('Error updating event status:', error);
                      throw error;
                    }
                  }}
                />
              </div>
              
              {selectedEvent.description && (
                <div>
                  <h4 className="text-lg font-medium text-luxury-gold mt-4 mb-2">活動描述</h4>
                  <p className="text-luxury-platinum/80 whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setEditingEvent(selectedEvent)}
                className="px-4 py-2 bg-luxury-gold/20 hover:bg-luxury-gold/30 text-luxury-gold border border-luxury-gold/30 rounded-lg transition-colors"
              >
                編輯活動
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-luxury-midnight-black hover:bg-luxury-midnight-black/80 text-luxury-platinum border border-luxury-gold/30 rounded-lg transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}