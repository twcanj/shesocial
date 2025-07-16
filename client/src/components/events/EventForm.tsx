// Event Form Component for Create/Edit Operations (VIP+ only)
import React, { useState, useEffect, useCallback } from 'react'
import type { EventData } from '../../shared-types'
import { useEvents } from '../../hooks/useEvents'

interface EventFormProps {
  eventId?: string // If provided, edit mode; otherwise create mode
  onSave: (event: EventData) => void
  onCancel: () => void
}

export const EventForm: React.FC<EventFormProps> = ({
  eventId,
  onSave,
  onCancel
}) => {
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
    const { getEventById, createEvent, updateEvent } = useEvents()

  // Check permissions using user membership
    const hasPermission = () => {
    // For now, assume VIP+ can create events
    return true // TODO: Implement proper permission checking
  }

  // Form state
  const [formData, setFormData] = useState<Partial<EventData>>({
    name: '',
    metadata: {
      date: new Date(),
      location: '',
      category: '',
      type: '4hour_dining',
      pricing: {
        male: 0,
        female: 0,
        voucherDiscount: {
          '100': 0,
          '200': 0
        }
      },
      requirements: {
        ageMin: 25,
        ageMax: 45,
        maritalStatus: 'any'
      },
      schedule: {
        frequency: 'biweekly',
        cycle: '3months',
        totalEvents: 6,
        twoDayTrips: 1
      }
    },
    maxParticipants: 20,
    status: 'draft',
    participantVisibility: {
      vvip: true,
      vip: false,
      registered: false,
      visitor: false
    }
  })

  const isEditMode = !!eventId
  const canSubmit = hasPermission()

  // Taiwan cities
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

  const maritalStatusOptions = [
    { value: 'any', label: '不限' },
    { value: 'single', label: '單身' },
    { value: 'divorced', label: '離婚' }
  ]

  const loadEventData = useCallback(async () => {
    if (!eventId) return;
    setLoading(true)
    try {
      const event = await getEventById(eventId)
      if (event) {
        setFormData(event)
      }
    } catch (error) {
      setError('載入活動資料失敗')
    } finally {
      setLoading(false)
    }
  }, [eventId, getEventById])

  // Load existing event data for edit mode
  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit) {
      setError('您沒有權限創建或編輯活動')
      return
    }

    setSubmitLoading(true)
    setError(null)

    try {
      const eventData: EventData = {
        ...formData as EventData,
        updatedAt: new Date(),
        participants: formData.participants || [],
        notifications: formData.notifications || {
          sent: false,
          recipients: []
        }
      }

      let result: EventData | boolean
      
      if (isEditMode) {
        result = await updateEvent(eventId!, eventData)
        if (result) {
          const updatedEvent = await getEventById(eventId!)
          if (updatedEvent) {
            onSave(updatedEvent)
          }
        }
      } else {
        result = await createEvent(eventData)
        if (result && typeof result === 'object') {
          onSave(result)
        }
      }

      if (!result) {
        setError(isEditMode ? '更新活動失敗' : '創建活動失敗')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '操作失敗')
    } finally {
      setSubmitLoading(false)
    }
  }

  const updateFormData = (path: string, value: string | number | boolean | Date) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
            let current: Record<string, unknown> = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {} as any
        }
        current = current[keys[i]] as Record<string, unknown>
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  if (!canSubmit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
        <div className="container-luxury section-luxury">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">權限不足</h2>
            <p className="text-gray-600 mb-6">您需要VIP或以上會員資格才能創建活動</p>
            <button onClick={onCancel} className="btn-luxury">
              返回
            </button>
          </div>
        </div>
      </div>
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
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
      <div className="container-luxury section-luxury">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gradient-luxury">
            {isEditMode ? '編輯活動' : '創建新活動'}
          </h1>
          <button
            onClick={onCancel}
            className="btn-luxury-outline"
          >
            取消
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card-luxury p-8">
            <h2 className="text-xl font-semibold mb-6">基本資訊</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="輸入活動名稱..."
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動日期 *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.metadata?.date ? new Date(formData.metadata.date).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateFormData('metadata.date', new Date(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動地點 *
                </label>
                <select
                  required
                  value={formData.metadata?.location || ''}
                  onChange={(e) => updateFormData('metadata.location', e.target.value)}
                  className="input-luxury w-full"
                >
                  <option value="">選擇地點</option>
                  {taiwanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動類型 *
                </label>
                <select
                  required
                  value={formData.metadata?.type || ''}
                  onChange={(e) => updateFormData('metadata.type', e.target.value)}
                  className="input-luxury w-full"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動類別 *
                </label>
                <select
                  required
                  value={formData.metadata?.category || ''}
                  onChange={(e) => updateFormData('metadata.category', e.target.value)}
                  className="input-luxury w-full"
                >
                  <option value="">選擇類別</option>
                  {eventCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大參與人數 *
                </label>
                <input
                  type="number"
                  required
                  min="2"
                  max="100"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => updateFormData('maxParticipants', parseInt(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動狀態
                </label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className="input-luxury w-full"
                >
                  <option value="draft">草稿</option>
                  <option value="published">發布</option>
                  <option value="cancelled">取消</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card-luxury p-8">
            <h2 className="text-xl font-semibold mb-6">費用設定</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  男性費用 (NT$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.metadata?.pricing?.male || ''}
                  onChange={(e) => updateFormData('metadata.pricing.male', parseInt(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  女性費用 (NT$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.metadata?.pricing?.female || ''}
                  onChange={(e) => updateFormData('metadata.pricing.female', parseInt(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  $100券折扣 (NT$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.metadata?.pricing?.voucherDiscount?.['100'] || ''}
                  onChange={(e) => updateFormData('metadata.pricing.voucherDiscount.100', parseInt(e.target.value) || 0)}
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  $200券折扣 (NT$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.metadata?.pricing?.voucherDiscount?.['200'] || ''}
                  onChange={(e) => updateFormData('metadata.pricing.voucherDiscount.200', parseInt(e.target.value) || 0)}
                  className="input-luxury w-full"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="card-luxury p-8">
            <h2 className="text-xl font-semibold mb-6">參與條件</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最小年齡 *
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="99"
                  value={formData.metadata?.requirements?.ageMin || ''}
                  onChange={(e) => updateFormData('metadata.requirements.ageMin', parseInt(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大年齡 *
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="99"
                  value={formData.metadata?.requirements?.ageMax || ''}
                  onChange={(e) => updateFormData('metadata.requirements.ageMax', parseInt(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  婚姻狀況
                </label>
                <select
                  value={formData.metadata?.requirements?.maritalStatus || 'any'}
                  onChange={(e) => updateFormData('metadata.requirements.maritalStatus', e.target.value)}
                  className="input-luxury w-full"
                >
                  {maritalStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Participant Visibility */}
          <div className="card-luxury p-8">
            <h2 className="text-xl font-semibold mb-6">參與者可見性</h2>
            <p className="text-sm text-gray-600 mb-4">設定哪些會員等級可以查看參與者名單</p>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.participantVisibility?.vvip || false}
                  onChange={(e) => updateFormData('participantVisibility.vvip', e.target.checked)}
                  className="mr-3"
                />
                <span>VVIP 會員</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.participantVisibility?.vip || false}
                  onChange={(e) => updateFormData('participantVisibility.vip', e.target.checked)}
                  className="mr-3"
                />
                <span>VIP 會員</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.participantVisibility?.registered || false}
                  onChange={(e) => updateFormData('participantVisibility.registered', e.target.checked)}
                  className="mr-3"
                />
                <span>註冊會員</span>
              </label>
            </div>
          </div>

          {/* Schedule (for series events) */}
          <div className="card-luxury p-8">
            <h2 className="text-xl font-semibold mb-6">活動系列設定</h2>
            <p className="text-sm text-gray-600 mb-4">如果這是系列活動的一部分，請設定相關資訊</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  頻率
                </label>
                <select
                  value={formData.metadata?.schedule?.frequency || 'biweekly'}
                  onChange={(e) => updateFormData('metadata.schedule.frequency', e.target.value)}
                  className="input-luxury w-full"
                >
                  <option value="weekly">每週</option>
                  <option value="biweekly">雙週</option>
                  <option value="monthly">每月</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  週期
                </label>
                <select
                  value={formData.metadata?.schedule?.cycle || '3months'}
                  onChange={(e) => updateFormData('metadata.schedule.cycle', e.target.value)}
                  className="input-luxury w-full"
                >
                  <option value="1month">1個月</option>
                  <option value="3months">3個月</option>
                  <option value="6months">6個月</option>
                  <option value="1year">1年</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  總場次
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.metadata?.schedule?.totalEvents || ''}
                  onChange={(e) => updateFormData('metadata.schedule.totalEvents', parseInt(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  二日遊次數
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.metadata?.schedule?.twoDayTrips || ''}
                  onChange={(e) => updateFormData('metadata.schedule.twoDayTrips', parseInt(e.target.value))}
                  className="input-luxury w-full"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-luxury-outline"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="btn-luxury"
            >
              {submitLoading ? '處理中...' : (isEditMode ? '更新活動' : '創建活動')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
