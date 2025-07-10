// Login Form Component with Luxury Design
import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, isLoading } = useAuthStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = '請輸入電子郵件'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '電子郵件格式無效'
    }

    if (!formData.password) {
      newErrors.password = '請輸入密碼'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      })

      if (result.success) {
        onSuccess?.()
      } else {
        setErrors({ general: result.error || '登入失敗' })
      }
    } catch (error) {
      setErrors({ general: '網路連接失敗，請稍後重試' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className=\"w-full max-w-md mx-auto\">
      <div className=\"card-luxury p-8\">
        {/* Header */}
        <div className=\"text-center mb-8\">
          <h2 className=\"text-3xl font-bold text-gradient-luxury mb-2\">
            歡迎回來
          </h2>
          <p className=\"text-gray-600\">
            登入您的 SheSocial 帳戶
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

          {/* Email Field */}
          <div>
            <label htmlFor=\"email\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              電子郵件
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

          {/* Password Field */}
          <div>
            <label htmlFor=\"password\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              密碼
            </label>
            <input
              type=\"password\"
              id=\"password\"
              name=\"password\"
              value={formData.password}
              onChange={handleChange}
              className={`input-luxury w-full ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
              placeholder=\"請輸入您的密碼\"
              disabled={isSubmitting || isLoading}
            />
            {errors.password && (
              <p className=\"mt-1 text-sm text-red-600\">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className=\"flex items-center justify-between\">
            <label className=\"flex items-center\">
              <input
                type=\"checkbox\"
                name=\"rememberMe\"
                checked={formData.rememberMe}
                onChange={handleChange}
                className=\"h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded\"
                disabled={isSubmitting || isLoading}
              />
              <span className=\"ml-2 text-sm text-gray-600\">記住我</span>
            </label>
            <button
              type=\"button\"
              className=\"text-sm text-orange-600 hover:text-orange-500 transition-colors\"
            >
              忘記密碼？
            </button>
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
                登入中...
              </div>
            ) : (
              '登入'
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className=\"mt-8 text-center\">
          <p className=\"text-gray-600\">
            還沒有帳戶？{' '}
            <button
              type=\"button\"
              onClick={onSwitchToRegister}
              className=\"text-orange-600 hover:text-orange-500 font-medium transition-colors\"
            >
              立即註冊
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}