// Event Detail Page with Booking Flow
import React, { useState, useEffect } from 'react'
import type { EventData, BookingData } from '../../shared-types'
import { useAuthStore } from '../../store/authStore'
import { useEvents } from '../../hooks/useEvents'

interface EventDetailProps {
  eventId: string
  onBack: () => void
  onEdit?: (eventId: string) => void
}

export const EventDetail: React.FC<EventDetailProps> = ({
  eventId,
  onBack,
  onEdit
}) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  
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

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const loadEventDetails = async () => {
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
  }

  const handleBookEvent = async () => {
    if (!event || !user) return

    setBookingLoading(true)
    try {
      const success = await bookEvent(eventId, bookingForm)
      if (success) {
        setShowBookingForm(false)
        await loadEventDetails() // Refresh event data
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
        await loadEventDetails() // Refresh event data
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
      draft: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
      published: { label: '開放報名', className: 'bg-green-100 text-green-700' },
      full: { label: '名額已滿', className: 'bg-red-100 text-red-700' },
      completed: { label: '已結束', className: 'bg-gray-100 text-gray-500' },
      cancelled: { label: '已取消', className: 'bg-red-100 text-red-500' }
    }
    
    const config = statusConfig[event.status] || statusConfig.draft
    return (
      <span className={`px-4 py-2 text-sm font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
        <div className="container-luxury section-luxury">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="card-luxury p-8">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
        <div className="container-luxury section-luxury">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">找不到活動</h2>
            <button onClick={onBack} className="btn-luxury">
              返回活動列表
            </button>
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
    <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
      <div className="container-luxury section-luxury">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回活動列表
          </button>

          <div className="flex items-center space-x-3">
            {getStatusBadge()}
            {canEdit && (
              <button
                onClick={() => onEdit!(eventId)}
                className="btn-luxury-outline"
              >
                編輯活動
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div className="card-luxury p-8">
              <h1 className="text-3xl font-bold text-gradient-luxury mb-4">
                {event.name}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium">{formatDate(new Date(event.metadata.date))}</div>
                    <div className="text-sm">{formatTime(new Date(event.metadata.date))}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium">{event.metadata.location}</div>
                    <div className="text-sm">{event.metadata.category}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <div>
                    <div className="font-medium">{getEventTypeLabel(event.metadata.type)}</div>
                    <div className="text-sm">活動類型</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="font-medium">{participantCount} / {event.maxParticipants}</div>
                    <div className="text-sm">參與人數</div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-luxury-champagne/30 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">參與條件</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>年齡限制: {event.metadata.requirements.ageMin}-{event.metadata.requirements.ageMax}歲</div>
                  <div>婚姻狀況: {
                    event.metadata.requirements.maritalStatus === 'single' ? '單身' :
                    event.metadata.requirements.maritalStatus === 'divorced' ? '離婚' : '不限'
                  }</div>
                </div>
              </div>

              {/* Schedule Information */}
              {event.metadata.schedule && (
                <div className="bg-luxury-pearl/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">活動系列</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>頻率: {event.metadata.schedule.frequency === 'biweekly' ? '雙週' : event.metadata.schedule.frequency}</div>
                    <div>週期: {event.metadata.schedule.cycle}</div>
                    <div>總場次: {event.metadata.schedule.totalEvents}場</div>
                    {event.metadata.schedule.twoDayTrips > 0 && (
                      <div>二日遊: {event.metadata.schedule.twoDayTrips}次</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Participant List (Premium only) */}
            {hasPermission('viewParticipants') && participants.length > 0 && (
              <div className="card-luxury p-8">
                <h3 className="text-xl font-semibold mb-4">參與者名單</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {participant.name?.charAt(0) || (index + 1)}
                      </div>
                      <div>
                        <div className="font-medium">{participant.name || `參與者 ${index + 1}`}</div>
                        <div className="text-sm text-gray-600">
                          {participant.status === 'confirmed' ? '已確認' : 
                           participant.status === 'pending' ? '待確認' : '已取消'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="card-luxury p-6">
              <h3 className="text-lg font-semibold mb-4">活動費用</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">男性費用</span>
                  <span className="text-xl font-bold text-luxury-gold">
                    NT$ {event.metadata.pricing.male.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">女性費用</span>
                  <span className="text-xl font-bold text-luxury-gold">
                    NT$ {event.metadata.pricing.female.toLocaleString()}
                  </span>
                </div>

                {/* Voucher Discounts */}
                {(event.metadata.pricing.voucherDiscount['100'] > 0 || 
                  event.metadata.pricing.voucherDiscount['200'] > 0) && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">票券折扣</div>
                    {event.metadata.pricing.voucherDiscount['100'] > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">$100券折扣</span>
                        <span className="text-green-600">-NT$ {event.metadata.pricing.voucherDiscount['100']}</span>
                      </div>
                    )}
                    {event.metadata.pricing.voucherDiscount['200'] > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">$200券折扣</span>
                        <span className="text-green-600">-NT$ {event.metadata.pricing.voucherDiscount['200']}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Actions */}
            <div className="card-luxury p-6">
              <div className="text-center space-y-4">
                {availableSpots > 0 ? (
                  <div className="text-green-600 font-medium">
                    還有 {availableSpots} 個名額
                  </div>
                ) : (
                  <div className="text-red-600 font-medium">名額已滿</div>
                )}

                {isUserBooked ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        您已成功報名此活動
                      </div>
                    </div>
                    <button
                      onClick={handleCancelBooking}
                      disabled={bookingLoading}
                      className="w-full btn-luxury-outline text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {bookingLoading ? '處理中...' : '取消報名'}
                    </button>
                  </div>
                ) : canBook ? (
                  <div className="space-y-3">
                    {!showBookingForm ? (
                      <button
                        onClick={() => setShowBookingForm(true)}
                        className="w-full btn-luxury"
                      >
                        立即報名
                      </button>
                    ) : (
                      <div className="space-y-4">
                        {/* Booking Form */}
                        <div className="text-left space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              特殊需求（選填）
                            </label>
                            <textarea
                              value={bookingForm.specialRequests || ''}
                              onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                              placeholder="如有特殊飲食需求或其他要求請說明..."
                              className="input-luxury w-full h-20"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              緊急聯絡人
                            </label>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="姓名"
                                value={bookingForm.emergencyContact?.name || ''}
                                onChange={(e) => setBookingForm(prev => ({
                                  ...prev,
                                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                                }))}
                                className="input-luxury w-full"
                              />
                              <input
                                type="tel"
                                placeholder="電話號碼"
                                value={bookingForm.emergencyContact?.phone || ''}
                                onChange={(e) => setBookingForm(prev => ({
                                  ...prev,
                                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                                }))}
                                className="input-luxury w-full"
                              />
                              <input
                                type="text"
                                placeholder="關係（如：配偶、朋友）"
                                value={bookingForm.emergencyContact?.relationship || ''}
                                onChange={(e) => setBookingForm(prev => ({
                                  ...prev,
                                  emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                                }))}
                                className="input-luxury w-full"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => setShowBookingForm(false)}
                            className="flex-1 btn-luxury-outline"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleBookEvent}
                            disabled={bookingLoading}
                            className="flex-1 btn-luxury"
                          >
                            {bookingLoading ? '處理中...' : '確認報名'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-gray-500">請先登入才能報名</div>
                ) : event.status !== 'published' ? (
                  <div className="text-gray-500">活動未開放報名</div>
                ) : (
                  <div className="text-gray-500">活動名額已滿</div>
                )}
              </div>
            </div>

            {/* Event Status */}
            <div className="card-luxury p-6">
              <h3 className="text-lg font-semibold mb-4">活動狀態</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">狀態</span>
                  <span>{getStatusBadge()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">通知已發送</span>
                  <span>{event.notifications.sent ? '是' : '否'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">創建時間</span>
                  <span>{new Date(event.createdAt).toLocaleDateString('zh-TW')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}