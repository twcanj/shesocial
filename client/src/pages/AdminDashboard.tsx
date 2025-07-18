// Admin Dashboard - Main interface for admin permission management
import React, { useState } from 'react'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { PermissionManagement } from '../components/admin/PermissionManagement'
import { RoleManagement } from '../components/admin/RoleManagement'
import { UserManagement } from '../components/admin/UserManagement'
import { AuditLogViewer } from '../components/admin/AuditLogViewer'
import { AdminOverview } from '../components/admin/AdminOverview'
import { EventManagement } from '../components/admin/EventManagement'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useAdminAuth } from '../hooks/useAdminAuth'

// Placeholder components for remaining sections
const InterviewManagement: React.FC = () => <div className="text-white">會員面試管理 Content</div>;
const ConsultingManagement: React.FC = () => <div className="text-white">諮詢預約管理 Content</div>;
const EventHistoryManagement: React.FC = () => <div className="text-white">過往活動管理 Content</div>;
const UserManagementPage: React.FC = () => <div className="text-white">會員管理 Content</div>;
const MarketingManagement: React.FC = () => <div className="text-white">行銷管理 Content</div>;
const SystemManagement: React.FC = () => <div className="text-white">系統管理 Content</div>;

// Import debug utilities in development
if (process.env.NODE_ENV === 'development') {
  import('../utils/debugAdmin')
}

type AdminSection = 'overview' | 'permissions' | 'roles' | 'users' | 'audit' | 'event-management' | 'interview-management' | 'consulting-management' | 'event-history-management' | 'user-management' | 'marketing-management' | 'system-management'

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
    const { admin, loading, logout } = useAdminAuth()

  // Note: Authentication is now handled by React Router guard
  // This component should only render when user is authenticated

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-midnight-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-luxury-platinum">載入管理面板...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <ErrorBoundary>
            <AdminOverview />
          </ErrorBoundary>
        )
      case 'permissions':
        return <PermissionManagement />
      case 'roles':
        return <RoleManagement />
      case 'users':
        return <UserManagement />
      case 'audit':
        return <AuditLogViewer />
      case 'event-management':
        return <EventManagement />
      case 'interview-management':
        return <InterviewManagement />
      case 'consulting-management':
        return <ConsultingManagement />
      case 'event-history-management':
        return <EventHistoryManagement />
      case 'user-management':
        return <UserManagementPage />
      case 'marketing-management':
        return <MarketingManagement />
      case 'system-management':
        return <SystemManagement />
      default:
        return (
          <ErrorBoundary>
            <AdminOverview />
          </ErrorBoundary>
        )
    }
  }

  return (
    <div className="min-h-screen bg-luxury-midnight-black flex">
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
        <header className="bg-luxury-midnight-black/95 backdrop-blur-sm border-b border-luxury-gold/20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-luxury-gold">
                  {getSectionTitle(activeSection)}
                </h1>
                <p className="text-sm text-luxury-platinum/80 mt-1">
                  InfinityMatch 管理系統
                </p>
              </div>
              
              {/* Admin Info */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-luxury-platinum">{admin?.username}</p>
                  <p className="text-xs text-luxury-platinum/60">{admin?.department}</p>
                </div>
                <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-luxury-midnight-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    audit: '審計日誌',
    'event-management': '活動管理',
    'interview-management': '會員面試管理',
    'consulting-management': '諮詢預約管理',
    'event-history-management': '過往活動管理',
    'user-management': '會員管理',
    'marketing-management': '行銷管理',
    'system-management': '系統管理'
  }
  return titles[section]
}

