// Member Media Gallery Component
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface MediaItem {
  _id: string
  cloudinaryId: string
  url: string
  secureUrl: string
  type: 'image' | 'video'
  category: 'profile_photo' | 'introduction_video' | 'interview_video' | 'lifestyle_photo' | 'activity_photo'
  status: 'pending' | 'approved' | 'rejected' | 'requires_revision'
  reviewInfo?: {
    reviewedBy: string
    reviewedAt: string
    rejectionReason?: string
    notes?: string
  }
  metadata: {
    filename: string
    size: number
    duration?: number
    format: string
  }
  createdAt: string
}

export const MediaGallery: React.FC = () => {
  const { user } = useAuth()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchUserMedia()
    }
  }, [user])

  const fetchUserMedia = async () => {
    try {
      const response = await fetch('/api/media/my-media', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMedia = async (mediaId: string) => {
    if (!confirm('確定要刪除這個媒體檔案嗎？')) return

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item._id !== mediaId))
      } else {
        alert('刪除失敗，請稍後再試')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  const getStatusBadge = (status: MediaItem['status']) => {
    const statusConfig = {
      pending: { text: '待審核', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: '已通過', color: 'bg-green-100 text-green-800' },
      rejected: { text: '已拒絕', color: 'bg-red-100 text-red-800' },
      requires_revision: { text: '需要修改', color: 'bg-orange-100 text-orange-800' }
    }
    
    const config = statusConfig[status]
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const filteredMedia = selectedCategory === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="card-luxury p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>載入媒體檔案中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="card-luxury p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-luxury-gold text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            全部媒體
          </button>
          {['profile_photo', 'introduction_video', 'lifestyle_photo', 'activity_photo'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-luxury-gold text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {getCategoryDisplayName(category)}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="card-luxury p-8 text-center">
          <div className="w-16 h-16 mx-auto text-secondary-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-secondary-700 mb-2">還沒有媒體檔案</h3>
          <p className="text-secondary-500">
            {selectedCategory === 'all' 
              ? '開始上傳您的照片和影片來豐富個人檔案'
              : `還沒有${getCategoryDisplayName(selectedCategory)}`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <div key={item._id} className="card-luxury p-4">
              {/* Media Preview */}
              <div className="aspect-video bg-secondary-100 rounded-lg mb-4 overflow-hidden">
                {item.type === 'video' ? (
                  <video 
                    src={item.secureUrl} 
                    controls 
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={item.secureUrl} 
                    alt={item.metadata.filename}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-secondary-800 truncate">
                    {getCategoryDisplayName(item.category)}
                  </h4>
                  {getStatusBadge(item.status)}
                </div>

                <div className="text-sm text-secondary-600 space-y-1">
                  <div className="flex justify-between">
                    <span>檔案大小：</span>
                    <span>{formatFileSize(item.metadata.size)}</span>
                  </div>
                  {item.metadata.duration && (
                    <div className="flex justify-between">
                      <span>時長：</span>
                      <span>{formatDuration(item.metadata.duration)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>格式：</span>
                    <span>{item.metadata.format.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>上傳時間：</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('zh-TW')}</span>
                  </div>
                </div>

                {/* Review Information */}
                {item.reviewInfo && (
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <div className="text-sm text-secondary-600">
                      <div className="font-medium mb-1">審核意見：</div>
                      {item.reviewInfo.rejectionReason && (
                        <div className="text-red-600 mb-2">
                          拒絕原因: {item.reviewInfo.rejectionReason}
                        </div>
                      )}
                      {item.reviewInfo.notes && (
                        <div className="text-secondary-700">
                          {item.reviewInfo.notes}
                        </div>
                      )}
                      <div className="text-xs text-secondary-500 mt-2">
                        審核時間: {new Date(item.reviewInfo.reviewedAt).toLocaleString('zh-TW')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {item.status === 'rejected' || item.status === 'requires_revision' ? (
                    <button className="btn-luxury-outline text-sm flex-1">
                      重新上傳
                    </button>
                  ) : (
                    <a 
                      href={item.secureUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-luxury-outline text-sm flex-1 text-center"
                    >
                      查看原檔
                    </a>
                  )}
                  <button 
                    onClick={() => deleteMedia(item._id)}
                    className="btn-luxury-outline text-sm px-3 text-red-600 hover:bg-red-50"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaGallery