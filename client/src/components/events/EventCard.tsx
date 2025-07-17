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
      <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${config.className} shadow-md`}>
        {config.label}
      </span>
    )
  }

  const canViewParticipants = hasPermission('viewParticipants')
  const participantCount = event.participants?.length || 0
  const availableSpots = event.maxParticipants - participantCount
  const isUserBooked = event.participants?.some(p => p.userId === user?._id) || false

  // Get luxury card styling based on event type
  const getCardClass = () => {
    return 'bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial shadow-2xl border border-luxury-gold/20 rounded-xl overflow-hidden'
  }

  return (
    <div className={`${getCardClass()} group hover:shadow-luxury transition-all duration-300 hover:-translate-y-1`}>
      {/* Luxury Gold Border Accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold/30 via-transparent to-luxury-gold/30 p-[1px] rounded-xl">
        <div className="w-full h-full bg-gradient-to-br from-luxury-midnight-black via-luxury-deep-blue to-luxury-imperial rounded-xl"></div>
      </div>
      
      <div className="relative p-6">
        {/* Luxury Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-4 right-4 w-20 h-20 bg-luxury-gold rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-luxury-platinum rounded-full blur-xl"></div>
        </div>

        {/* Header with Status */}
        <div className="relative z-10 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-4">
              <h3 className="text-xl font-luxury font-bold text-luxury-gold mb-1 group-hover:text-luxury-platinum transition-colors duration-300">
                {event.name}
              </h3>
              <div className="text-sm text-luxury-platinum/80 font-medium">
                {event.metadata.category}
              </div>
            </div>
            {getStatusBadge()}
          </div>
          
          {/* Date and Time */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-luxury-platinum/90">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-luxury-gold rounded-full"></div>
              <span>{formatDate(new Date(event.metadata.date))}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-luxury-gold rounded-full"></div>
              <span>{formatTime(new Date(event.metadata.date))}</span>
            </div>
          </div>
        </div>

        {/* Event Information Grid */}
        <div className="relative z-10 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Event Type */}
            <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-3">
              <div className="text-xs text-luxury-gold font-medium mb-1">活動類型</div>
              <div className="text-sm text-luxury-platinum font-semibold">
                {getEventTypeLabel(event.metadata.type)}
              </div>
            </div>
            
            {/* Location */}
            <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-3">
              <div className="text-xs text-luxury-gold font-medium mb-1">地點</div>
              <div className="text-sm text-luxury-platinum font-semibold">
                {event.metadata.location}
              </div>
            </div>
          </div>

          {/* Luxury Pricing Section */}
          <div className="bg-gradient-to-r from-luxury-gold/15 to-luxury-platinum/10 border border-luxury-gold/25 rounded-lg p-4 mb-4">
            <div className="text-center mb-3">
              <div className="text-luxury-gold text-xs font-medium tracking-wider uppercase mb-1">精緻定價</div>
              <div className="w-12 h-px bg-luxury-gold mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-luxury-platinum/70 text-xs mb-1">男性會員</div>
                <div className="text-luxury-gold font-luxury font-bold text-lg">
                  NT$ {event.metadata.pricing.male.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-luxury-platinum/70 text-xs mb-1">女性會員</div>
                <div className="text-luxury-gold font-luxury font-bold text-lg">
                  NT$ {event.metadata.pricing.female.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Voucher Discounts */}
            {(event.metadata.pricing.voucherDiscount['100'] > 0 || 
              event.metadata.pricing.voucherDiscount['200'] > 0) && (
              <div className="mt-3 pt-3 border-t border-luxury-gold/30">
                <div className="text-xs text-luxury-gold font-medium text-center mb-2">優惠券折扣</div>
                <div className="flex justify-center gap-2 text-xs">
                  {event.metadata.pricing.voucherDiscount['100'] > 0 && (
                    <span className="bg-luxury-gold/20 text-luxury-gold px-2 py-1 rounded border border-luxury-gold/30">
                      $100券 -NT${event.metadata.pricing.voucherDiscount['100']}
                    </span>
                  )}
                  {event.metadata.pricing.voucherDiscount['200'] > 0 && (
                    <span className="bg-luxury-gold/20 text-luxury-gold px-2 py-1 rounded border border-luxury-gold/30">
                      $200券 -NT${event.metadata.pricing.voucherDiscount['200']}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Participant Counter */}
          <div className="bg-luxury-platinum/10 border border-luxury-platinum/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-luxury-platinum/70 font-medium mb-1">參與人數</div>
                <div className="text-luxury-platinum font-bold text-lg">
                  {participantCount} / {event.maxParticipants}
                </div>
              </div>
              <div className="text-right">
                {availableSpots > 0 ? (
                  <div className="text-xs text-luxury-gold font-medium">
                    還有 {availableSpots} 個名額
                  </div>
                ) : (
                  <div className="text-xs text-red-400 font-medium">名額已滿</div>
                )}
              </div>
            </div>
          </div>

          {/* Participant List Preview (Premium only) */}
          {canViewParticipants && showParticipants && participantCount > 0 && (
            <div className="bg-luxury-imperial/20 border border-luxury-imperial/30 rounded-lg p-4 mt-4">
              <div className="text-center mb-3">
                <div className="text-luxury-gold text-xs font-medium tracking-wider uppercase mb-1">VVIP 專屬預覽</div>
                <div className="w-8 h-px bg-luxury-gold mx-auto"></div>
              </div>
              <div className="flex justify-center flex-wrap gap-2">
                {event.participants?.slice(0, 3).map((participant, index) => (
                  <span key={index} className="text-xs bg-luxury-gold/20 text-luxury-gold px-3 py-1 rounded-full border border-luxury-gold/30">
                    會員 {index + 1}
                  </span>
                ))}
                {participantCount > 3 && (
                  <span className="text-xs text-luxury-platinum font-medium">
                    +{participantCount - 3} 位會員
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Age Requirements */}
          <div className="bg-luxury-deep-blue/30 border border-luxury-deep-blue/40 rounded-lg p-3 mt-4">
            <div className="text-center">
              <div className="text-luxury-platinum/80 text-xs font-medium">
                年齡要求: {event.metadata.requirements.ageMin}-{event.metadata.requirements.ageMax}歲
                {event.metadata.requirements.maritalStatus !== 'any' && 
                  ` • ${event.metadata.requirements.maritalStatus === 'single' ? '限單身' : '限離婚'}`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Luxury Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-luxury-gold/20 relative z-10">
          <button
            onClick={() => onViewDetails(event._id!)}
            className="flex-1 bg-luxury-platinum/10 hover:bg-luxury-platinum/20 text-luxury-platinum border border-luxury-platinum/30 hover:border-luxury-platinum/50 font-semibold py-3 px-4 rounded-lg transition-all duration-200 will-change-auto group"
          >
            <span className="flex items-center justify-center space-x-2 text-sm">
              <span>查看詳情</span>
            </span>
          </button>
          
          {event.status === 'published' && availableSpots > 0 && onBookEvent && (
            <button
              onClick={() => onBookEvent(event._id!)}
              disabled={isUserBooked}
              className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-200 will-change-auto group ${
                isUserBooked 
                  ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 cursor-not-allowed' 
                  : 'bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-midnight-black border border-luxury-gold shadow-lg hover:shadow-xl'
              }`}
            >
              <span className="flex items-center justify-center space-x-2 text-sm font-bold">
                {isUserBooked ? (
                  <span>已報名</span>
                ) : (
                  <span>立即報名</span>
                )}
              </span>
            </button>
          )}
        </div>

        {/* Booking Confirmation */}
        {isUserBooked && (
          <div className="mt-4 p-3 bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg">
            <div className="flex items-center justify-center text-sm text-luxury-gold font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              您已成功報名此精彩活動
            </div>
          </div>
        )}
      </div>
    </div>
  )
}