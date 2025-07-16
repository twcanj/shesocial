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
      pending: { text: '待審核', color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200' },
      approved: { text: '已通過', color: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' },
      rejected: { text: '已拒絕', color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200' },
      requires_revision: { text: '需要修改', color: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200' }
    }
    
    const config = statusConfig[status]
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${config.color}`}>
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
      <div className="luxury-card-gradient p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-6 relative">
          <div className="animate-spin w-12 h-12 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full"></div>
          <div className="absolute inset-0 animate-pulse">
            <div className="w-12 h-12 border-4 border-transparent border-t-luxury-rose rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
        </div>
        <p className="text-lg text-luxury-midnight-black/80 font-medium">載入媒體檔案中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="luxury-card-outline p-6 bg-gradient-to-br from-luxury-pearl/10 to-luxury-champagne/5">
        <h4 className="text-lg font-bold text-luxury-gold mb-4 flex items-center">
          <span className="w-2 h-2 bg-luxury-gold rounded-full mr-3 shadow-lg animate-pulse-luxury"></span>
          媒體分類
        </h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-500 transform hover:scale-105 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-luxury-gold via-luxury-rose to-luxury-gold text-white shadow-2xl luxury-glow border-2 border-luxury-gold/50'
                : 'luxury-card-outline bg-gradient-to-br from-white/80 to-luxury-pearl/30 text-luxury-midnight-black hover:from-luxury-gold/15 hover:to-luxury-rose/10 hover:shadow-lg'
            }`}
          >
            <span className="flex items-center">
              <span className="text-lg mr-2">📁</span>
              全部媒體
            </span>
            {selectedCategory === 'all' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-luxury-champagne to-white rounded-full animate-pulse-luxury shadow-lg"></div>
            )}
          </button>
          {['profile_photo', 'introduction_video', 'lifestyle_photo', 'activity_photo'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-500 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-luxury-gold via-luxury-rose to-luxury-gold text-white shadow-2xl luxury-glow border-2 border-luxury-gold/50'
                  : 'luxury-card-outline bg-gradient-to-br from-white/80 to-luxury-pearl/30 text-luxury-midnight-black hover:from-luxury-gold/15 hover:to-luxury-rose/10 hover:shadow-lg'
              }`}
            >
              <span className="flex items-center">
                <span className="text-lg mr-2">
                  {category === 'profile_photo' && '👤'}
                  {category === 'introduction_video' && '🎬'}
                  {category === 'lifestyle_photo' && '🌟'}
                  {category === 'activity_photo' && '🎉'}
                </span>
                {getCategoryDisplayName(category)}
              </span>
              {selectedCategory === category && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-luxury-champagne to-white rounded-full animate-pulse-luxury shadow-lg"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="luxury-card-gradient p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-luxury-pearl/20 to-luxury-champagne/30 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-luxury-platinum" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gradient-luxury mb-4">還沒有媒體檔案</h3>
          <p className="text-lg text-luxury-gold mb-8 max-w-md mx-auto leading-relaxed font-medium">
            {selectedCategory === 'all' 
              ? '開始上傳您的照片和影片來豐富個人檔案'
              : `還沒有${getCategoryDisplayName(selectedCategory)}`
            }
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-luxury-platinum">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-luxury-gold rounded-full mr-2"></div>
              高品質媒體
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-luxury-rose rounded-full mr-2"></div>
              專業審核
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-luxury-champagne rounded-full mr-2"></div>
              安全存儲
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMedia.map((item) => (
            <div key={item._id} className="group luxury-card-outline p-6 bg-gradient-to-br from-white/90 to-luxury-pearl/10 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              {/* Media Preview */}
              <div className="aspect-video bg-gradient-to-br from-luxury-pearl/20 to-luxury-champagne/30 rounded-xl mb-6 overflow-hidden shadow-lg luxury-card-outline">
                {item.type === 'video' ? (
                  <video 
                    src={item.secureUrl} 
                    controls 
                    className="w-full h-full object-cover rounded-xl"
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={item.secureUrl} 
                    alt={item.metadata.filename}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg text-luxury-midnight-black truncate flex items-center">
                    <span className="text-xl mr-2">
                      {item.category === 'profile_photo' && '👤'}
                      {item.category === 'introduction_video' && '🎬'}
                      {item.category === 'lifestyle_photo' && '🌟'}
                      {item.category === 'activity_photo' && '🎉'}
                    </span>
                    {getCategoryDisplayName(item.category)}
                  </h4>
                  {getStatusBadge(item.status)}
                </div>

                <div className="luxury-card-outline p-4 bg-gradient-to-br from-luxury-pearl/5 to-luxury-champagne/10 rounded-xl">
                  <div className="text-sm text-luxury-midnight-black/70 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">檔案大小：</span>
                      <span className="text-luxury-gold font-bold">{formatFileSize(item.metadata.size)}</span>
                    </div>
                    {item.metadata.duration && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">時長：</span>
                        <span className="text-luxury-gold font-bold">{formatDuration(item.metadata.duration)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">格式：</span>
                      <span className="text-luxury-gold font-bold">{item.metadata.format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">上傳時間：</span>
                      <span className="text-luxury-platinum font-bold">{new Date(item.createdAt).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                </div>

                {/* Review Information */}
                {item.reviewInfo && (
                  <div className="luxury-card-outline p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                    <div className="text-sm">
                      <div className="font-bold text-amber-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        審核意見
                      </div>
                      {item.reviewInfo.rejectionReason && (
                        <div className="text-red-700 mb-2 font-medium">
                          拒絕原因: {item.reviewInfo.rejectionReason}
                        </div>
                      )}
                      {item.reviewInfo.notes && (
                        <div className="text-amber-800 mb-2">
                          {item.reviewInfo.notes}
                        </div>
                      )}
                      <div className="text-xs text-amber-600 font-medium">
                        審核時間: {new Date(item.reviewInfo.reviewedAt).toLocaleString('zh-TW')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {item.status === 'rejected' || item.status === 'requires_revision' ? (
                    <button className="luxury-button-sm flex-1 bg-gradient-to-r from-luxury-gold to-luxury-rose">
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        重新上傳
                      </span>
                    </button>
                  ) : (
                    <a 
                      href={item.secureUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="luxury-button-sm flex-1 text-center bg-gradient-to-r from-luxury-champagne to-luxury-pearl text-luxury-midnight-black hover:from-luxury-gold hover:to-luxury-rose hover:text-white"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        查看原檔
                      </span>
                    </a>
                  )}
                  <button 
                    onClick={() => deleteMedia(item._id)}
                    className="luxury-button-sm px-4 bg-gradient-to-r from-red-100 to-rose-100 text-red-600 hover:from-red-200 hover:to-rose-200 border border-red-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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