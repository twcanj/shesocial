// Admin Login Page
// Dedicated login page for admin users with luxury styling
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'

export const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(credentials.email, credentials.password)
      navigate('/admin/dashboard')
        } catch (err: unknown) {
      setError((err as any).message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-midnight to-luxury-charcoal flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Admin Login Card */}
        <div className="luxury-card p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-luxury-gold">
              🛡️ 管理員登入
            </div>
            <div className="text-luxury-pearl/70">
              InfinityMatch 管理系統
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-luxury-pearl font-medium mb-2">
                管理員信箱
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="請輸入管理員信箱"
                className="luxury-input w-full"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-luxury-pearl font-medium mb-2">
                管理員密碼
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="請輸入密碼"
                className="luxury-input w-full"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="luxury-button w-full py-3 text-lg font-medium"
            >
              {loading ? '登入中...' : '管理員登入'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-luxury-pearl/50 text-sm space-y-2">
            <div>僅限授權管理員使用</div>
            <div>
              <a 
                href="/" 
                className="text-luxury-gold hover:text-luxury-gold-light transition-colors"
              >
                返回主頁
              </a>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-luxury-pearl/40 text-xs">
          <div className="flex items-center justify-center space-x-2">
            <div>🔐</div>
            <div>所有管理員操作將被記錄和監控</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage