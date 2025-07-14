// Enhanced Registration with Profile Data Collection for Sales Tracking
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface RegistrationData {
  // Basic Account Info
  email: string
  password: string
  confirmPassword: string
  
  // Personal Profile (for sales tracking)
  name: string
  age: string
  location: string
  phone: string
  occupation: string
  
  // Preferences (for personalized recommendations)
  membershipInterest: 'regular' | 'vip' | 'premium_1300' | 'premium_2500'
  interests: string[]
  expectations: string
  
  // Sales tracking
  leadSource: string
  referralCode?: string
  
  // Consent
  agreeToTerms: boolean
  agreeToMarketing: boolean
}

interface EnhancedRegistrationProps {
  onRegistrationComplete?: (userId: string) => void
}

export const EnhancedRegistration: React.FC<EnhancedRegistrationProps> = ({
  onRegistrationComplete
}) => {
  const { register } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    location: '',
    phone: '',
    occupation: '',
    membershipInterest: 'regular',
    interests: [],
    expectations: '',
    leadSource: 'website',
    agreeToTerms: false,
    agreeToMarketing: false
  })

  const [currentInterest, setCurrentInterest] = useState('')

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Account basics
        return !!(formData.email && formData.password && formData.confirmPassword && 
                 formData.password === formData.confirmPassword && formData.agreeToTerms)
      
      case 2: // Personal info
        return !!(formData.name && formData.age && formData.location && formData.phone)
      
      case 3: // Preferences
        return !!(formData.membershipInterest && formData.expectations.trim())
      
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    } else {
      alert('請填寫所有必填欄位')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create account with basic info
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        membership: formData.membershipInterest as any
      }
      const result = await register(userData)
      
      // Save additional profile data and sales lead info
      const profileData = {
        profile: {
          name: formData.name,
          age: parseInt(formData.age),
          location: formData.location,
          bio: '',
          interests: formData.interests,
          phone: formData.phone,
          occupation: formData.occupation
        },
        salesLead: {
          leadSource: formData.leadSource,
          membershipInterest: formData.membershipInterest,
          expectations: formData.expectations,
          referralCode: formData.referralCode,
          agreeToMarketing: formData.agreeToMarketing,
          profileCompleteness: 85 // High completeness for better sales follow-up
        }
      }

      const response = await fetch('/api/users/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        alert('註冊成功！現在請選擇適合的會員方案。')
        onRegistrationComplete?.(result.data?.user?._id || 'new-user')
      } else {
        alert('註冊失敗，請稍後再試')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('註冊失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const membershipOptions = [
    {
      id: 'regular',
      name: 'Regular會員',
      price: '¥600入會+¥300/月',
      features: ['參加所有活動', '基本會員權益'],
      recommended: false
    },
    {
      id: 'vip',
      name: 'VIP會員',
      price: '¥1000入會+¥300/月',
      features: ['優先報名', 'VIP專屬活動', '客服支援'],
      recommended: false
    },
    {
      id: 'premium_1300',
      name: 'Premium 1300',
      price: '¥1300券包',
      features: ['優先報名', '活動折扣券', '特殊權益'],
      recommended: true
    },
    {
      id: 'premium_2500',
      name: 'Premium 2500',
      price: '¥2500券包',
      features: ['查看參與者', '最高優先權', '專屬服務'],
      recommended: false
    }
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-luxury-gold mb-2">建立您的帳戶</h2>
              <p className="text-secondary-600">開始您的SheSocial之旅</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件 *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="請輸入您的電子郵件"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密碼 *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="至少8個字符"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  確認密碼 *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="請再次輸入密碼"
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">密碼不一致</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  如何得知SheSocial？
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => handleInputChange('leadSource', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                >
                  <option value="website">官方網站</option>
                  <option value="social_media">社群媒體</option>
                  <option value="referral">朋友介紹</option>
                  <option value="advertisement">廣告</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="mr-3"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    我同意 <a href="#" className="text-luxury-gold hover:underline">服務條款</a> 和 
                    <a href="#" className="text-luxury-gold hover:underline">隱私政策</a>
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.agreeToMarketing}
                    onChange={(e) => handleInputChange('agreeToMarketing', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    我同意接收SheSocial的行銷訊息和活動通知
                  </span>
                </label>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-luxury-gold mb-2">告訴我們更多關於您</h2>
              <p className="text-secondary-600">這將幫助我們為您推薦最適合的方案</p>
            </div>

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

              <div className="md:col-span-2">
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
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-luxury-gold mb-2">選擇您感興趣的方案</h2>
              <p className="text-secondary-600">我們將為您推薦最適合的會員方案</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {membershipOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all relative ${
                    formData.membershipInterest === option.id
                      ? 'border-luxury-gold bg-luxury-gold/10'
                      : 'border-gray-200 hover:border-luxury-gold hover:bg-luxury-gold/5'
                  }`}
                  onClick={() => handleInputChange('membershipInterest', option.id)}
                >
                  {option.recommended && (
                    <div className="absolute -top-3 left-4 bg-luxury-gold text-white px-3 py-1 rounded-full text-xs font-medium">
                      推薦
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mb-2">{option.name}</h3>
                  <p className="text-luxury-gold font-semibold mb-3">{option.price}</p>
                  <ul className="text-sm text-secondary-600 space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                對未來伴侶的期望 *
              </label>
              <textarea
                value={formData.expectations}
                onChange={(e) => handleInputChange('expectations', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                rows={4}
                placeholder="請簡述您理想中的伴侶特質或條件..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                推薦碼（選填）
              </label>
              <input
                type="text"
                value={formData.referralCode || ''}
                onChange={(e) => handleInputChange('referralCode', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                placeholder="如果有朋友推薦碼請輸入"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-secondary-600">
            步驟 {currentStep} / 3
          </span>
          <span className="text-sm text-secondary-500">
            {currentStep === 1 && '帳戶設定'}
            {currentStep === 2 && '個人資料'}
            {currentStep === 3 && '偏好設定'}
          </span>
        </div>
        <div className="flex space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded ${
                step <= currentStep ? 'bg-luxury-gold' : 'bg-secondary-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card-luxury p-8">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-luxury-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一步
          </button>
          
          <button
            onClick={handleNext}
            disabled={loading || !validateStep(currentStep)}
            className="btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '處理中...' : currentStep === 3 ? '完成註冊' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedRegistration