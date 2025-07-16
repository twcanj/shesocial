// Interview Booking System for New Members
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface InterviewSlot {
  _id: string
  interviewerId: string
  interviewerName: string
  date: string
  startTime: string
  endTime: string
  duration: number
  interviewType: 'video_call' | 'phone_call' | 'in_person'
  isAvailable: boolean
  capacity: number
  bookedCount: number
  meetingUrl?: string
}

// Alias for compatibility
type AppointmentSlot = InterviewSlot

interface InterviewBookingProps {
  onBookingComplete?: (sessionId: string) => void
}

export const InterviewBooking: React.FC<InterviewBookingProps> = ({
  onBookingComplete
}) => {
  const { user } = useAuth()
  const [availableSlots, setAvailableSlots] = useState<InterviewSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [applicationData, setApplicationData] = useState({
    membershipType: 'regular' as const,
    referralSource: '',
    motivation: '',
    expectations: ''
  })

  useEffect(() => {
    fetchAvailableSlots()
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 60 days from now
      
      const response = await fetch(`/api/appointments/slots/available?type=member_interview&startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.slots || [])
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookInterview = async () => {
    if (!selectedSlot || !user) return

    setBooking(true)
    try {
      const bookingData = {
        slotId: selectedSlot._id,
        type: 'member_interview',
        notes: applicationData.motivation,
        additionalInfo: {
          membershipType: applicationData.membershipType,
          referralSource: applicationData.referralSource,
          expectations: applicationData.expectations
        }
      }

      const response = await fetch('/api/appointments/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        const result = await response.json()
        alert('面試預約成功！您將收到確認電子郵件。')
        onBookingComplete?.(result.booking?._id)
      } else {
        const error = await response.json()
        alert(error.error || '預約失敗，請稍後再試')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('預約失敗，請稍後再試')
    } finally {
      setBooking(false)
    }
  }

  const getTypeDisplayName = (type: string) => {
    const typeNames = {
      video_call: '視訊通話',
      phone_call: '電話面試',
      in_person: '面對面'
    }
    return typeNames[type as keyof typeof typeNames] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  // Check payment and profile completion status
  if (user?.membership?.paymentStatus !== 'completed') {
    return (
      <div className="luxury-card-gradient p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-luxury-gold to-luxury-rose rounded-full flex items-center justify-center shadow-2xl luxury-glow">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gradient-luxury mb-6">請先完成付費</h3>
        <p className="text-lg text-luxury-gold mb-8 leading-relaxed max-w-md mx-auto font-medium">
          您需要先完成會員費用繳交，才能預約面試
        </p>
        <button 
          onClick={() => window.location.href = '/pricing'}
          className="luxury-button px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300"
        >
          <span className="flex items-center">
            前往付費頁面
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
        <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-luxury-platinum">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-luxury-gold rounded-full mr-2"></div>
            安全付費
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-luxury-rose rounded-full mr-2"></div>
            即時開通
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-luxury-champagne rounded-full mr-2"></div>
            專業面試
          </div>
        </div>
      </div>
    )
  }

  if (user?.membership?.status === 'paid' || user?.membership?.status === 'profile_incomplete') {
    return (
      <div className="luxury-card-gradient p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-luxury-champagne to-luxury-pearl rounded-full flex items-center justify-center shadow-2xl luxury-glow">
          <svg className="w-10 h-10 text-luxury-midnight-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gradient-luxury mb-6">請先完善個人資料</h3>
        <p className="text-lg text-luxury-midnight-black mb-8 leading-relaxed max-w-md mx-auto">
          付費成功！請先完善基本個人資料，然後才能預約面試
        </p>
        <button 
          onClick={() => window.location.href = '/profile'}
          className="luxury-button px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300"
        >
          <span className="flex items-center">
            前往完善資料
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
        <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-luxury-platinum">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
            付費完成
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-luxury-gold rounded-full mr-2"></div>
            資料完善
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-luxury-rose rounded-full mr-2"></div>
            面試預約
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card-luxury p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>載入可預約時段中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="card-luxury p-6">
        <h2 className="text-2xl font-bold text-luxury-gold mb-4">預約入會面試</h2>
        <div className="bg-luxury-pearl/20 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-secondary-800 mb-2">面試說明</h3>
          <ul className="text-sm text-secondary-600 space-y-1">
            <li>• 面試時間約30分鐘，主要了解您的背景和期望</li>
            <li>• 我們會核實身份資訊，確保會員的真實性和安全性</li>
            <li>• 面試通過後，您將成為正式會員並可參加活動</li>
            <li>• 請準備身份證件以供核實</li>
            <li>• 建議選擇安靜的環境進行視訊面試</li>
          </ul>
        </div>
      </div>

      {/* Application Form */}
      <div className="card-luxury p-6">
        <h3 className="text-xl font-semibold mb-4">申請資訊</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              希望的會員類型
            </label>
            <select
              value={applicationData.membershipType}
              onChange={(e) => setApplicationData(prev => ({
                ...prev,
                membershipType: e.target.value as any
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
            >
              <option value="regular">Regular會員 (¥600入會+¥300/月)</option>
              <option value="vip">VIP會員 (¥1000入會+¥300/月)</option>
              <option value="premium_1300">Premium 1300 (¥1300券包)</option>
              <option value="premium_2500">Premium 2500 (¥2500券包)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              如何得知SheSocial？
            </label>
            <input
              type="text"
              value={applicationData.referralSource}
              onChange={(e) => setApplicationData(prev => ({
                ...prev,
                referralSource: e.target.value
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              placeholder="例如：朋友介紹、社群媒體、網路搜尋等"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              加入動機 *
            </label>
            <textarea
              value={applicationData.motivation}
              onChange={(e) => setApplicationData(prev => ({
                ...prev,
                motivation: e.target.value
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              rows={3}
              placeholder="請簡述您加入SheSocial的原因和期望..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              對未來伴侶的期望
            </label>
            <textarea
              value={applicationData.expectations}
              onChange={(e) => setApplicationData(prev => ({
                ...prev,
                expectations: e.target.value
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              rows={3}
              placeholder="請描述您理想中的伴侶特質或條件..."
            />
          </div>
        </div>
      </div>

      {/* Available Time Slots */}
      <div className="card-luxury p-6">
        <h3 className="text-xl font-semibold mb-4">選擇面試時段</h3>
        {availableSlots.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto text-secondary-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-secondary-700 mb-2">暫無可預約時段</h4>
            <p className="text-secondary-500">
              我們會盡快安排新的面試時段，請稍後再查看或聯繫客服
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.map((slot) => (
              <div
                key={slot._id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedSlot?._id === slot._id
                    ? 'border-luxury-gold bg-luxury-gold/10'
                    : 'border-gray-200 hover:border-luxury-gold hover:bg-luxury-gold/5'
                }`}
                onClick={() => setSelectedSlot(slot)}
              >
                <div className="space-y-2">
                  <div className="font-semibold text-secondary-800">
                    {formatDate(slot.date)}
                  </div>
                  <div className="text-secondary-600">
                    時間：{slot.startTime} - {slot.endTime}
                  </div>
                  <div className="text-secondary-600">
                    時長：{slot.duration} 分鐘
                  </div>
                  <div className="text-secondary-600">
                    方式：{getTypeDisplayName(slot.interviewType)}
                  </div>
                  <div className="text-sm text-secondary-500">
                    面試官：{slot.interviewerName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Button */}
      {selectedSlot && (
        <div className="card-luxury p-6">
          <div className="bg-luxury-gold/10 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-secondary-800 mb-2">確認預約資訊</h4>
            <div className="text-sm text-secondary-600 space-y-1">
              <div>日期：{formatDate(selectedSlot.date)}</div>
              <div>時間：{selectedSlot.startTime} - {selectedSlot.endTime}</div>
              <div>方式：{getTypeDisplayName(selectedSlot.interviewType)}</div>
              <div>面試官：{selectedSlot.interviewerName}</div>
            </div>
          </div>
          
          <button
            onClick={handleBookInterview}
            disabled={booking || !applicationData.motivation.trim()}
            className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {booking ? '預約中...' : '確認預約面試'}
          </button>
          
          {!applicationData.motivation.trim() && (
            <p className="text-sm text-red-600 mt-2">
              請填寫加入動機後再進行預約
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default InterviewBooking