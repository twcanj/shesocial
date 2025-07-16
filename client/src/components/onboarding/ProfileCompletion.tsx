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
        <div className="luxury-card-gradient p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-luxury-gold to-luxury-rose rounded-full flex items-center justify-center shadow-2xl luxury-glow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gradient-luxury mb-6">請先完成付費</h2>
          <p className="text-lg text-luxury-gold mb-8 leading-relaxed font-medium">
            您需要先完成會員費用繳交，才能繼續完善個人資料
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
              專業服務
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-luxury section-luxury">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="luxury-card-gradient p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gradient-luxury">完善個人資料</h1>
            <div className="luxury-card-outline px-4 py-2 bg-gradient-to-r from-luxury-champagne/30 to-luxury-gold/20">
              <span className="text-sm font-medium text-luxury-midnight-black">步驟 2/4</span>
            </div>
          </div>
          <div className="flex space-x-3 mb-4">
            <div className="flex-1 bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full shadow-sm"></div>
            <div className="flex-1 bg-gradient-to-r from-luxury-gold to-luxury-rose h-3 rounded-full shadow-sm luxury-glow"></div>
            <div className="flex-1 bg-luxury-pearl/30 h-3 rounded-full"></div>
            <div className="flex-1 bg-luxury-pearl/30 h-3 rounded-full"></div>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-emerald-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              付費完成
            </span>
            <span className="text-luxury-gold flex items-center">
              <div className="w-2 h-2 bg-luxury-gold rounded-full mr-2 animate-pulse-luxury"></div>
              完善資料
            </span>
            <span className="text-luxury-platinum">預約面試</span>
            <span className="text-luxury-platinum">上傳媒體</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="luxury-card-gradient p-8">
            <h2 className="text-2xl font-bold text-luxury-midnight-black mb-6 flex items-center">
              <span className="w-3 h-3 bg-luxury-gold rounded-full mr-3"></span>
              基本資訊
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  真實姓名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-luxury"
                  placeholder="請輸入您的真實姓名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  年齡 *
                </label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="input-luxury"
                  placeholder="18-65歲"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  所在地 *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="input-luxury"
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
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  手機號碼 *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="input-luxury"
                  placeholder="0912-345-678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  職業
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="input-luxury"
                  placeholder="例如：軟體工程師、醫師、教師等"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  學歷
                </label>
                <select
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="input-luxury"
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
          <div className="luxury-card-gradient p-8">
            <h2 className="text-2xl font-bold text-luxury-midnight-black mb-6 flex items-center">
              <span className="w-3 h-3 bg-luxury-rose rounded-full mr-3"></span>
              個人簡介
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  自我介紹
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="input-luxury"
                  rows={4}
                  placeholder="請簡單介紹一下自己，包括個性、生活方式等..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  興趣愛好
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    className="flex-1 input-luxury"
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
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  對未來伴侶的期望
                </label>
                <textarea
                  value={formData.expectations}
                  onChange={(e) => handleInputChange('expectations', e.target.value)}
                  className="input-luxury"
                  rows={3}
                  placeholder="請描述您理想中的伴侶特質或條件..."
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="luxury-card-gradient p-8">
            <h2 className="text-2xl font-bold text-luxury-midnight-black mb-6 flex items-center">
              <span className="w-3 h-3 bg-luxury-champagne rounded-full mr-3"></span>
              緊急聯絡人
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                  className="input-luxury"
                  placeholder="緊急聯絡人姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  電話號碼
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                  className="input-luxury"
                  placeholder="0912-345-678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-luxury-midnight-black mb-3">
                  關係
                </label>
                <select
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                  className="input-luxury"
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
              className="luxury-button px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>完成資料填寫</span>
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>
            <p className="text-sm text-luxury-platinum mt-6 max-w-md mx-auto">
              ✨ 資料完成後，您就可以預約30分鐘的視訊面試了
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileCompletion