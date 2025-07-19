// Admin Media Moderation Dashboard
import React, { useState, useEffect, useCallback } from 'react'

interface ModerationItem {
  _id: string
  mediaId: string
  userId: string
  userName: string
  userEmail: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  category: string
  status: 'pending' | 'in_review' | 'completed'
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  metadata: {
    filename: string
    size: number
    duration?: number
    format: string
  }
  flags?: {
    inappropriate_content: boolean
    poor_quality: boolean
    privacy_violation: boolean
    fake_profile: boolean
    other: string
  }
}

export const ModerationDashboard: React.FC = () => {
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  const fetchModerationQueue = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/moderation-queue?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setModerationQueue(data.data || [])
      }
    } catch (error) {
      // Failed to fetch moderation queue
    } finally {
      setLoading(false)
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchModerationQueue();
  }, [fetchModerationQueue]);

  const handleReview = async (decision: 'approve' | 'reject' | 'require_revision') => {
    if (!selectedItem) return

    try {
      const reviewData = {
        decision,
        notes: reviewNotes,
        rejectionReason: decision === 'reject' ? rejectionReason : undefined
      }

      const response = await fetch(`/api/admin/moderate-media/${selectedItem.mediaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(reviewData)
      })

      if (response.ok) {
        // Remove item from queue
        setModerationQueue(prev => prev.filter(item => item._id !== selectedItem._id))
        setSelectedItem(null)
        setReviewNotes('')
        setRejectionReason('')
        
        // Show success message
        alert(`媒體已${decision === 'approve' ? '通過審核' : decision === 'reject' ? '拒絕' : '要求修改'}`)
      } else {
        alert('審核失敗，請稍後再試')
      }
    } catch (error) {
      alert('審核失敗，請稍後再試')
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { text: '高', color: 'bg-red-100 text-red-800' },
      medium: { text: '中', color: 'bg-yellow-100 text-yellow-800' },
      low: { text: '低', color: 'bg-green-100 text-green-800' }
    }
    
    const config = priorityConfig[priority as keyof typeof priorityConfig]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryNames = {
      profile_photo: '個人照片',
      introduction_video: '自我介紹影片',
      interview_video: '面試影片',
      lifestyle_photo: '生活照片',
      activity_photo: '活動照片'
    }
    return categoryNames[category as keyof typeof categoryNames] || category
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>載入審核隊列中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">媒體審核管理</h1>
          <div className="flex space-x-2">
            {['pending', 'in_review', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-luxury-gold text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'pending' && '待審核'}
                {status === 'in_review' && '審核中'}
                {status === 'completed' && '已完成'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {moderationQueue.filter(item => item.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-700">待審核</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {moderationQueue.filter(item => item.status === 'in_review').length}
            </div>
            <div className="text-sm text-blue-700">審核中</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {moderationQueue.filter(item => item.priority === 'high').length}
            </div>
            <div className="text-sm text-red-700">高優先級</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {moderationQueue.filter(item => item.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">已完成</div>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">審核隊列 ({moderationQueue.length})</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {moderationQueue.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                沒有需要審核的項目
              </div>
            ) : (
              <div className="divide-y">
                {moderationQueue.map((item) => (
                  <div
                    key={item._id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedItem?._id === item._id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-800">{item.userName}</span>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getCategoryDisplayName(item.category)} • {item.mediaType === 'video' ? '影片' : '圖片'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleString('zh-TW')}
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden ml-4">
                        {item.mediaType === 'video' ? (
                          <video src={item.mediaUrl} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.mediaUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review Panel */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">審核面板</h2>
          </div>
          {selectedItem ? (
            <div className="p-6 space-y-6">
              {/* Media Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedItem.mediaType === 'video' ? (
                  <video 
                    src={selectedItem.mediaUrl} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={selectedItem.mediaUrl} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">會員：</span>
                    <span className="ml-2">{selectedItem.userName}</span>
                  </div>
                  <div>
                    <span className="font-medium">電子郵件：</span>
                    <span className="ml-2">{selectedItem.userEmail}</span>
                  </div>
                  <div>
                    <span className="font-medium">類別：</span>
                    <span className="ml-2">{getCategoryDisplayName(selectedItem.category)}</span>
                  </div>
                  <div>
                    <span className="font-medium">檔案大小：</span>
                    <span className="ml-2">{formatFileSize(selectedItem.metadata.size)}</span>
                  </div>
                  {selectedItem.metadata.duration && (
                    <div>
                      <span className="font-medium">時長：</span>
                      <span className="ml-2">{Math.floor(selectedItem.metadata.duration / 60)}:{(selectedItem.metadata.duration % 60).toFixed(0).padStart(2, '0')}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">格式：</span>
                    <span className="ml-2">{selectedItem.metadata.format.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    審核意見
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    rows={3}
                    placeholder="請輸入審核意見或建議..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    拒絕原因 (拒絕時必填)
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                    placeholder="例如：內容不符合社區準則、畫質不佳等"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleReview('approve')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  通過
                </button>
                <button
                  onClick={() => handleReview('require_revision')}
                  className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  要求修改
                </button>
                <button
                  onClick={() => handleReview('reject')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  disabled={!rejectionReason.trim()}
                >
                  拒絕
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              請選擇要審核的項目
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModerationDashboard