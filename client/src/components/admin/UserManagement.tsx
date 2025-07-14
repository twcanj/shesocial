// User Management - Manage admin users and assignments
import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export const UserManagement: React.FC = () => {
  const { hasPermission } = useAdminAuth()

  if (!hasPermission('admin:create')) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">存取被拒</h3>
        <p className="mt-1 text-sm text-gray-500">您沒有管理員用戶管理的存取權限</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">管理員管理</h2>
          <p className="text-gray-600 mt-1">管理管理員用戶和角色分配</p>
        </div>
        <button className="btn-luxury">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增管理員
        </button>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">管理員用戶管理</h3>
        <p className="text-gray-600 mb-4">此功能即將推出</p>
        <p className="text-sm text-gray-500">
          將包含管理員創建、角色分配、權限管理和狀態追蹤功能
        </p>
      </div>
    </div>
  )
}