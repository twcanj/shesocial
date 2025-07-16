// Login Form component
import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        onSuccess()
      } else {
        // Show the error message from the server response
        setError(result.error || result.message || '登入失敗')
      }
    } catch (err) {
      // Handle network errors or other exceptions
      setError(err instanceof Error ? err.message : '網路連接失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-luxury-gold mb-2">歡迎回來</h2>
        <p className="text-luxury-platinum/80">登入您的SheSocial帳戶</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="luxury-card-outline p-4 border-red-500/50 bg-red-500/10">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

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
            placeholder="請輸入您的密碼"
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
              登入中...
            </div>
          ) : (
            '登入'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-luxury-platinum/80">
            還沒有帳戶？{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-luxury-gold hover:text-luxury-gold/80 font-medium transition-colors"
            >
              立即註冊
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}