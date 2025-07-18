// Event Detail Page with Booking Flow
import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { EventData, BookingData } from '../../shared-types'
import { useAuthStore } from '../../store/authStore'
import { useEvents } from '../../hooks/useEvents'

interface EventDetailProps {
  eventId: string
  onBack: () => void
  onEdit?: (eventId: string) => void
}

interface Participant {
  userId: string;
  name?: string;
  status: string;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  eventId,
  onBack,
  onEdit
}) => {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const hasLoadedOnce = useRef<string | null>(null)
  
  const { user, isAuthenticated, hasPermission } = useAuthStore()
  const { getEventById, bookEvent, cancelBooking, getEventParticipants } = useEvents()

  // Booking form state
  const [bookingForm, setBookingForm] = useState<Partial<BookingData>>({
    specialRequests: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  const loadEventDetails = useCallback(async () => {
    setLoading(true)
    try {
      const eventData = await getEventById(eventId)
      setEvent(eventData)
      
      // Load participants if user has permission
      if (hasPermission('viewParticipants')) {
        const participantData = await getEventParticipants(eventId)
        setParticipants(participantData)
      }
    } catch (error) {
      console.error('Failed to load event details:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId]) // Remove function dependencies to prevent loops

  useEffect(() => {
    // Only load once per eventId to prevent loops
    if (hasLoadedOnce.current !== eventId) {
      hasLoadedOnce.current = eventId
      loadEventDetails()
    }
  }, [eventId, loadEventDetails]) // Include loadEventDetails but it's stable now

  const handleBookEvent = async () => {
    if (!event || !user) return

    setBookingLoading(true)
    try {
      const success = await bookEvent(eventId, bookingForm)
      if (success) {
        setShowBookingForm(false)
        // Simple reload without calling loadEventDetails to prevent loops
        const eventData = await getEventById(eventId)
        setEvent(eventData)
      }
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!event) return

    const confirmed = window.confirm('確定要取消報名嗎？')
    if (!confirmed) return

    setBookingLoading(true)
    try {
      const success = await cancelBooking(eventId)
      if (success) {
        // Simple reload without calling loadEventDetails to prevent loops
        const eventData = await getEventById(eventId)
        setEvent(eventData)
      }
    } catch (error) {
      console.error('Cancel booking failed:', error)
    } finally {
      setBookingLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeLabel = (type: string) => {
    const typeLabels = {
      '1day_trip': '一日遊',
      '4hour_dining': '4小時餐敘',
      '2day_trip': '二日遊'
    }
    return typeLabels[type as keyof typeof typeLabels] || type
  }

  const getStatusBadge = () => {
    if (!event) return null

    const statusConfig = {
      draft: { 
        label: '草稿', 
        className: 'bg-luxury-platinum/20 text-luxury-platinum border border-luxury-platinum/30 backdrop-blur-sm' 
      },
      published: { 
        label: '開放報名', 
        className: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 backdrop-blur-sm shadow-lg' 
      },
      full: { 
        label: '名額已滿', 
        className: 'bg-red-500/20 text-red-100 border border-red-400/30 backdrop-blur-sm' 
      },
      completed: { 
        label: '已結束', 
        className: 'bg-gray-500/20 text-gray-100 border border-gray-400/30 backdrop-blur-sm' 
      },
      cancelled: { 
        label: '已取消', 
        className: 'bg-red-600/20 text-red-100 border border-red-500/30 backdrop-blur-sm' 
      }
    }
    
    const config = statusConfig[event.status] || statusConfig.draft
    return (
      <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${config.className} shadow-md`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-luxury-gold/20 rounded mb-6 w-1/4"></div>
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="h-8 bg-luxury-gold/20 rounded w-3/4"></div>
                <div className="h-4 bg-luxury-platinum/20 rounded w-1/2"></div>
                <div className="h-32 bg-luxury-platinum/10 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-luxury-gold/10 rounded"></div>
                  <div className="h-20 bg-luxury-gold/10 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-8 shadow-2xl max-w-md mx-auto">
              <h2 className="text-2xl font-luxury font-bold text-luxury-gold mb-4">找不到活動</h2>
              <p className="text-luxury-platinum/80 mb-6">抱歉，無法找到您要查看的活動詳情</p>
              <button 
                onClick={onBack} 
                className="bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-midnight-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
              >
                返回活動列表
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const participantCount = event.participants?.length || 0
  const availableSpots = event.maxParticipants - participantCount
  const isUserBooked = event.participants?.some(p => p.userId === user?._id) || false
  const canEdit = hasPermission('priorityBooking') && onEdit
  const canBook = isAuthenticated && event.status === 'published' && availableSpots > 0 && !isUserBooked

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial">
      <div className="container mx-auto px-4 py-8">
        {/* Luxury Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-luxury-platinum hover:text-luxury-gold transition-colors duration-300 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">返回活動列表</span>
          </button>

          <div className="flex items-center space-x-4">
            {getStatusBadge()}
            {canEdit && (
              <button
                onClick={() => onEdit!(eventId)}
                className="bg-luxury-platinum/10 hover:bg-luxury-platinum/20 text-luxury-platinum border border-luxury-platinum/30 hover:border-luxury-platinum/50 font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                編輯活動
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Luxury Event Header */}
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-8 shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-6 right-6 w-24 h-24 bg-luxury-gold rounded-full blur-2xl"></div>
                <div className="absolute bottom-6 left-6 w-20 h-20 bg-luxury-platinum rounded-full blur-xl"></div>
              </div>

              <div className="relative z-10">
                <h1 className="text-4xl font-luxury font-bold text-luxury-gold mb-2">
                  {event.name}
                </h1>
                <p className="text-luxury-platinum/80 text-lg mb-8">{event.metadata.category}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                    <div className="flex items-center text-luxury-platinum">
                      <svg className="w-6 h-6 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-luxury-gold text-sm">活動日期</div>
                        <div className="font-medium">{formatDate(new Date(event.metadata.date))}</div>
                        <div className="text-sm text-luxury-platinum/70">{formatTime(new Date(event.metadata.date))}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                    <div className="flex items-center text-luxury-platinum">
                      <svg className="w-6 h-6 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-luxury-gold text-sm">活動地點</div>
                        <div className="font-medium">{event.metadata.location}</div>
                        <div className="text-sm text-luxury-platinum/70">{getEventTypeLabel(event.metadata.type)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                    <div className="flex items-center text-luxury-platinum">
                      <svg className="w-6 h-6 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-luxury-gold text-sm">參與人數</div>
                        <div className="font-medium">{participantCount} / {event.maxParticipants}</div>
                        <div className="text-sm text-luxury-platinum/70">
                          {availableSpots > 0 ? `還有 ${availableSpots} 個名額` : '名額已滿'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                    <div className="flex items-center text-luxury-platinum">
                      <svg className="w-6 h-6 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <div>
                        <div className="font-semibold text-luxury-gold text-sm">活動費用</div>
                        <div className="font-medium">男性 NT$ {event.metadata.pricing.male.toLocaleString()}</div>
                        <div className="text-sm text-luxury-platinum/70">女性 NT$ {event.metadata.pricing.female.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Luxury Requirements Section */}
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl">
              <div className="text-center mb-4">
                <h3 className="text-luxury-gold font-luxury font-bold text-xl mb-2">參與條件</h3>
                <div className="w-16 h-px bg-luxury-gold mx-auto"></div>
              </div>
              <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-luxury-platinum">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></div>
                    <span>年齡限制: {event.metadata.requirements.ageMin}-{event.metadata.requirements.ageMax}歲</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></div>
                    <span>婚姻狀況: {
                      event.metadata.requirements.maritalStatus === 'single' ? '限單身' :
                      event.metadata.requirements.maritalStatus === 'divorced' ? '限離婚' : '不限'
                    }</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Luxury Schedule Information */}
            {event.metadata.schedule && (
              <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl">
                <div className="text-center mb-4">
                  <h3 className="text-luxury-gold font-luxury font-bold text-xl mb-2">活動系列</h3>
                  <div className="w-16 h-px bg-luxury-gold mx-auto"></div>
                </div>
                <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-luxury-platinum">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></div>
                      <span>頻率: {event.metadata.schedule.frequency === 'biweekly' ? '雙週' : event.metadata.schedule.frequency}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></div>
                      <span>週期: {event.metadata.schedule.cycle}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></div>
                      <span>總場次: {event.metadata.schedule.totalEvents}場</span>
                    </div>
                    {event.metadata.schedule.twoDayTrips > 0 && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></div>
                        <span>二日遊: {event.metadata.schedule.twoDayTrips}次</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Luxury Participant List (VVIP only) */}
            {hasPermission('viewParticipants') && participants.length > 0 && (
              <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-luxury-gold font-luxury font-bold text-xl mb-2">VVIP 專屬預覽</h3>
                  <div className="w-16 h-px bg-luxury-gold mx-auto mb-2"></div>
                  <p className="text-luxury-platinum/80 text-sm">參與者名單</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participants.map((participant, index) => (
                    <div key={index} className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center text-luxury-midnight-black font-bold mr-3">
                          {participant.name?.charAt(0) || (index + 1)}
                        </div>
                        <div>
                          <div className="font-medium text-luxury-platinum">{participant.name || `會員 ${index + 1}`}</div>
                          <div className="text-sm text-luxury-gold">
                            {participant.status === 'confirmed' ? '已確認' : 
                             participant.status === 'pending' ? '待確認' : '已取消'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Luxury Sidebar */}
          <div className="space-y-6">
            {/* Luxury Pricing Card */}
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-4 right-4 w-16 h-16 bg-luxury-gold rounded-full blur-xl"></div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-luxury-gold font-luxury font-bold text-xl mb-2">精緻定價</h3>
                  <div className="w-12 h-px bg-luxury-gold mx-auto"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-luxury-platinum/80">男性會員</span>
                      <span className="text-xl font-luxury font-bold text-luxury-gold">
                        NT$ {event.metadata.pricing.male.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-luxury-platinum/80">女性會員</span>
                      <span className="text-xl font-luxury font-bold text-luxury-gold">
                        NT$ {event.metadata.pricing.female.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Luxury Voucher Discounts */}
                  {(event.metadata.pricing.voucherDiscount['100'] > 0 || 
                    event.metadata.pricing.voucherDiscount['200'] > 0) && (
                    <div className="border-t border-luxury-gold/30 pt-4 mt-4">
                      <div className="text-center mb-3">
                        <div className="text-luxury-gold font-medium text-sm">優惠券折扣</div>
                      </div>
                      <div className="space-y-2">
                        {event.metadata.pricing.voucherDiscount['100'] > 0 && (
                          <div className="bg-luxury-platinum/10 border border-luxury-platinum/20 rounded-lg p-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-luxury-platinum">$100券折扣</span>
                              <span className="text-luxury-gold font-medium">-NT$ {event.metadata.pricing.voucherDiscount['100']}</span>
                            </div>
                          </div>
                        )}
                        {event.metadata.pricing.voucherDiscount['200'] > 0 && (
                          <div className="bg-luxury-platinum/10 border border-luxury-platinum/20 rounded-lg p-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-luxury-platinum">$200券折扣</span>
                              <span className="text-luxury-gold font-medium">-NT$ {event.metadata.pricing.voucherDiscount['200']}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Luxury Booking Actions */}
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-4 right-4 w-16 h-16 bg-luxury-gold rounded-full blur-xl"></div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-luxury-gold font-luxury font-bold text-xl mb-2">立即行動</h3>
                  <div className="w-12 h-px bg-luxury-gold mx-auto"></div>
                </div>
                
                <div className="text-center space-y-4">
                  {availableSpots > 0 ? (
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-3">
                      <div className="text-emerald-100 font-medium">
                        還有 {availableSpots} 個名額
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                      <div className="text-red-100 font-medium">名額已滿</div>
                    </div>
                  )}

                  {isUserBooked ? (
                    <div className="space-y-3">
                      <div className="bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg p-4">
                        <div className="flex items-center justify-center text-luxury-gold">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          您已成功報名此精彩活動
                        </div>
                      </div>
                      <button
                        onClick={handleCancelBooking}
                        disabled={bookingLoading}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-400/30 hover:border-red-400/50 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
                      >
                        {bookingLoading ? '處理中...' : '取消報名'}
                      </button>
                    </div>
                  ) : canBook ? (
                    <div className="space-y-3">
                      {!showBookingForm ? (
                        <button
                          onClick={() => setShowBookingForm(true)}
                          className="w-full bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-midnight-black font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          立即報名
                        </button>
                      ) : (
                        <div className="space-y-4">
                          {/* Luxury Booking Form */}
                          <div className="text-left space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-luxury-platinum mb-2">
                                特殊需求（選填）
                              </label>
                              <textarea
                                value={bookingForm.specialRequests || ''}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                                placeholder="如有特殊飲食需求或其他要求請說明..."
                                className="w-full h-20 bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-luxury-platinum mb-3">
                                緊急聯絡人
                              </label>
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  placeholder="姓名"
                                  value={bookingForm.emergencyContact?.name || ''}
                                  onChange={(e) => setBookingForm(prev => ({
                                    ...prev,
                                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                                  }))}
                                  className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                                />
                                <input
                                  type="tel"
                                  placeholder="電話號碼"
                                  value={bookingForm.emergencyContact?.phone || ''}
                                  onChange={(e) => setBookingForm(prev => ({
                                    ...prev,
                                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                                  }))}
                                  className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                                />
                                <input
                                  type="text"
                                  placeholder="關係（如：配偶、朋友）"
                                  value={bookingForm.emergencyContact?.relationship || ''}
                                  onChange={(e) => setBookingForm(prev => ({
                                    ...prev,
                                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                                  }))}
                                  className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-3 text-luxury-platinum placeholder-luxury-platinum/50 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-300"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <button
                              onClick={() => setShowBookingForm(false)}
                              className="flex-1 bg-luxury-platinum/10 hover:bg-luxury-platinum/20 text-luxury-platinum border border-luxury-platinum/30 hover:border-luxury-platinum/50 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleBookEvent}
                              disabled={bookingLoading}
                              className="flex-1 bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-midnight-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                              {bookingLoading ? '處理中...' : '確認報名'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !isAuthenticated ? (
                    <div className="bg-luxury-platinum/10 border border-luxury-platinum/20 rounded-lg p-4">
                      <div className="text-luxury-platinum/80">請先登入才能報名</div>
                    </div>
                  ) : event.status !== 'published' ? (
                    <div className="bg-luxury-platinum/10 border border-luxury-platinum/20 rounded-lg p-4">
                      <div className="text-luxury-platinum/80">活動未開放報名</div>
                    </div>
                  ) : (
                    <div className="bg-luxury-platinum/10 border border-luxury-platinum/20 rounded-lg p-4">
                      <div className="text-luxury-platinum/80">活動名額已滿</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Luxury Event Status */}
            <div className="bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial border border-luxury-gold/20 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-4 right-4 w-16 h-16 bg-luxury-platinum rounded-full blur-xl"></div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-luxury-gold font-luxury font-bold text-xl mb-2">活動資訊</h3>
                  <div className="w-12 h-px bg-luxury-gold mx-auto"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-luxury-platinum/80 text-sm font-medium">狀態</span>
                      <span>{getStatusBadge()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-platinum/10 border border-luxury-platinum/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-luxury-platinum/80 text-sm font-medium">通知已發送</span>
                      <span className={`text-sm font-semibold ${event.notifications.sent ? 'text-luxury-gold' : 'text-luxury-platinum'}`}>
                        {event.notifications.sent ? '是' : '否'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-platinum/10 border border-luxury-platinum/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-luxury-platinum/80 text-sm font-medium">創建時間</span>
                      <span className="text-luxury-platinum text-sm font-semibold">
                        {new Date(event.createdAt).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}