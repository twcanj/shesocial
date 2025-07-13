// Member Profile Management Page
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import MediaUpload from '../components/media/MediaUpload'
import MediaGallery from '../components/media/MediaGallery'
import InterviewBooking from '../components/interview/InterviewBooking'
import ProfileCompletion from '../components/onboarding/ProfileCompletion'
import OnboardingProgress from '../components/onboarding/OnboardingProgress'

type TabType = 'profile' | 'media' | 'interview' | 'settings'

export const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null)

  // Auto-set tab based on user status and URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    
    if (tabParam && ['profile', 'media', 'interview', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as TabType)
    } else if (user) {
      // Auto-redirect based on membership status
      const status = user.membership?.status
      const paymentStatus = user.membership?.paymentStatus
      
      if (paymentStatus !== 'completed') {
        // Redirect to payment
        window.location.href = '/pricing'
        return
      }
      
      if (status === 'paid' || status === 'profile_incomplete') {
        setActiveTab('profile') // Show profile completion
      } else if (status === 'interview_scheduled') {
        setActiveTab('interview')
      } else if (status === 'interview_completed') {
        setActiveTab('media')
      }
    }
  }, [user])

  if (!user) {
    return (
      <div className="container-luxury section-luxury">
        <div className="card-luxury p-8 text-center">
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">請先登入</h2>
          <p className="text-secondary-600">您需要登入才能查看個人檔案</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: '基本資料', icon: '👤' },
    { id: 'media', name: '媒體管理', icon: '📸' },
    { id: 'interview', name: '面試預約', icon: '🎥' },
    { id: 'settings', name: '帳號設定', icon: '⚙️' }
  ]

  const mediaCategories = [
    { 
      id: 'profile_photo', 
      name: '個人照片', 
      description: '用於個人檔案展示的主要照片',
      acceptedTypes: 'image' as const,
      maxSize: 10 
    },
    { 
      id: 'introduction_video', 
      name: '自我介紹影片', 
      description: '向其他會員介紹自己的短片',
      acceptedTypes: 'video' as const,
      maxSize: 50,
      maxDuration: 180 
    },
    { 
      id: 'lifestyle_photo', 
      name: '生活照片', 
      description: '展示日常生活和興趣愛好的照片',
      acceptedTypes: 'image' as const,
      maxSize: 10 
    },
    { 
      id: 'activity_photo', 
      name: '活動照片', 
      description: '參加SheSocial活動的照片',
      acceptedTypes: 'image' as const,
      maxSize: 10 
    }
  ]

  const handleUploadComplete = (mediaId: string, url: string) => {
    setUploadingCategory(null)
    // Refresh media gallery or update state
    window.location.reload() // Simple approach, could be optimized
  }

  const handleUploadError = (error: string) => {
    alert(`上傳失敗: ${error}`)
    setUploadingCategory(null)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        // Show onboarding progress and profile completion for incomplete profiles
        if (user.membership?.status === 'paid' || user.membership?.status === 'profile_incomplete') {
          return (
            <div className="space-y-6">
              <OnboardingProgress />
              <ProfileCompletion 
                onProfileComplete={() => {
                  alert('個人資料完善成功！現在可以預約面試了。')
                  setActiveTab('interview')
                }}
              />
            </div>
          )
        }
        
        return (
          <div className="space-y-6">
            {/* Onboarding Progress */}
            <OnboardingProgress />
            
            {/* User Info Card */}
            <div className="card-luxury p-6">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-24 h-24 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                  {user.profile?.avatar ? (
                    <img 
                      src={user.profile.avatar} 
                      alt={user.profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-luxury-gold">
                      {user.profile?.name?.charAt(0) || user.email.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-800">{user.profile?.name || '未設定姓名'}</h2>
                  <p className="text-secondary-600">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-3 py-1 bg-luxury-gold text-white text-sm rounded-full">
                      {user.membership?.type === 'regular' && 'Regular會員'}
                      {user.membership?.type === 'vip' && 'VIP會員'}
                      {user.membership?.type === 'premium_1300' && 'Premium 1300'}
                      {user.membership?.type === 'premium_2500' && 'Premium 2500'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-secondary-800 mb-3">基本資訊</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">年齡：</span>
                      <span>{user.profile?.age || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">所在地：</span>
                      <span>{user.profile?.location || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">加入日期：</span>
                      <span>
                        {user.membership?.joinDate 
                          ? new Date(user.membership.joinDate).toLocaleDateString('zh-TW')
                          : '未知'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-secondary-800 mb-3">會員權益</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        user.membership?.permissions?.viewParticipants ? 'bg-green-500' : 'bg-gray-300'
                      }`}></span>
                      <span>查看活動參與者</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        user.membership?.permissions?.priorityBooking ? 'bg-green-500' : 'bg-gray-300'
                      }`}></span>
                      <span>優先預訂活動</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {user.profile?.bio && (
                <div className="mt-6">
                  <h3 className="font-semibold text-secondary-800 mb-3">個人簡介</h3>
                  <p className="text-secondary-700 leading-relaxed">{user.profile.bio}</p>
                </div>
              )}

              {/* Interests */}
              {user.profile?.interests && user.profile.interests.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-secondary-800 mb-3">興趣愛好</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.profile.interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interview Status */}
            <div className="card-luxury p-6">
              <h3 className="font-semibold text-secondary-800 mb-4">面試狀態</h3>
              {user.profile?.interviewStatus?.completed ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-green-800">面試已完成</div>
                      <div className="text-sm text-green-600">
                        面試時間：{user.profile.interviewStatus.duration} 分鐘
                      </div>
                      {user.profile.interviewStatus.scheduledAt && (
                        <div className="text-sm text-green-600">
                          完成日期：{new Date(user.profile.interviewStatus.scheduledAt).toLocaleDateString('zh-TW')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-yellow-800">待完成面試</div>
                      <div className="text-sm text-yellow-600">
                        請前往面試預約頁面安排您的入會面試
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-6">
            {/* Upload Categories */}
            {!uploadingCategory && (
              <div className="card-luxury p-6">
                <h3 className="text-xl font-semibold mb-4">上傳新媒體</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mediaCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-4 border border-secondary-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold/5 cursor-pointer transition-colors"
                      onClick={() => setUploadingCategory(category.id)}
                    >
                      <h4 className="font-semibold text-secondary-800 mb-2">{category.name}</h4>
                      <p className="text-sm text-secondary-600 mb-3">{category.description}</p>
                      <div className="text-xs text-secondary-500">
                        {category.acceptedTypes === 'image' ? '圖片' : '影片'} • 
                        最大 {category.maxSize}MB
                        {category.maxDuration && ` • ${Math.floor(category.maxDuration / 60)} 分鐘`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Component */}
            {uploadingCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    上傳{mediaCategories.find(c => c.id === uploadingCategory)?.name}
                  </h3>
                  <button
                    onClick={() => setUploadingCategory(null)}
                    className="btn-luxury-outline"
                  >
                    返回
                  </button>
                </div>
                {(() => {
                  const category = mediaCategories.find(c => c.id === uploadingCategory)
                  if (!category) return null
                  
                  return (
                    <MediaUpload
                      category={category.id as any}
                      acceptedTypes={category.acceptedTypes}
                      maxSize={category.maxSize}
                      maxDuration={category.maxDuration}
                      onUploadComplete={handleUploadComplete}
                      onUploadError={handleUploadError}
                    />
                  )
                })()}
              </div>
            )}

            {/* Media Gallery */}
            {!uploadingCategory && (
              <div>
                <h3 className="text-xl font-semibold mb-4">我的媒體檔案</h3>
                <MediaGallery />
              </div>
            )}
          </div>
        )

      case 'interview':
        return (
          <div>
            {user.profile?.interviewStatus?.completed ? (
              <div className="card-luxury p-8 text-center">
                <div className="w-16 h-16 mx-auto text-green-600 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-2">面試已完成</h3>
                <p className="text-secondary-600">
                  您已成功完成入會面試，現在可以參加所有活動了！
                </p>
              </div>
            ) : (
              <InterviewBooking 
                onBookingComplete={(sessionId) => {
                  alert('面試預約成功！')
                  // Refresh user data or redirect
                }}
              />
            )}
          </div>
        )

      case 'settings':
        return (
          <div className="card-luxury p-6">
            <h3 className="text-xl font-semibold mb-4">帳號設定</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-secondary-800 mb-3">隱私設定</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-secondary-700">允許其他會員查看我的個人檔案</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-secondary-700">接收活動通知電子郵件</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-secondary-700">允許其他會員直接聯繫我</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-secondary-800 mb-3">帳號安全</h4>
                <div className="space-y-3">
                  <button className="btn-luxury-outline">
                    更改密碼
                  </button>
                  <button className="btn-luxury-outline">
                    更新電子郵件
                  </button>
                  <button className="btn-luxury-outline text-red-600 hover:bg-red-50">
                    刪除帳號
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container-luxury section-luxury">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-gradient-luxury animate-fade-in mb-4">
          個人檔案管理
        </h1>
        <p className="text-xl text-secondary-700">
          管理您的個人資訊、媒體檔案和帳號設定
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="card-luxury p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-luxury-gold text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default ProfilePage