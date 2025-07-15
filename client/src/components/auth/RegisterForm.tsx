// Register Form component
import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    membership: 'registered' as const
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('密碼確認不符')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('密碼長度至少6個字符')
      setLoading(false)
      return
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        profile: {
          name: formData.name
        },
        membershipType: formData.membership
      })
      
      console.log('Registration result:', result) // Debug log
      
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || '註冊失敗')
      }
    } catch (err) {
      console.error('Registration error:', err) // Debug log
      setError(err instanceof Error ? err.message : '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-luxury-gold mb-2">加入SheSocial</h2>
        <p className="text-luxury-platinum/80">開始您的高端社交之旅</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="luxury-card-outline p-4 border-red-500/50 bg-red-500/10">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-luxury-platinum mb-2">
            姓名
          </label>
          <input 
            id="name"
            name="name"
            type="text" 
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="請輸入您的姓名"
            className="input-luxury"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-luxury-platinum mb-2">
            電子郵件
          </label>
          <input 
            id="email"
            name="email"
            type="email" 
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="請輸入您的電子郵件"
            className="input-luxury"
          />
        </div>

        <div>
          <label htmlFor="membership" className="block text-sm font-medium text-luxury-platinum mb-2">
            會員等級
          </label>
          <select
            id="membership"
            name="membership"
            value={formData.membership}
            onChange={handleChange}
            className="input-luxury"
          >
            <option value="registered">註冊會員 (免費註冊)</option>
            <option value="vip">VIP會員 (NT$1,300)</option>
            <option value="vvip">VVIP會員 (NT$2,500)</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-luxury-platinum mb-2">
            密碼
          </label>
          <input 
            id="password"
            name="password"
            type="password" 
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="請輸入密碼（至少6個字符）"
            className="input-luxury"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-luxury-platinum mb-2">
            確認密碼
          </label>
          <input 
            id="confirmPassword"
            name="confirmPassword"
            type="password" 
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="請再次輸入密碼"
            className="input-luxury"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="luxury-button w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-luxury-midnight-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              註冊中...
            </div>
          ) : (
            '註冊會員'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-luxury-platinum/80">
            已經有帳戶？{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-luxury-gold hover:text-luxury-gold/80 font-medium transition-colors"
            >
              立即登入
            </button>
          </p>
        </div>

        <div className="mt-6 luxury-card-outline p-4">
          <h4 className="font-semibold text-luxury-gold mb-2">入會流程說明</h4>
          <div className="text-xs text-luxury-platinum space-y-1">
            <p>1. 🎯 <strong>選擇會員方案</strong> → 完成付費</p>
            <p>2. 📝 <strong>完善個人資料</strong> → 填寫基本資訊</p>
            <p>3. 🎥 <strong>視訊面試驗證</strong> → 30分鐘身份確認</p>
            <p>4. 📸 <strong>上傳個人媒體</strong> → 照片和介紹影片</p>
          </div>
          <p className="text-xs text-luxury-platinum/60 text-center mt-3">
            註冊即表示您同意我們的服務條款和隱私政策
          </p>
        </div>
      </form>
    </div>
  )
}