// Events Page - Main interface for event management
import React, { useState } from 'react'
import { EventList } from '../components/events/EventList'
import { EventDetail } from '../components/events/EventDetail'
import { EventForm } from '../components/events/EventForm'
import { AuthReminder } from '../components/ui/AuthReminder'
import { useEvents } from '../hooks/useEvents'
import { useAuthStore } from '../store/authStore'
import type { EventData } from '../shared-types'

type ViewMode = 'list' | 'detail' | 'create' | 'edit'

export const EventsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'my-events'>('all')
  
  const { isAuthenticated, hasPermission } = useAuthStore()
  
  // Use different filters based on active tab
  const eventsOptions = {
    autoFetch: true,
    filters: {
      upcoming: activeTab === 'upcoming',
      userEvents: activeTab === 'my-events'
    }
  }
  
  const {
    events,
    loading,
    error,
    refreshing,
    refreshEvents,
    getUpcomingEvents,
    getUserBookedEvents,
    getEventStats
  } = useEvents(eventsOptions)

  // Get events based on active tab
  const getDisplayEvents = () => {
    switch (activeTab) {
      case 'upcoming':
        return getUpcomingEvents()
      case 'my-events':
        return getUserBookedEvents()
      default:
        return events
    }
  }

  const displayEvents = getDisplayEvents()
  const stats = getEventStats()

  const handleViewDetails = (eventId: string) => {
    setSelectedEventId(eventId)
    setViewMode('detail')
  }

  const handleCreateEvent = () => {
    setSelectedEventId(null)
    setViewMode('create')
  }

    const handleEditEvent = (eventId: string) => {
    setSelectedEventId(eventId)
    setViewMode('edit')
  }

  const handleBookEvent = (eventId: string) => {
    // This is a placeholder, the actual booking is handled in EventDetail
    handleViewDetails(eventId);
  };

  const handleEventSaved = (event: EventData) => {
    setViewMode('list')
    refreshEvents()
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedEventId(null)
  }

  // Navigation tabs
  const tabs = [
    { 
      id: 'all', 
      label: '所有活動', 
      count: stats.total,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      id: 'upcoming', 
      label: '即將開始', 
      count: stats.upcoming,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  // Add "my events" tab only for authenticated users
  if (isAuthenticated) {
    tabs.push({
      id: 'my-events', 
      label: '我的活動', 
      count: stats.participated,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    })
  }

  // Render different views based on mode
  if (viewMode === 'detail' && selectedEventId) {
    return (
      <EventDetail
        eventId={selectedEventId}
        onBack={handleBackToList}
        onEdit={hasPermission('priorityBooking') ? handleEditEvent : undefined}
      />
    )
  }

  if (viewMode === 'create') {
    return (
      <EventForm
        onSave={handleEventSaved}
        onCancel={handleBackToList}
      />
    )
  }

  if (viewMode === 'edit' && selectedEventId) {
    return (
      <EventForm
        eventId={selectedEventId}
        onSave={handleEventSaved}
        onCancel={handleBackToList}
      />
    )
  }

  // Main list view
  return (
    <div className="container-luxury section-luxury">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gradient-luxury mb-2">
                精選活動
              </h1>
              <p className="text-gray-600">
                台灣高端社交活動平台，尋找您的理想伴侶
              </p>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={refreshEvents}
              disabled={refreshing}
              className="btn-luxury-outline"
            >
              {refreshing ? (
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              刷新
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 bg-luxury-midnight-black/5 backdrop-blur-sm rounded-lg p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'all' | 'upcoming' | 'my-events')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-luxury-gold text-luxury-midnight-black shadow-lg'
                    : 'text-luxury-platinum hover:text-luxury-gold hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  activeTab === tab.id
                    ? 'bg-luxury-midnight-black/20 text-luxury-midnight-black'
                    : 'bg-luxury-gold/20 text-luxury-gold'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="luxury-card-outline p-6 text-center">
              <div className="text-3xl font-bold text-luxury-gold mb-2">{stats.total}</div>
              <div className="text-sm text-luxury-platinum/80 font-medium">總活動數</div>
            </div>
            <div className="luxury-card-outline p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.upcoming}</div>
              <div className="text-sm text-luxury-platinum/80 font-medium">即將開始</div>
            </div>
            <div className="luxury-card-selected p-6 text-center">
              <div className="text-3xl font-bold text-luxury-midnight-black mb-2">{stats.participated}</div>
              <div className="text-sm text-luxury-midnight-black/80 font-medium">已參與</div>
            </div>
            <div className="luxury-card-outline p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{stats.created}</div>
              <div className="text-sm text-luxury-platinum/80 font-medium">已創建</div>
            </div>
          </div>
        )}

        {/* Event List */}
        <EventList
          events={displayEvents}
          loading={loading}
          onViewDetails={handleViewDetails}
          onBookEvent={handleBookEvent}
          onCreateEvent={handleCreateEvent}
          showCreateButton={hasPermission('priorityBooking')}
        />

        {/* Authentication Reminder */}
        {!isAuthenticated && <AuthReminder />}

        {/* Membership Upgrade Reminder */}
        {isAuthenticated && !hasPermission('priorityBooking') && (
          <div className="mt-12 text-center">
            <div className="luxury-card-selected p-8 max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-luxury-midnight-black mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h3 className="luxury-card-title mb-2">
                升級VIP會員
              </h3>
              <p className="text-luxury-midnight-black/80 mb-6">
                升級為VIP或Premium會員，享受優先報名、創建活動等專屬功能
              </p>
              <button className="luxury-card-button-selected">
                立即升級
              </button>
            </div>
          </div>
        )}
      </div>
  )
}