// Interview Booking System for New Members
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface InterviewSlot {
  _id: string
  interviewerId: string
  interviewerName: string
  date: string
  time: string
  duration: number
  type: 'video_call' | 'phone_call' | 'in_person'
  isAvailable: boolean
  meetingUrl?: string
}

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
      const response = await fetch('/api/interviews/available-slots')
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.data || [])
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
        applicantId: user._id,
        applicationData
      }

      const response = await fetch('/api/interviews/book', {
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
        onBookingComplete?.(result.data.sessionId)
      } else {
        const error = await response.json()
        alert(error.message || '預約失敗，請稍後再試')
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
                    時間：{slot.time}
                  </div>
                  <div className="text-secondary-600">
                    時長：{slot.duration} 分鐘
                  </div>
                  <div className="text-secondary-600">
                    方式：{getTypeDisplayName(slot.type)}
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
              <div>時間：{selectedSlot.time}</div>
              <div>方式：{getTypeDisplayName(selectedSlot.type)}</div>
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