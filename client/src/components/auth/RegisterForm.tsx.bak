// Register Form Component with Luxury Design
import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { UserProfile } from '../../types/database'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    location: '台北',
    bio: '',
    interests: [] as string[],
    membershipType: 'regular' as UserProfile['membership']['type']
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, isLoading } = useAuthStore()

  const taiwanCities = [
    '台北', '新北', '桃園', '台中', '台南', '高雄',
    '基隆', '新竹', '苗栗', '彰化', '南投', '雲林',
    '嘉義', '屏東', '宜蘭', '花蓮', '台東', '澎湖',
    '金門', '連江'
  ]

  const interestOptions = [
    '旅行', '美食', '攝影', '音樂', '電影', '閱讀',
    '運動', '健身', '瑜伽', '登山', '游泳', '跑步',
    '繪畫', '設計', '手工藝', '園藝', '烹飪', '品酒',
    '投資', '創業', '科技', '時尚', '藝術', '文化'
  ]

  const membershipOptions = [
    { value: 'regular', label: '一般會員 (¥600 入會 + ¥300/月)', description: '基本活動參與' },
    { value: 'vip', label: 'VIP 會員 (¥1000 入會 + ¥300/月)', description: '優先報名權' },
    { value: 'premium_1300', label: '¥1300 票券方案', description: '包含活動票券 + 優先報名' },
    { value: 'premium_2500', label: '¥2500 票券方案', description: '包含活動票券 + 查看參與者 + 優先報名' }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = '請輸入電子郵件'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '電子郵件格式無效'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = '請輸入密碼'
    } else if (formData.password.length < 8) {
      newErrors.password = '密碼長度必須至少8個字符'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼確認不匹配'
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = '請輸入姓名'
    } else if (formData.name.length < 2) {
      newErrors.name = '姓名長度必須至少2個字符'
    }

    // Age validation
    if (formData.age) {
      const age = parseInt(formData.age)
      if (isNaN(age) || age < 18 || age > 100) {
        newErrors.age = '請輸入有效的年齡 (18-100)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        profile: {
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : undefined,
          bio: formData.bio,
          interests: formData.interests,
          location: formData.location
        },
        membershipType: formData.membershipType
      })

      if (result.success) {
        onSuccess?.()
      } else {
        setErrors({ general: result.error || '註冊失敗' })
      }
    } catch (error) {
      setErrors({ general: '網路連接失敗，請稍後重試' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className=\"w-full max-w-2xl mx-auto\">
      <div className=\"card-luxury p-8\">
        {/* Header */}
        <div className=\"text-center mb-8\">
          <h2 className=\"text-3xl font-bold text-gradient-luxury mb-2\">
            加入 SheSocial
          </h2>
          <p className=\"text-gray-600\">
            開始您的奢華社交之旅
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className=\"space-y-6\">
          {/* General Error */}
          {errors.general && (
            <div className=\"bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm\">
              {errors.general}
            </div>
          )}

          {/* Email and Password Row */}
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            {/* Email Field */}
            <div>
              <label htmlFor=\"email\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                電子郵件 *
              </label>
              <input
                type=\"email\"
                id=\"email\"
                name=\"email\"
                value={formData.email}
                onChange={handleChange}
                className={`input-luxury w-full ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder=\"請輸入您的電子郵件\"
                disabled={isSubmitting || isLoading}
              />
              {errors.email && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.email}</p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor=\"name\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                姓名 *
              </label>
              <input
                type=\"text\"
                id=\"name\"
                name=\"name\"
                value={formData.name}
                onChange={handleChange}
                className={`input-luxury w-full ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder=\"請輸入您的姓名\"
                disabled={isSubmitting || isLoading}
              />
              {errors.name && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Password Row */}
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            {/* Password Field */}
            <div>
              <label htmlFor=\"password\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                密碼 *
              </label>
              <input
                type=\"password\"
                id=\"password\"
                name=\"password\"
                value={formData.password}
                onChange={handleChange}
                className={`input-luxury w-full ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder=\"至少8個字符\"
                disabled={isSubmitting || isLoading}
              />
              {errors.password && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor=\"confirmPassword\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                確認密碼 *
              </label>
              <input
                type=\"password\"
                id=\"confirmPassword\"
                name=\"confirmPassword\"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-luxury w-full ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder=\"請再次輸入密碼\"
                disabled={isSubmitting || isLoading}
              />
              {errors.confirmPassword && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Age and Location Row */}
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            {/* Age Field */}
            <div>
              <label htmlFor=\"age\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                年齡
              </label>
              <input
                type=\"number\"
                id=\"age\"
                name=\"age\"
                value={formData.age}
                onChange={handleChange}
                min=\"18\"
                max=\"100\"
                className={`input-luxury w-full ${errors.age ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder=\"選填\"
                disabled={isSubmitting || isLoading}
              />
              {errors.age && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.age}</p>
              )}
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor=\"location\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                所在地區
              </label>
              <select
                id=\"location\"
                name=\"location\"
                value={formData.location}
                onChange={handleChange}
                className=\"input-luxury w-full\"
                disabled={isSubmitting || isLoading}
              >
                {taiwanCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor=\"bio\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              個人簡介
            </label>
            <textarea
              id=\"bio\"
              name=\"bio\"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className=\"input-luxury w-full resize-none\"
              placeholder=\"簡單介紹一下自己...\"
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Interests */}
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-3\">
              興趣愛好 (選擇您感興趣的項目)
            </label>
            <div className=\"grid grid-cols-2 md:grid-cols-4 gap-2\">
              {interestOptions.map(interest => (
                <label key={interest} className=\"flex items-center space-x-2 cursor-pointer\">
                  <input
                    type=\"checkbox\"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    className=\"h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded\"
                    disabled={isSubmitting || isLoading}
                  />
                  <span className=\"text-sm text-gray-700\">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Membership Type */}
          <div>
            <label className=\"block text-sm font-medium text-gray-700 mb-3\">
              會員方案
            </label>
            <div className=\"space-y-3\">
              {membershipOptions.map(option => (
                <label key={option.value} className=\"flex items-start space-x-3 cursor-pointer\">
                  <input
                    type=\"radio\"
                    name=\"membershipType\"
                    value={option.value}
                    checked={formData.membershipType === option.value}
                    onChange={handleChange}
                    className=\"h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 mt-1\"
                    disabled={isSubmitting || isLoading}
                  />
                  <div>
                    <div className=\"text-sm font-medium text-gray-900\">{option.label}</div>
                    <div className=\"text-xs text-gray-500\">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type=\"submit\"
            disabled={isSubmitting || isLoading}
            className=\"btn-luxury w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed\"
          >
            {isSubmitting || isLoading ? (
              <div className=\"flex items-center justify-center\">
                <div className=\"animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2\"></div>
                註冊中...
              </div>
            ) : (
              '註冊帳戶'
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className=\"mt-8 text-center\">
          <p className=\"text-gray-600\">
            已經有帳戶？{' '}
            <button
              type=\"button\"
              onClick={onSwitchToLogin}
              className=\"text-orange-600 hover:text-orange-500 font-medium transition-colors\"
            >
              立即登入
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}