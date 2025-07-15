// Admin Sidebar - Navigation for admin dashboard
import React from 'react'

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  admin: any
  onLogout: () => void
}

const navigation = [
  {
    id: 'overview',
    name: '系統總覽',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    requiredPermission: null
  },
  {
    id: 'permissions',
    name: '權限管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    requiredPermission: 'admin:permissions'
  },
  {
    id: 'roles',
    name: '角色管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    requiredPermission: 'admin:permissions'
  },
  {
    id: 'users',
    name: '管理員管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    requiredPermission: 'admin:create'
  },
  {
    id: 'audit',
    name: '審計日誌',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    requiredPermission: 'admin:audit'
  }
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  admin,
  onLogout
}) => {
  // Check if user has permission for a navigation item
  const hasPermission = (permission: string | null) => {
    if (!permission) return true // No permission required
    if (!admin?.permissions) return false
    if (admin.permissions.includes('*')) return true // Super admin
    return admin.permissions.includes(permission)
  }

  const getDepartmentColor = (department: string) => {
    const colors = {
      executive: 'from-purple-600 to-purple-800',
      technical: 'from-blue-600 to-blue-800', 
      operations: 'from-green-600 to-green-800',
      members: 'from-orange-600 to-orange-800'
    }
    return colors[department as keyof typeof colors] || 'from-gray-600 to-gray-800'
  }

  const getDepartmentName = (department: string) => {
    const names = {
      executive: '執行部',
      technical: '技術部',
      operations: '營運部', 
      members: '會員部'
    }
    return names[department as keyof typeof names] || department
  }

  return (
    <div className="w-64 bg-luxury-midnight-black border-r border-luxury-gold/20 flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-luxury-gold/20">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpeg" alt="InfinityMatch" className="w-10 h-10 rounded-full" />
          <div>
            <h1 className="text-lg font-bold text-luxury-gold">InfinityMatch</h1>
            <p className="text-sm text-luxury-platinum/80">管理系統</p>
          </div>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="p-4 border-b border-luxury-gold/20">
        <div className="luxury-card-selected p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-luxury-midnight-black/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-luxury-midnight-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-luxury-midnight-black">{admin?.profile?.realName}</p>
              <p className="text-xs text-luxury-midnight-black/80">{getDepartmentName(admin?.department)}</p>
              <p className="text-xs text-luxury-midnight-black/60">{admin?.profile?.employeeId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = activeSection === item.id
          const canAccess = hasPermission(item.requiredPermission)
          
          if (!canAccess) return null

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-luxury-gold text-luxury-midnight-black shadow-md'
                  : 'text-luxury-platinum hover:bg-luxury-gold/10 hover:text-luxury-gold'
              }`}
            >
              <span className={isActive ? 'text-luxury-midnight-black' : 'text-luxury-platinum/60'}>
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
            </button>
          )
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-luxury-gold/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-luxury-platinum/80">系統狀態</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400 font-medium">正常運行</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-luxury-gold/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-luxury-platinum hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">登出</span>
        </button>
      </div>
    </div>
  )
}