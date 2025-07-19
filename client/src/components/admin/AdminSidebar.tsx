// Admin Sidebar - Navigation for admin dashboard
import React from 'react';
import type { AdminProfile } from '../../hooks/useAdminAuth';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  admin: AdminProfile | null;
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
    id: 'event-management',
    name: '活動管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    requiredPermission: 'events'
  },
  {
    id: 'interview-management',
    name: '會員面試管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    requiredPermission: 'interviews'
  },
  {
    id: 'consulting-management',
    name: '諮詢預約管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    requiredPermission: 'appointments'
  },
  {
    id: 'event-history-management',
    name: '過往活動管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    requiredPermission: 'reports'
  },
  {
    id: 'user-management',
    name: '會員管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    requiredPermission: 'users'
  },
  {
    id: 'marketing-management',
    name: '行銷管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    requiredPermission: 'marketing'
  },
  {
    id: 'system-management',
    name: '系統管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    requiredPermission: 'system'
  },
  {
    id: 'permissions',
    name: '權限管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    requiredPermission: 'admin'
  },
  {
    id: 'roles',
    name: '角色管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    requiredPermission: 'admin'
  },
  {
    id: 'users',
    name: '管理員管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    requiredPermission: 'admin'
  },
  {
    id: 'audit',
    name: '審計日誌',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    requiredPermission: 'admin'
  }
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  admin,
  onLogout
}) => {
  // Use the new admin auth hooks for proper level checking
  const { hasPermission, isTopLevelAdmin, getAdminLevelName } = useAdminAuth()
  
  // Check if user has permission for a navigation item - level based approach
  const hasMenuPermission = (permission: string | null) => {
    // No permission required - always allow
    if (!permission) return true
    
    // Level 1 admins bypass ALL permission checks
    if (isTopLevelAdmin()) return true
    
    // For Level 2 admins, use the proper permission checking
    return hasPermission(permission)
  }

  const getAdminTypeName = (type: string) => {
    const names = {
      'super_admin': '總管理',
      'system_admin': '系統管理',
      'operation_admin': '營運管理',
      'premium_admin': '付費用戶管理者'
    }
    return names[type as keyof typeof names] || type
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
              <div className="flex items-center justify-between">
                <p className="text-xs text-luxury-midnight-black/80">{getAdminTypeName(admin?.type)}</p>
                <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                  isTopLevelAdmin() 
                    ? 'bg-luxury-gold/20 text-luxury-gold' 
                    : 'bg-luxury-purple/20 text-luxury-purple'
                }`}>
                  {getAdminLevelName()}
                </div>
              </div>
              <p className="text-xs text-luxury-midnight-black/60">{admin?.profile?.employeeId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = activeSection === item.id
          const canAccess = hasMenuPermission(item.requiredPermission)
          
          // Always render the item, but disable it if no permission
          return (
            <button
              key={item.id}
              onClick={() => canAccess && onSectionChange(item.id)}
              disabled={!canAccess}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-luxury-gold text-luxury-midnight-black shadow-md'
                  : canAccess 
                    ? 'text-luxury-platinum hover:bg-luxury-gold/10 hover:text-luxury-gold' 
                    : 'text-luxury-platinum/40 cursor-not-allowed opacity-60'
              }`}
              title={!canAccess ? '需要權限' : ''}
            >
              <span className={isActive ? 'text-luxury-midnight-black' : canAccess ? 'text-luxury-platinum/60' : 'text-luxury-platinum/30'}>
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
              {!canAccess && (
                <span className="ml-auto">
                  <svg className="w-4 h-4 text-luxury-platinum/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </span>
              )}
            </button>
          );
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
