// Event List Component with Search and Filtering
import React, { useState, useEffect } from 'react'
import { EventCard } from './EventCard'
import { ActivityLimitPrompt } from '../ui/ActivityLimitPrompt'
import type { EventData, EventFilters } from '../../shared-types'
import { useAuthStore } from '../../store/authStore'

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

  const eventCategories = [
    '美食饗宴', '文化藝術', '戶外活動', '商務社交', '興趣愛好',
    '健康養生', '旅遊探索', '學習成長', '音樂娛樂', '運動休閒'
  ]

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
        case 'price':
          const avgPriceA = (a.metadata.pricing.male + a.metadata.pricing.female) / 2
          const avgPriceB = (b.metadata.pricing.male + b.metadata.pricing.female) / 2
          comparison = avgPriceA - avgPriceB
          break
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
  }, [events, searchTerm, filters, sortBy, sortOrder])

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({})
    setSortBy('date')
    setSortOrder('asc')
  }

  const activeFilterCount = Object.keys(filters).filter(key => filters[key as keyof EventFilters]).length + (searchTerm ? 1 : 0)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card-luxury animate-pulse">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="space-y-4">
        {/* Title and Create Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gradient-luxury">精選活動</h2>
          {showCreateButton && hasPermission('priorityBooking') && (
            <button
              onClick={onCreateEvent}
              className="btn-luxury"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              創建活動
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋活動名稱、地點或類別..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-luxury w-full pl-10"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-luxury-outline ${activeFilterCount > 0 ? 'bg-luxury-gold text-white' : ''}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              篩選 {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                清除篩選
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="date">日期</option>
              <option value="name">名稱</option>
              <option value="participants">參與人數</option>
              <option value="price">價格</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="card-luxury p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">地點</label>
                <select
                  value={filters.location || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || undefined }))}
                  className="input-luxury w-full"
                >
                  <option value="">所有地點</option>
                  {taiwanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Event Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">活動類型</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any || undefined }))}
                  className="input-luxury w-full"
                >
                  <option value="">所有類型</option>
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">價格範圍</label>
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
                    className="input-luxury w-full"
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
                    className="input-luxury w-full"
                  />
                </div>
              </div>

              {/* Age Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">年齡範圍</label>
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
                    className="input-luxury w-full"
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
                    className="input-luxury w-full"
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">日期範圍</label>
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
                    className="input-luxury w-full"
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
                    className="input-luxury w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>顯示 {filteredEvents.length} 個活動</span>
        <div className="flex items-center space-x-2">
          {filteredEvents.length !== events.length && (
            <span>（共 {events.length} 個活動）</span>
          )}
          {filteredEvents.length < allFilteredEvents.length && (
            <span className="text-orange-600 font-medium">
              （受會員等級限制）
            </span>
          )}
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">找不到符合條件的活動</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || activeFilterCount > 0 
              ? '請嘗試調整搜尋條件或篩選器' 
              : '目前沒有可用的活動'
            }
          </p>
          {(searchTerm || activeFilterCount > 0) && (
            <button
              onClick={clearFilters}
              className="mt-3 btn-luxury-outline"
            >
              清除所有篩選
            </button>
          )}
        </div>
      )}

      {/* Activity Limit Prompt - Show when user has hit their viewing limit */}
      <ActivityLimitPrompt
        totalActivities={allFilteredEvents.length}
        viewableActivities={filteredEvents.length}
        membershipType={user?.membership?.type || 'visitor'}
      />
    </div>
  )
}