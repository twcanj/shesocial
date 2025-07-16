// Audit Log Viewer - View and filter admin operation logs
import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth'

export const AuditLogViewer: React.FC = () => {
  const { hasPermission } = useAdminAuth()

  if (!hasPermission('admin:audit')) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">存取被拒</h3>
        <p className="mt-1 text-sm text-gray-500">您沒有審計日誌的存取權限</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">審計日誌</h2>
          <p className="text-gray-600 mt-1">查看和分析管理員操作記錄</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-luxury-outline">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            刷新
          </button>
          <button className="btn-luxury-outline">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            匯出
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">篩選條件</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">操作類型</label>
            <select className="input-luxury w-full">
              <option value="">所有操作</option>
              <option value="grant">權限授予</option>
              <option value="revoke">權限撤銷</option>
              <option value="modify">權限修改</option>
              <option value="create_role">角色創建</option>
              <option value="delete_role">角色刪除</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">目標類型</label>
            <select className="input-luxury w-full">
              <option value="">所有類型</option>
              <option value="user">用戶</option>
              <option value="role">角色</option>
              <option value="permission">權限</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
            <input type="date" className="input-luxury w-full" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
            <input type="date" className="input-luxury w-full" />
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">審計日誌檢視器</h3>
        <p className="text-gray-600 mb-4">此功能即將推出</p>
        <p className="text-sm text-gray-500">
          將包含實時日誌監控、詳細篩選、匯出功能和安全分析
        </p>
      </div>
    </div>
  )
}