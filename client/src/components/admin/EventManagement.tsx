// Event Management - Admin interface for managing events
import React, { useState, useEffect, useCallback } from 'react'
import { useAdminAuth, createAdminAPI } from '../../hooks/useAdminAuth'
import type { EventData } from '../../shared-types'

interface EventStats {
  total: number
  upcoming: number
  completed: number
  cancelled: number
}

export const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([])
  const [stats, setStats] = useState<EventStats>({ total: 0, upcoming: 0, completed: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')

  const { apiCall, hasPermission } = useAdminAuth()
  const adminAPI = createAdminAPI(apiCall)

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
        const completed = data.data.filter((event: EventData) => 
          event.status === 'completed'
        ).length
        const cancelled = data.data.filter((event: EventData) => 
          event.status === 'cancelled'
        ).length
        
        setStats({ total, upcoming, completed, cancelled })
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
        body: JSON.stringify({ status: action === 'cancel' ? 'cancelled' : 'completed' })
      })
      loadEvents() // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} event:`, error)
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return new Date(event.metadata.date) > new Date()
    if (filter === 'completed') return event.status === 'completed'
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
      case 'completed':
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
        {hasPermission('events:create') && (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-sm text-luxury-platinum/60">已完成</p>
              <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          { key: 'completed', label: '已完成', count: stats.completed },
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                        {event.status === 'draft' && '草稿'}
                        {event.status === 'published' && '已發佈'}
                        {event.status === 'full' && '已滿'}
                        {event.status === 'completed' && '已完成'}
                        {event.status === 'cancelled' && '已取消'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-luxury-platinum">
                      {event.participants?.length || 0} / {event.maxParticipants || '無限制'}
                    </td>
                    {hasPermission('events:edit') && (
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
                          {(event.status === 'published' || event.status === 'full') && (
                            <>
                              <button
                                onClick={() => handleEventAction(event._id!, 'complete')}
                                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                title="標記為完成"
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

      {/* Create Event Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-luxury-midnight-black border border-luxury-gold/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-luxury-gold mb-4">新增活動</h3>
            <p className="text-luxury-platinum/80 mb-6">活動創建功能即將推出</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="luxury-button-sm"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal Placeholder */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-luxury-midnight-black border border-luxury-gold/30 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-luxury-gold mb-4">{selectedEvent.name}</h3>
            <div className="space-y-4 text-luxury-platinum">
              <p><strong>類別:</strong> {selectedEvent.metadata.category}</p>
              <p><strong>日期:</strong> {formatDate(selectedEvent.metadata.date)}</p>
              <p><strong>地點:</strong> {selectedEvent.metadata.location}</p>
              <p><strong>狀態:</strong> {selectedEvent.status}</p>
              <p><strong>參與人數:</strong> {selectedEvent.participants?.length || 0}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="luxury-button-sm"
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