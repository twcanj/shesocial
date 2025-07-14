// Admin Overview - Dashboard overview with system statistics
import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalEvents: number
  upcomingEvents: number
  totalBookings: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  lastBackup: Date
}

export const AdminOverview: React.FC = () => {
  const { admin, hasPermission } = useAdminAuth()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading system stats
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalEvents: 156,
        upcomingEvents: 23,
        totalBookings: 2341,
        systemHealth: 'healthy',
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '早安'
    if (hour < 18) return '午安'
    return '晚安'
  }

  const getDepartmentTasks = (department: string) => {
    const tasks = {
      executive: [
        '檢視系統整體績效報告',
        '審核重要政策變更',
        '管理部門間協調事務'
      ],
      technical: [
        '監控系統性能指標',
        '檢查備份狀態',
        '處理技術支援工單'
      ],
      operations: [
        '審核待處理內容',
        '管理活動申請',
        '處理用戶服務工單'
      ],
      members: [
        '處理VIP會員服務',
        '安排面試時程',
        '處理付費相關問題'
      ]
    }
    return tasks[department as keyof typeof tasks] || []
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-luxury-champagne to-luxury-pearl p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getWelcomeMessage()}，{admin?.profile?.realName}
        </h2>
        <p className="text-gray-600">
          歡迎回到 InfinityMatch 管理系統。以下是今日的系統概況。
        </p>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總用戶數</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">
                +{Math.floor((stats?.totalUsers || 0) * 0.05)} 本月新增
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">活躍用戶</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.activeUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {((stats?.activeUsers || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% 活躍率
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總活動數</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalEvents}</p>
              <p className="text-sm text-blue-600 mt-1">
                {stats?.upcomingEvents} 個即將開始
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總預訂數</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings.toLocaleString()}</p>
              <p className="text-sm text-orange-600 mt-1">
                平均 {((stats?.totalBookings || 0) / (stats?.totalEvents || 1)).toFixed(1)} 人/活動
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">系統健康狀況</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">系統狀態</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">健康</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">最後備份</span>
              <span className="text-sm text-gray-900">
                {stats?.lastBackup ? new Date(stats.lastBackup).toLocaleString('zh-TW') : '未知'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">服務器負載</span>
              <span className="text-sm text-gray-900">23%</span>
            </div>
          </div>
        </div>

        {/* Department Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">部門任務</h3>
          <div className="space-y-3">
            {getDepartmentTasks(admin?.department).map((task, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="space-y-3">
            {hasPermission('admin:audit') && (
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                檢視審計日誌
              </button>
            )}
            {hasPermission('admin:permissions') && (
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                管理權限設定
              </button>
            )}
            {hasPermission('admin:create') && (
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                新增管理員
              </button>
            )}
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              系統設定
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity (if has audit permission) */}
      {hasPermission('admin:audit') && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活動</h3>
          <div className="space-y-4">
            {/* Mock recent activities */}
            {[
              { time: '2 分鐘前', action: '用戶 user123 註冊成功', type: 'user' },
              { time: '15 分鐘前', action: '活動「台北一日遊」已發布', type: 'event' },
              { time: '1 小時前', action: '管理員 admin_ops 修改了角色權限', type: 'admin' },
              { time: '2 小時前', action: '系統自動備份完成', type: 'system' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'event' ? 'bg-green-500' :
                  activity.type === 'admin' ? 'bg-orange-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-gray-500">{activity.time}</span>
                <span className="text-gray-900">{activity.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}