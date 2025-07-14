// Event Card Component - Luxury design for Taiwan social events
import React from 'react'
import type { EventData } from '../../shared-types'
import { useAuthStore } from '../../store/authStore'

interface EventCardProps {
  event: EventData
  onViewDetails: (eventId: string) => void
  onBookEvent?: (eventId: string) => void
  showParticipants?: boolean
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onBookEvent,
  showParticipants = false
}) => {
  const { user, hasPermission } = useAuthStore()

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
    const statusConfig = {
      draft: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
      published: { label: '開放報名', className: 'bg-green-100 text-green-700' },
      full: { label: '名額已滿', className: 'bg-red-100 text-red-700' },
      completed: { label: '已結束', className: 'bg-gray-100 text-gray-500' },
      cancelled: { label: '已取消', className: 'bg-red-100 text-red-500' }
    }
    
    const config = statusConfig[event.status] || statusConfig.draft
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const canViewParticipants = hasPermission('viewParticipants')
  const participantCount = event.participants?.length || 0
  const availableSpots = event.maxParticipants - participantCount
  const isUserBooked = event.participants?.some(p => p.userId === user?._id) || false

  // Get balanced 4-element card class
  const getCardClass = () => {
    // Map event characteristics to our 4 balanced elements for visual harmony
    
    // ✨ LUXURY Element - Premium & VIP (Purple)
    if (event.metadata.type === '2day_trip') return 'card-luxury'
    if (event.metadata.category === '旅遊探索') return 'card-luxury'
    if (event.metadata.category === '商務社交') return 'card-luxury'
    
    // 💙 CONNECTION Element - Social & Communication (Blue)  
    if (event.metadata.category === '美食饗宴') return 'card-connection'
    if (event.metadata.category === '文化藝術') return 'card-connection'
    if (event.metadata.category === '音樂娛樂') return 'card-connection'
    
    // 🌱 GROWTH Element - Health & Learning (Green)
    if (event.metadata.category === '戶外活動') return 'card-growth'
    if (event.metadata.category === '健康養生') return 'card-growth'
    if (event.metadata.category === '學習成長') return 'card-growth'
    
    // 🔥 PASSION Element - Hobbies & Sports (Coral)
    if (event.metadata.category === '興趣愛好') return 'card-passion'
    if (event.metadata.category === '運動休閒') return 'card-passion'
    
    // Default fallback
    return 'card-passion'  // 🔥 Default for any other activities
  }

  return (
    <div className={`${getCardClass()}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">
              {event.name}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-white/80">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(new Date(event.metadata.date))}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(new Date(event.metadata.date))}
              </span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">活動類型</span>
            <span className="text-sm font-medium text-white">
              {getEventTypeLabel(event.metadata.type)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">地點</span>
            <span className="text-sm font-medium text-white">{event.metadata.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">類別</span>
            <span className="text-sm font-medium text-white">{event.metadata.category}</span>
          </div>

          {/* Pricing */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mt-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-white/70">男性費用</span>
                <div className="font-semibold text-white">
                  NT$ {event.metadata.pricing.male.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-white/70">女性費用</span>
                <div className="font-semibold text-white">
                  NT$ {event.metadata.pricing.female.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Voucher Discounts */}
            {(event.metadata.pricing.voucherDiscount['100'] > 0 || 
              event.metadata.pricing.voucherDiscount['200'] > 0) && (
              <div className="mt-2 pt-2 border-t border-yellow-600/20">
                <div className="text-xs text-gray-600 mb-1">票券折扣</div>
                <div className="flex space-x-3 text-xs">
                  {event.metadata.pricing.voucherDiscount['100'] > 0 && (
                    <span className="text-green-600">
                      $100券 折NT$ {event.metadata.pricing.voucherDiscount['100']}
                    </span>
                  )}
                  {event.metadata.pricing.voucherDiscount['200'] > 0 && (
                    <span className="text-green-600">
                      $200券 折NT$ {event.metadata.pricing.voucherDiscount['200']}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Participant Info */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-600">參與人數</span>
            <div className="text-right">
              <div className="text-sm font-medium">
                {participantCount} / {event.maxParticipants}
              </div>
              {availableSpots > 0 ? (
                <div className="text-xs text-green-600">
                  還有 {availableSpots} 個名額
                </div>
              ) : (
                <div className="text-xs text-red-600">名額已滿</div>
              )}
            </div>
          </div>

          {/* Participant List Preview (Premium only) */}
          {canViewParticipants && showParticipants && participantCount > 0 && (
            <div className="bg-luxury-pearl/30 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2">參與者預覽</div>
              <div className="flex flex-wrap gap-1">
                {event.participants?.slice(0, 3).map((participant, index) => (
                  <span key={index} className="text-xs bg-white px-2 py-1 rounded">
                    參與者 {index + 1}
                  </span>
                ))}
                {participantCount > 3 && (
                  <span className="text-xs text-gray-500">
                    +{participantCount - 3} 更多
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Age Requirements */}
          <div className="text-xs text-gray-500">
            年齡限制: {event.metadata.requirements.ageMin}-{event.metadata.requirements.ageMax}歲
            {event.metadata.requirements.maritalStatus !== 'any' && 
              ` • ${event.metadata.requirements.maritalStatus === 'single' ? '單身' : '離婚'}`
            }
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => onViewDetails(event._id!)}
            className="flex-1 btn-luxury-outline text-sm py-2"
          >
            查看詳情
          </button>
          
          {event.status === 'published' && availableSpots > 0 && onBookEvent && (
            <button
              onClick={() => onBookEvent(event._id!)}
              disabled={isUserBooked}
              className={`flex-1 text-sm py-2 ${
                isUserBooked 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'btn-luxury'
              }`}
            >
              {isUserBooked ? '已報名' : '立即報名'}
            </button>
          )}
        </div>

        {/* User Booking Status */}
        {isUserBooked && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-sm text-green-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              您已成功報名此活動
            </div>
          </div>
        )}
      </div>
    </div>
  )
}