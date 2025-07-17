// Luxury Event List Component - Hesocial Inspired Design
import React, { useState, useEffect } from 'react'
import { EventCard } from './EventCard'
import { ActivityLimitPrompt } from '../ui/ActivityLimitPrompt'
import type { EventData, EventFilters } from '../../shared-types'
import { useAuthStore } from '../../store/authStore'
import { eventBus, uiEvents } from '../../services/event-bus'

interface EventListProps {
  events: EventData[]
  loading?: boolean
  onViewDetails: (eventId: string) => void
  onBookEvent?: (eventId: string) => void
  onCreateEvent?: () => void
  showCreateButton?: boolean
}

export const EventList: React.FC<EventListProps> = ({
  events,
  loading = false,
  onViewDetails,
  onBookEvent,
  onCreateEvent,
  showCreateButton = false
}) => {
  const { user, hasPermission } = useAuthStore()
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>(events)
  const [allFilteredEvents, setAllFilteredEvents] = useState<EventData[]>(events) // Before membership limits
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Partial<EventFilters>>({})
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'participants' | 'price'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)

  // Taiwan cities for location filtering
  const taiwanCities = [
    '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
    '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣',
    '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
    '台東縣', '澎湖縣', '金門縣', '連江縣'
  ]

  const eventTypes = [
    { value: '1day_trip', label: '一日遊' },
    { value: '4hour_dining', label: '4小時餐敘' },
    { value: '2day_trip', label: '二日遊' }
  ]

  // Subscribe to event bus messages for reactive updates
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('UI_REFRESH', (message) => {
      if (message.payload.component === 'EventList') {
        // Update immediately without debouncing to prevent blinking
        setFilteredEvents([...events])
      }
    })

    return unsubscribe
  }, [events])

  // Publish filter changes to event bus
  const handleFilterChange = (newFilters: Partial<EventFilters>) => {
    setFilters(newFilters)
    uiEvents.filterChange('EventList', newFilters)
  }

  const handleSortChange = (newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    uiEvents.filterChange('EventList', { sortBy: newSortBy, sortOrder: newSortOrder })
  }

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(term) ||
        event.metadata.location.toLowerCase().includes(term) ||
        event.metadata.category.toLowerCase().includes(term)
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.metadata.location.includes(filters.location!)
      )
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.metadata.date)
        const startDate = filters.dateRange!.start
        const endDate = filters.dateRange!.end
        return eventDate >= startDate && eventDate <= endDate
      })
    }

    // Event type filter
    if (filters.type) {
      filtered = filtered.filter(event => event.metadata.type === filters.type)
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(event => {
        const malePrice = event.metadata.pricing.male
        const femalePrice = event.metadata.pricing.female
        const avgPrice = (malePrice + femalePrice) / 2
        return avgPrice >= filters.priceRange!.min && avgPrice <= filters.priceRange!.max
      })
    }

    // Age range filter
    if (filters.ageRange) {
      filtered = filtered.filter(event => {
        const eventMinAge = event.metadata.requirements.ageMin
        const eventMaxAge = event.metadata.requirements.ageMax
        return eventMinAge <= filters.ageRange!.max && eventMaxAge >= filters.ageRange!.min
      })
    }

    // Sort events
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.metadata.date).getTime() - new Date(b.metadata.date).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name, 'zh-TW')
          break
        case 'participants':
          comparison = (a.participants?.length || 0) - (b.participants?.length || 0)
          break
        case 'price': {
          const avgPriceA = (a.metadata.pricing.male + a.metadata.pricing.female) / 2
          const avgPriceB = (b.metadata.pricing.male + b.metadata.pricing.female) / 2
          comparison = avgPriceA - avgPriceB
          break
        }
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    // Store all filtered events before applying membership limits
    setAllFilteredEvents(filtered)

    // Apply membership-based activity viewing limits
    const membershipType = user?.membership?.type || 'visitor'
    let limitedEvents = filtered
    
    switch (membershipType) {
      case 'visitor':
        limitedEvents = filtered.slice(0, 3) // Visitors can only see 3 activities
        break
      case 'registered':
        limitedEvents = filtered.slice(0, 12) // Registered users can only see 12 activities
        break
      case 'vip':
      case 'vvip':
        // Paid members can see all activities
        limitedEvents = filtered
        break
      default:
        // Default to visitor limits for safety
        limitedEvents = filtered.slice(0, 3)
        break
    }

    setFilteredEvents(limitedEvents)
  }, [events, searchTerm, filters, sortBy, sortOrder, user?.membership?.type])

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({})
    setSortBy('date')
    setSortOrder('asc')
    uiEvents.filterChange('EventList', { cleared: true })
  }

  const activeFilterCount = Object.keys(filters).filter(key => filters[key as keyof EventFilters]).length + (searchTerm ? 1 : 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Luxury Loading Header */}
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-8 shadow-2xl max-w-2xl mx-auto">
                <div className="animate-pulse space-y-6">
                  <div className="h-8 bg-luxury-gold/20 rounded w-1/2 mx-auto"></div>
                  <div className="h-4 bg-luxury-platinum/20 rounded w-3/4 mx-auto"></div>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-luxury-gold rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Luxury Loading Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl animate-pulse">
                  <div className="space-y-4">
                    <div className="h-6 bg-luxury-gold/20 rounded w-3/4"></div>
                    <div className="h-4 bg-luxury-platinum/20 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-luxury-gold/10 rounded"></div>
                      <div className="h-16 bg-luxury-gold/10 rounded"></div>
                    </div>
                    <div className="h-12 bg-luxury-platinum/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Luxury Hero Header */}
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-8 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-6 right-6 w-24 h-24 bg-luxury-gold rounded-full blur-2xl"></div>
                <div className="absolute bottom-6 left-6 w-20 h-20 bg-luxury-platinum rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-luxury font-bold text-luxury-gold mb-4">
                  精選活動
                </h1>
                <p className="text-xl text-luxury-platinum/80 mb-8">
                  台灣高端社交活動平台，尋找您的理想伴侶
                </p>
                
                {/* Create Button */}
                {showCreateButton && hasPermission('priorityBooking') && (
                  <button
                    onClick={onCreateEvent}
                    className="bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-midnight-black font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    創建活動
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Luxury Search and Filter Section */}
          <div className="relative z-20 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl">
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜尋活動名稱、地點或類別..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-14 bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-14 py-4 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300 text-lg"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-luxury-platinum/50 text-sm">
                    刷新
                  </div>
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        activeFilterCount > 0 
                          ? 'bg-luxury-gold text-luxury-midnight-black shadow-lg' 
                          : 'bg-luxury-platinum/10 hover:bg-luxury-platinum/20 text-luxury-platinum border border-luxury-platinum/30'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      篩選 {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>

                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-luxury-platinum/70 hover:text-luxury-gold text-sm font-medium transition-colors duration-300"
                      >
                        清除篩選
                      </button>
                    )}
                  </div>

                  {/* Luxury Sort Controls */}
                  <div className="flex items-center space-x-4 bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg px-4 py-3">
                    <span className="text-luxury-gold font-medium">排序</span>
                    <div className="w-px h-4 bg-luxury-gold/30"></div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'participants' | 'price')}
                      className="bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded px-3 py-1.5 text-luxury-platinum text-sm focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                    >
                      <option value="date">日期</option>
                      <option value="name">名稱</option>
                      <option value="participants">參與人數</option>
                      <option value="price">價格</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 bg-luxury-gold/20 hover:bg-luxury-gold/30 border border-luxury-gold/30 rounded text-luxury-gold transition-all duration-300"
                    >
                      <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Luxury Advanced Filters Panel */}
          {showFilters && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-luxury-gold font-luxury font-bold text-xl mb-2">進階篩選</h3>
                  <div className="w-16 h-px bg-luxury-gold mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-platinum mb-3">地點</label>
                    <select
                      value={filters.location || ''}
                      onChange={(e) => handleFilterChange({ ...filters, location: e.target.value || undefined })}
                      className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                    >
                      <option value="">所有地點</option>
                      {taiwanCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Event Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-platinum mb-3">活動類型</label>
                    <select
                      value={filters.type || ''}
                      onChange={(e) => handleFilterChange({ ...filters, type: e.target.value as EventData['metadata']['type'] | undefined })}
                      className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                    >
                      <option value="">所有類型</option>
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-platinum mb-3">價格範圍</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="最低"
                        value={filters.priceRange?.min || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: {
                            min: parseInt(e.target.value) || 0,
                            max: prev.priceRange?.max || 10000
                          }
                        }))}
                        className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                      />
                      <input
                        type="number"
                        placeholder="最高"
                        value={filters.priceRange?.max || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: {
                            min: prev.priceRange?.min || 0,
                            max: parseInt(e.target.value) || 10000
                          }
                        }))}
                        className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Age Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-platinum mb-3">年齡範圍</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="最小"
                        min="18"
                        max="99"
                        value={filters.ageRange?.min || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          ageRange: {
                            min: parseInt(e.target.value) || 18,
                            max: prev.ageRange?.max || 99
                          }
                        }))}
                        className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                      />
                      <input
                        type="number"
                        placeholder="最大"
                        min="18"
                        max="99"
                        value={filters.ageRange?.max || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          ageRange: {
                            min: prev.ageRange?.min || 18,
                            max: parseInt(e.target.value) || 99
                          }
                        }))}
                        className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-luxury-platinum mb-3">日期範圍</label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={filters.dateRange?.start ? new Date(filters.dateRange.start).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: {
                            start: new Date(e.target.value),
                            end: prev.dateRange?.end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                          }
                        }))}
                        className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                      />
                      <input
                        type="date"
                        value={filters.dateRange?.end ? new Date(filters.dateRange.end).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: {
                            start: prev.dateRange?.start || new Date(),
                            end: new Date(e.target.value)
                          }
                        }))}
                        className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Luxury Results Summary */}
          <div className="relative z-20 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-4 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
                    <span className="text-luxury-platinum font-medium">
                      所有活動
                    </span>
                  </div>
                  <div className="bg-luxury-gold/20 border border-luxury-gold/30 rounded-full px-3 py-1">
                    <span className="text-luxury-gold font-bold text-sm">{events.length}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-luxury-platinum font-medium">
                      即將開始
                    </span>
                  </div>
                  <div className="bg-emerald-400/20 border border-emerald-400/30 rounded-full px-3 py-1">
                    <span className="text-emerald-400 font-bold text-sm">{filteredEvents.length}</span>
                  </div>
                </div>
                
                {filteredEvents.length < allFilteredEvents.length && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-orange-400 font-medium text-sm">
                      受會員等級限制
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Luxury Event Cards Grid */}
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-8">
              
              <div className="w-16 h-px bg-luxury-gold mx-auto"></div>
            </div>
            
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onViewDetails={onViewDetails}
                    onBookEvent={onBookEvent}
                    showParticipants={hasPermission('viewParticipants')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-12 shadow-2xl max-w-2xl mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute top-4 right-4 w-16 h-16 bg-luxury-gold rounded-full blur-xl"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      
                      <h3 className="text-2xl font-luxury font-bold text-luxury-gold mb-4">
                        找不到符合條件的活動
                      </h3>
                      <p className="text-luxury-platinum/80 mb-8 text-lg">
                        {searchTerm || activeFilterCount > 0 
                          ? '請嘗試調整搜尋條件或篩選器' 
                          : '目前沒有可用的活動'
                        }
                      </p>
                      
                      {(searchTerm || activeFilterCount > 0) && (
                        <button
                          onClick={clearFilters}
                          className="bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-midnight-black font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          清除所有篩選
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity Limit Prompt - Show when user has hit their viewing limit */}
          <ActivityLimitPrompt
            totalActivities={allFilteredEvents.length}
            viewableActivities={filteredEvents.length}
            membershipType={user?.membership?.type || 'visitor'}
          />
        </div>
      </div>
    </div>
  )
}
