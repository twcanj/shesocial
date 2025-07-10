// Sync Status Indicator Component
import React, { useState, useEffect } from 'react'
import { syncService } from '../../services/sync-service'

interface SyncStatus {
  inProgress: boolean
  isOnline: boolean
  networkQuality: 'good' | 'slow' | 'offline'
  lastSync: Record<string, string>
  pendingItems: {
    total: number
    byPriority: Record<string, number>
    oldestPending?: Date
  }
  errors: {
    recentErrors: number
    lastErrorTime?: Date
  }
}

export const SyncStatusIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const updateStatus = async () => {
      const status = await syncService.getSyncStatus()
      setSyncStatus(status)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (!syncStatus) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm">載入中...</span>
      </div>
    )
  }

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500'
    if (syncStatus.inProgress) return 'text-blue-500'
    if (syncStatus.pendingItems.total > 0) return 'text-yellow-500'
    if (syncStatus.errors.recentErrors > 0) return 'text-orange-500'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return '📴'
    if (syncStatus.inProgress) return '🔄'
    if (syncStatus.pendingItems.total > 0) return '⏳'
    if (syncStatus.errors.recentErrors > 0) return '⚠️'
    return '✅'
  }

  const getStatusText = () => {
    if (!syncStatus.isOnline) return '離線'
    if (syncStatus.inProgress) return '同步中...'
    if (syncStatus.pendingItems.total > 0) return `待同步 ${syncStatus.pendingItems.total} 項`
    if (syncStatus.errors.recentErrors > 0) return '同步警告'
    return '已同步'
  }

  const getNetworkQualityBadge = () => {
    const { networkQuality } = syncStatus
    const colors = {
      good: 'bg-green-100 text-green-800',
      slow: 'bg-yellow-100 text-yellow-800', 
      offline: 'bg-red-100 text-red-800'
    }
    const labels = {
      good: '網路良好',
      slow: '網路較慢',
      offline: '離線'
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[networkQuality]}`}>
        {labels[networkQuality]}
      </span>
    )
  }

  const formatLastSync = (timestamp: string) => {
    if (timestamp === 'never') return '從未同步'
    const date = new Date(parseInt(timestamp))
    const now = Date.now()
    const diff = now - date.getTime()
    
    if (diff < 60000) return '剛剛'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`
    return `${Math.floor(diff / 86400000)} 天前`
  }

  const handleForceSync = async () => {
    await syncService.forceSyncNow()
  }

  return (
    <div className="relative">
      {/* Main Status Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-white shadow-sm border transition-colors hover:bg-gray-50 ${getStatusColor()}`}
      >
        <span className="text-lg">{getStatusIcon()}</span>
        <span className="text-sm font-medium">{getStatusText()}</span>
        {syncStatus.inProgress && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>

      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">同步狀態</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Network Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">網路狀態</span>
              {getNetworkQualityBadge()}
            </div>

            {/* Pending Items */}
            {syncStatus.pendingItems.total > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">待同步項目</span>
                  <span className="font-medium">{syncStatus.pendingItems.total}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-red-50 px-2 py-1 rounded text-red-700">
                    高優先級: {syncStatus.pendingItems.byPriority.high || 0}
                  </div>
                  <div className="bg-yellow-50 px-2 py-1 rounded text-yellow-700">
                    中優先級: {syncStatus.pendingItems.byPriority.medium || 0}
                  </div>
                  <div className="bg-gray-50 px-2 py-1 rounded text-gray-700">
                    低優先級: {syncStatus.pendingItems.byPriority.low || 0}
                  </div>
                </div>
              </div>
            )}

            {/* Last Sync Times */}
            <div className="space-y-2">
              <span className="text-gray-600 text-sm">最後同步時間</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>用戶資料:</span>
                  <span className="text-gray-500">{formatLastSync(syncStatus.lastSync.users)}</span>
                </div>
                <div className="flex justify-between">
                  <span>活動資料:</span>
                  <span className="text-gray-500">{formatLastSync(syncStatus.lastSync.events)}</span>
                </div>
                <div className="flex justify-between">
                  <span>預訂資料:</span>
                  <span className="text-gray-500">{formatLastSync(syncStatus.lastSync.bookings)}</span>
                </div>
              </div>
            </div>

            {/* Error Information */}
            {syncStatus.errors.recentErrors > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-red-800">
                  <span>⚠️</span>
                  <span className="text-sm font-medium">
                    最近一小時有 {syncStatus.errors.recentErrors} 個同步錯誤
                  </span>
                </div>
                {syncStatus.errors.lastErrorTime && (
                  <div className="text-xs text-red-600 mt-1">
                    最後錯誤: {syncStatus.errors.lastErrorTime.toLocaleString('zh-TW')}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={handleForceSync}
                disabled={syncStatus.inProgress || !syncStatus.isOnline}
                className="w-full py-2 px-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-500 hover:to-orange-600 transition-all"
              >
                {syncStatus.inProgress ? '同步中...' : '立即同步'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}