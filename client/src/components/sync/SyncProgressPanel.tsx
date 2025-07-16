// Sync Progress Panel Component for detailed sync management
import React, { useState, useEffect } from 'react'
import { syncService } from '../../services/sync-service'
import type { SyncQueueItem } from '../../shared-types'

interface SyncStatistics {
  totalSynced: number
  lastSyncTime: Date | null
  avgSyncTime: number
  errorRate: number
  collectionStats: Record<string, {
    lastSync: Date | null
    pendingCount: number
  }>
}

export const SyncProgressPanel: React.FC = () => {
  const [stats, setStats] = useState<SyncStatistics | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'collections' | 'queue'>('overview')

  useEffect(() => {
    const updateStats = async () => {
      const statistics = await syncService.getSyncStatistics()
      setStats(statistics)
    }

    if (isVisible) {
      updateStats()
      const interval = setInterval(updateStats, 3000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const handleCollectionSync = async (collection: 'users' | 'events' | 'bookings') => {
    await syncService.syncSpecificCollection(collection)
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40"
        title="打開同步面板"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">同步管理面板</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-3">
          {[
            { id: 'overview', label: '總覽' },
            { id: 'collections', label: '集合' },
            { id: 'queue', label: '隊列' }
          ].map((tab) => (
            <button
              key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'overview' | 'collections' | 'queue')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {!stats ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalSynced}</div>
                    <div className="text-sm text-blue-800">總同步項目</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(stats.errorRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-800">錯誤率</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">最後同步</span>
                    <span>
                      {stats.lastSyncTime ? stats.lastSyncTime.toLocaleString('zh-TW') : '從未'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">平均同步時間</span>
                    <span>{formatDuration(stats.avgSyncTime)}</span>
                  </div>
                </div>

                <button
                  onClick={() => syncService.forceSyncNow()}
                  className="w-full py-2 px-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-orange-600 transition-all"
                >
                  強制完整同步
                </button>
              </div>
            )}

            {/* Collections Tab */}
            {activeTab === 'collections' && (
              <div className="space-y-3">
                {Object.entries(stats.collectionStats).map(([collection, collectionStat]) => (
                  <div key={collection} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">
                        {collection === 'users' ? '用戶' : 
                         collection === 'events' ? '活動' : '預訂'}
                      </h4>
                      <button
                                                onClick={() => handleCollectionSync(collection as 'users' | 'events' | 'bookings')}
                        className="text-sm px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        同步
                      </button>
                    </div>
                    
                    <div className="text-xs space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>最後同步:</span>
                        <span>
                          {collectionStat.lastSync 
                            ? collectionStat.lastSync.toLocaleString('zh-TW')
                            : '從未'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>待同步項目:</span>
                        <span className={collectionStat.pendingCount > 0 ? 'text-orange-600 font-medium' : ''}>
                          {collectionStat.pendingCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Queue Tab */}
            {activeTab === 'queue' && (
              <div className="space-y-3">
                <SyncQueueViewer />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Component to view sync queue items
const SyncQueueViewer: React.FC = () => {
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([])

  useEffect(() => {
    const loadQueueItems = async () => {
      // This would need to be implemented in the sync service
      // For now, we'll show a placeholder
      setQueueItems([])
    }
    loadQueueItems()
  }, [])

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">同步隊列</div>
      {queueItems.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          沒有待同步的項目
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {queueItems.map((item, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.operation} {item.collection}</span>
                <span className={`px-2 py-1 rounded ${
                  item.priority === 'high' ? 'bg-red-100 text-red-700' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.priority}
                </span>
              </div>
              <div className="text-gray-500 mt-1">
                重試: {item.retries} | {new Date(item.timestamp).toLocaleString('zh-TW')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}