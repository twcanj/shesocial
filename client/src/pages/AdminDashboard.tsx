// Admin Dashboard - Main interface for admin permission management
import React, { useState, useEffect } from 'react'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { PermissionManagement } from '../components/admin/PermissionManagement'
import { RoleManagement } from '../components/admin/RoleManagement'
import { UserManagement } from '../components/admin/UserManagement'
import { AuditLogViewer } from '../components/admin/AuditLogViewer'
import { AdminOverview } from '../components/admin/AdminOverview'
import { useAdminAuth } from '../hooks/useAdminAuth'

type AdminSection = 'overview' | 'permissions' | 'roles' | 'users' | 'audit'

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const { admin, isAuthenticated, loading, login, logout } = useAdminAuth()

  // Redirect to login if not authenticated
  if (!isAuthenticated && !loading) {
    return <AdminLogin onLogin={login} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-gray-600">載入管理面板...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />
      case 'permissions':
        return <PermissionManagement />
      case 'roles':
        return <RoleManagement />
      case 'users':
        return <UserManagement />
      case 'audit':
        return <AuditLogViewer />
      default:
        return <AdminOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={(section: string) => setActiveSection(section as AdminSection)}
        admin={admin}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getSectionTitle(activeSection)}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  InfinityMatch 管理系統
                </p>
              </div>
              
              {/* Admin Info */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{admin?.username}</p>
                  <p className="text-xs text-gray-500">{admin?.department}</p>
                </div>
                <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// Helper function to get section titles
const getSectionTitle = (section: AdminSection): string => {
  const titles: Record<AdminSection, string> = {
    overview: '系統總覽',
    permissions: '權限管理',
    roles: '角色管理',
    users: '管理員管理',
    audit: '審計日誌'
  }
  return titles[section]
}

// Simple admin login component
const AdminLogin: React.FC<{ onLogin: (username: string, password: string) => Promise<void> }> = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onLogin(username, password)
    } catch (error: any) {
      setError(error.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-champagne to-luxury-pearl flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img className="mx-auto h-16 w-16 rounded-full" src="/logo.jpeg" alt="InfinityMatch" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">管理員登入</h2>
          <p className="mt-2 text-sm text-gray-600">
            InfinityMatch 管理系統
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                管理員帳號
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-luxury w-full"
                placeholder="輸入管理員帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-luxury w-full"
                placeholder="輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-luxury w-full"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                </svg>
                登入中...
              </>
            ) : (
              '登入管理系統'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}