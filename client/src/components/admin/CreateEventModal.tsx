// Create Event Modal with Event Types Dropdown
import React, { useState, useEffect, useRef } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { buildUrl, API_ENDPOINTS } from '../../config/api'
import DatePicker, { DatePickerHandle } from '../common/DatePicker'

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

interface CreateEventModalProps {
  onClose: () => void
  onEventCreated: () => void
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onEventCreated }) => {
  const { apiCall } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loadingEventTypes, setLoadingEventTypes] = useState(true)
  const datePickerRef = useRef<DatePickerHandle>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dateTime: new Date(),
    location: '',
    category: '',
    type: '1day_trip' as '1day_trip' | '4hour_dining' | '2day_trip',
    maxParticipants: '',
    pricing: {
      male: '',
      female: '',
      voucherDiscount: {
        '100': '',
        '200': ''
      }
    },
    requirements: {
      ageMin: '',
      ageMax: '',
      maritalStatus: 'any' as 'single' | 'divorced' | 'any'
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
        // Failed to fetch event types
      } finally {
        setLoadingEventTypes(false)
      }
    }

    fetchEventTypes()
  }, [])

  // Auto-fill pricing when event type is selected
  const handleCategoryChange = (eventTypeName: string) => {
    setFormData({...formData, category: eventTypeName})
    
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
        participants: [],
        maxParticipants: parseInt(formData.maxParticipants) || undefined,
        status: 'draft' as const,
        participantVisibility: {
          vvip: true,
          vip: true,
          registered: true,
          visitor: false
        }
      }

      const response = await apiCall('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      })

      const result = await response.json()
      
      if (result.success) {
        onEventCreated()
        onClose()
      } else {
        throw new Error(result.error || '創建活動失敗')
      }
    } catch (error) {
      alert('創建活動失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-luxury-midnight-black border border-luxury-gold/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-luxury-gold">新增活動</h3>
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

            {/* Date and Time */}
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

            {/* Location and Participants */}
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

            {/* Pricing */}
            <div>
              <h4 className="text-lg font-semibold text-luxury-gold mb-4">價格設定</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-luxury-platinum mb-2">
                    男性價格 (NT$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.male}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: {...formData.pricing, male: e.target.value}
                    })}
                    className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-platinum mb-2">
                    女性價格 (NT$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.female}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: {...formData.pricing, female: e.target.value}
                    })}
                    className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-platinum mb-2">
                    100元券折扣
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.voucherDiscount['100']}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: {
                        ...formData.pricing,
                        voucherDiscount: {...formData.pricing.voucherDiscount, '100': e.target.value}
                      }
                    })}
                    className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-platinum mb-2">
                    200元券折扣
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.voucherDiscount['200']}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: {
                        ...formData.pricing,
                        voucherDiscount: {...formData.pricing.voucherDiscount, '200': e.target.value}
                      }
                    })}
                    className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="text-lg font-semibold text-luxury-gold mb-4">參與條件</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-luxury-platinum mb-2">
                    最低年齡
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={formData.requirements.ageMin}
                    onChange={(e) => setFormData({
                      ...formData,
                      requirements: {...formData.requirements, ageMin: e.target.value}
                    })}
                    className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                    placeholder="18"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-platinum mb-2">
                    最高年齡
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={formData.requirements.ageMax}
                    onChange={(e) => setFormData({
                      ...formData,
                      requirements: {...formData.requirements, ageMax: e.target.value}
                    })}
                    className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                    placeholder="65"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-luxury-platinum mb-2">
                    婚姻狀況
                  </label>
                  <select
                    value={formData.requirements.maritalStatus}
                    onChange={(e) => setFormData({
                      ...formData,
                      requirements: {...formData.requirements, maritalStatus: e.target.value as typeof formData.requirements.maritalStatus}
                    })}
                    className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
                  >
                    <option value="any">不限</option>
                    <option value="single">單身</option>
                    <option value="divorced">離異</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
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
                {loading ? '創建中...' : '創建活動'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}