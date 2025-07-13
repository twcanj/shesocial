// Profile Completion After Payment - Step 2 of Onboarding
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface ProfileCompletionProps {
  onProfileComplete?: () => void
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  onProfileComplete
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    bio: '',
    interests: [] as string[],
    phone: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    occupation: '',
    education: '',
    expectations: ''
  })

  const [currentInterest, setCurrentInterest] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Basic validation
    if (!formData.name || !formData.age || !formData.location || !formData.phone) {
      alert('請填寫所有必填欄位')
      return
    }

    if (parseInt(formData.age) < 18 || parseInt(formData.age) > 65) {
      alert('年齡必須在18-65歲之間')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age)
        })
      })

      if (response.ok) {
        alert('個人資料完善成功！現在可以預約面試了。')
        onProfileComplete?.()
      } else {
        const error = await response.json()
        alert(error.message || '保存失敗，請稍後再試')
      }
    } catch (error) {
      console.error('Profile completion error:', error)
      alert('保存失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const addInterest = () => {
    if (currentInterest.trim() && !formData.interests.includes(currentInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, currentInterest.trim()]
      }))
      setCurrentInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Show payment status check first
  if (user?.membership?.paymentStatus !== 'completed') {
    return (
      <div className="container-luxury section-luxury">
        <div className="card-luxury p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto text-yellow-600 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">請先完成付費</h2>
          <p className="text-secondary-600 mb-6">
            您需要先完成會員費用繳交，才能繼續完善個人資料
          </p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="btn-luxury"
          >
            前往付費頁面
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-luxury section-luxury">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="card-luxury p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-luxury-gold">完善個人資料</h1>
            <div className="text-sm text-secondary-600">步驟 2/4</div>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 bg-green-500 h-2 rounded"></div>
            <div className="flex-1 bg-luxury-gold h-2 rounded"></div>
            <div className="flex-1 bg-secondary-200 h-2 rounded"></div>
            <div className="flex-1 bg-secondary-200 h-2 rounded"></div>
          </div>
          <div className="flex justify-between text-xs text-secondary-500 mt-2">
            <span>✓ 付費完成</span>
            <span>● 完善資料</span>
            <span>預約面試</span>
            <span>上傳媒體</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card-luxury p-6">
            <h2 className="text-xl font-semibold mb-6">基本資訊</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  真實姓名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="請輸入您的真實姓名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年齡 *
                </label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="18-65歲"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所在地 *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  required
                >
                  <option value="">請選擇所在地</option>
                  <option value="台北市">台北市</option>
                  <option value="新北市">新北市</option>
                  <option value="桃園市">桃園市</option>
                  <option value="台中市">台中市</option>
                  <option value="台南市">台南市</option>
                  <option value="高雄市">高雄市</option>
                  <option value="基隆市">基隆市</option>
                  <option value="新竹市">新竹市</option>
                  <option value="嘉義市">嘉義市</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手機號碼 *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="0912-345-678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  職業
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="例如：軟體工程師、醫師、教師等"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  學歷
                </label>
                <select
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                >
                  <option value="">請選擇學歷</option>
                  <option value="高中/職">高中/職</option>
                  <option value="專科">專科</option>
                  <option value="大學">大學</option>
                  <option value="碩士">碩士</option>
                  <option value="博士">博士</option>
                </select>
              </div>
            </div>
          </div>

          {/* Personal Description */}
          <div className="card-luxury p-6">
            <h2 className="text-xl font-semibold mb-6">個人簡介</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自我介紹
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  rows={4}
                  placeholder="請簡單介紹一下自己，包括個性、生活方式等..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  興趣愛好
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    placeholder="例如：旅行、閱讀、運動、音樂等"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInterest()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="btn-luxury-outline"
                  >
                    新增
                  </button>
                </div>
                {formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-luxury-gold/20 text-luxury-gold rounded-full text-sm flex items-center"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-2 text-luxury-gold hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  對未來伴侶的期望
                </label>
                <textarea
                  value={formData.expectations}
                  onChange={(e) => handleInputChange('expectations', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  rows={3}
                  placeholder="請描述您理想中的伴侶特質或條件..."
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card-luxury p-6">
            <h2 className="text-xl font-semibold mb-6">緊急聯絡人</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="緊急聯絡人姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話號碼
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="0912-345-678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  關係
                </label>
                <select
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                >
                  <option value="">請選擇關係</option>
                  <option value="父親">父親</option>
                  <option value="母親">母親</option>
                  <option value="兄弟">兄弟</option>
                  <option value="姐妹">姐妹</option>
                  <option value="朋友">朋友</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-luxury w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '完成資料填寫'}
            </button>
            <p className="text-sm text-secondary-500 mt-4">
              資料完成後，您就可以預約30分鐘的視訊面試了
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileCompletion