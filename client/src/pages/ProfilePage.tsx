// Member Profile Management Page
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import MediaUpload from '../components/media/MediaUpload'
import MediaGallery from '../components/media/MediaGallery'
import InterviewBooking from '../components/interview/InterviewBooking'
import ProfileCompletion from '../components/onboarding/ProfileCompletion'
import OnboardingProgress from '../components/onboarding/OnboardingProgress'

type TabType = 'profile' | 'media' | 'interview' | 'settings'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null)
  
  console.log('ProfilePage rendered, user:', user) // Debug log

  // Auto-set tab based on user status and URL parameters
  useEffect(() => {
    if (!user) return
    
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      
      if (tabParam && ['profile', 'media', 'interview', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam as TabType)
      } else {
        // Auto-redirect based on membership status
        const status = user.membership?.status
        const paymentStatus = user.membership?.paymentStatus
        
        console.log('ProfilePage - User status:', status, 'Payment status:', paymentStatus) // Debug log
        
        // Only redirect if payment is explicitly required for paid memberships
        if (paymentStatus === 'pending' && (user.membership?.type === 'vip' || user.membership?.type === 'vvip')) {
          // Navigate to payment page only for paid memberships with pending payment
          navigate('/pricing')
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
    } catch (error) {
      console.error('Error in ProfilePage useEffect:', error)
      // Fallback to profile tab
      setActiveTab('profile')
    }
  }, [user, navigate])

  if (!user) {
    return (
      <div className="container-luxury section-luxury">
        <div className="luxury-card-outline p-8 text-center">
          <h2 className="text-2xl font-bold text-luxury-gold mb-4">請先登入</h2>
          <p className="text-luxury-platinum">您需要登入才能查看個人檔案</p>
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

  const handleUploadComplete = (_mediaId: string, _url: string) => {
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
            <div className="luxury-card-gradient p-8">
              <div className="flex items-center space-x-8 mb-8">
                <div className="relative">
                  <div className="w-28 h-28 luxury-card-outline rounded-full flex items-center justify-center bg-gradient-to-br from-luxury-champagne/30 to-luxury-pearl/30">
                    {user.profile?.avatar ? (
                      <img 
                        src={user.profile.avatar} 
                        alt={user.profile.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-luxury-gold font-serif">
                        {user.profile?.name?.charAt(0) || user.email.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-luxury-midnight-black mb-2">
                    {user.profile?.name || '未設定姓名'}
                  </h2>
                  <p className="text-luxury-platinum/80 mb-3">{user.email}</p>
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      user.membership?.type === 'vvip' ? 'bg-gradient-to-r from-luxury-gold to-luxury-rose text-white' :
                      user.membership?.type === 'vip' ? 'bg-luxury-gold text-white' :
                      user.membership?.type === 'registered' ? 'bg-luxury-champagne text-luxury-midnight-black' :
                      'bg-luxury-pearl/30 text-luxury-platinum'
                    }`}>
                      {user.membership?.type === 'visitor' && '✨ 訪客'}
                      {user.membership?.type === 'registered' && '💎 註冊會員'}
                      {user.membership?.type === 'vip' && '👑 VIP會員'}
                      {user.membership?.type === 'vvip' && '💫 VVIP會員'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="luxury-card-outline p-6 bg-gradient-to-br from-luxury-pearl/10 to-luxury-champagne/5">
                  <h3 className="font-bold text-luxury-midnight-black mb-4 flex items-center">
                    <span className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></span>
                    基本資訊
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-luxury-pearl/30">
                      <span className="text-luxury-platinum">年齡</span>
                      <span className="font-medium text-luxury-midnight-black">
                        {user.profile?.age || '未設定'} 歲
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-luxury-pearl/30">
                      <span className="text-luxury-platinum">所在地</span>
                      <span className="font-medium text-luxury-midnight-black">
                        {user.profile?.location || '未設定'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-luxury-platinum">加入日期</span>
                      <span className="font-medium text-luxury-midnight-black">
                        {user.membership?.joinDate 
                          ? new Date(user.membership.joinDate).toLocaleDateString('zh-TW')
                          : '未知'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="luxury-card-outline p-6 bg-gradient-to-br from-luxury-champagne/10 to-luxury-gold/5">
                  <h3 className="font-bold text-luxury-midnight-black mb-4 flex items-center">
                    <span className="w-2 h-2 bg-luxury-rose rounded-full mr-3"></span>
                    會員權益
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                          user.membership?.permissions?.viewParticipants 
                            ? 'bg-luxury-gold' 
                            : 'bg-luxury-pearl/30'
                        }`}>
                          {user.membership?.permissions?.viewParticipants && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-luxury-midnight-black">查看活動參與者</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.membership?.permissions?.viewParticipants 
                          ? 'bg-luxury-gold/20 text-luxury-gold' 
                          : 'bg-luxury-pearl/20 text-luxury-platinum'
                      }`}>
                        {user.membership?.permissions?.viewParticipants ? '已啟用' : '未啟用'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                          user.membership?.permissions?.priorityBooking 
                            ? 'bg-luxury-gold' 
                            : 'bg-luxury-pearl/30'
                        }`}>
                          {user.membership?.permissions?.priorityBooking && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-luxury-midnight-black">優先預訂活動</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.membership?.permissions?.priorityBooking 
                          ? 'bg-luxury-gold/20 text-luxury-gold' 
                          : 'bg-luxury-pearl/20 text-luxury-platinum'
                      }`}>
                        {user.membership?.permissions?.priorityBooking ? '已啟用' : '未啟用'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {user.profile?.bio && (
                <div className="mt-8 luxury-card-outline p-6 bg-gradient-to-br from-luxury-pearl/5 to-luxury-champagne/10">
                  <h3 className="font-bold text-luxury-midnight-black mb-4 flex items-center">
                    <span className="w-2 h-2 bg-luxury-rose rounded-full mr-3"></span>
                    個人簡介
                  </h3>
                  <p className="text-luxury-midnight-black leading-relaxed italic">
                    "{user.profile.bio}"
                  </p>
                </div>
              )}

              {/* Interests */}
              {user.profile?.interests && user.profile.interests.length > 0 && (
                <div className="mt-8 luxury-card-outline p-6 bg-gradient-to-br from-luxury-gold/5 to-luxury-champagne/10">
                  <h3 className="font-bold text-luxury-midnight-black mb-4 flex items-center">
                    <span className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></span>
                    興趣愛好
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {user.profile.interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 luxury-card-outline bg-gradient-to-r from-luxury-champagne/30 to-luxury-pearl/20 text-luxury-midnight-black rounded-full text-sm font-medium hover:from-luxury-gold/20 hover:to-luxury-rose/20 transition-all duration-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interview Status */}
            <div className="luxury-card-gradient p-8">
              <h3 className="font-bold text-luxury-midnight-black mb-6 flex items-center">
                <span className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></span>
                面試狀態
              </h3>
              {user.profile?.interviewStatus?.completed ? (
                <div className="luxury-card-outline p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-emerald-800 text-lg">面試已完成 ✨</div>
                      <div className="text-emerald-600 mt-1">
                        面試時間：{user.profile.interviewStatus.duration} 分鐘
                      </div>
                      {user.profile.interviewStatus.scheduledAt && (
                        <div className="text-emerald-600">
                          完成日期：{new Date(user.profile.interviewStatus.scheduledAt).toLocaleDateString('zh-TW')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="luxury-card-outline p-6 bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-amber-800 text-lg">待完成面試 ⏳</div>
                      <div className="text-amber-600 mt-1">
                        請前往面試預約頁面安排您的入會面試
                      </div>
                      <button 
                        onClick={() => setActiveTab('interview')}
                        className="mt-3 luxury-button-sm"
                      >
                        立即預約面試
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-8">
            {/* Upload Categories */}
            {!uploadingCategory && (
              <div className="luxury-card-gradient p-8">
                <h3 className="text-2xl font-bold text-gradient-luxury mb-8 flex items-center">
                  <span className="w-3 h-3 bg-luxury-rose rounded-full mr-3"></span>
                  上傳新媒體
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mediaCategories.map((category) => (
                    <div
                      key={category.id}
                      className="group luxury-card-outline p-6 bg-gradient-to-br from-white/80 to-luxury-pearl/20 rounded-2xl hover:from-luxury-gold/10 hover:to-luxury-rose/5 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                      onClick={() => setUploadingCategory(category.id)}
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-luxury-champagne to-luxury-pearl rounded-full flex items-center justify-center mr-4 group-hover:from-luxury-gold group-hover:to-luxury-rose transition-all duration-300">
                          <span className="text-2xl">
                            {category.acceptedTypes === 'image' ? '📸' : '🎥'}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg text-luxury-midnight-black group-hover:text-luxury-gold transition-colors duration-300">
                          {category.name}
                        </h4>
                      </div>
                      <p className="text-sm text-luxury-midnight-black/70 mb-4 leading-relaxed">
                        {category.description}
                      </p>
                      <div className="flex items-center text-xs text-luxury-platinum space-x-3">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-luxury-gold rounded-full mr-1"></div>
                          {category.acceptedTypes === 'image' ? '圖片' : '影片'}
                        </span>
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-luxury-rose rounded-full mr-1"></div>
                          最大 {category.maxSize}MB
                        </span>
                        {category.maxDuration && (
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-luxury-champagne rounded-full mr-1"></div>
                            {Math.floor(category.maxDuration / 60)} 分鐘
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Component */}
            {uploadingCategory && (
              <div className="space-y-6">
                <div className="luxury-card-gradient p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gradient-luxury flex items-center">
                      <span className="w-3 h-3 bg-luxury-gold rounded-full mr-3"></span>
                      上傳{mediaCategories.find(c => c.id === uploadingCategory)?.name}
                    </h3>
                    <button
                      onClick={() => setUploadingCategory(null)}
                      className="luxury-button-sm bg-gradient-to-r from-luxury-pearl to-luxury-champagne text-luxury-midnight-black hover:from-luxury-champagne hover:to-luxury-gold"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        返回
                      </span>
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
              </div>
            )}

            {/* Media Gallery */}
            {!uploadingCategory && (
              <div className="luxury-card-gradient p-8">
                <h3 className="text-2xl font-bold text-gradient-luxury mb-8 flex items-center">
                  <span className="w-3 h-3 bg-luxury-champagne rounded-full mr-3"></span>
                  我的媒體檔案
                </h3>
                <MediaGallery />
              </div>
            )}
          </div>
        )

      case 'interview':
        return (
          <div>
            {user.profile?.interviewStatus?.completed ? (
              <div className="luxury-card-gradient p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl luxury-glow">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gradient-luxury mb-6">面試已完成 🎉</h3>
                <p className="text-lg text-luxury-midnight-black/80 mb-8 leading-relaxed max-w-md mx-auto">
                  您已成功完成入會面試，現在可以參加所有活動了！
                </p>
                <div className="flex items-center justify-center space-x-8 text-sm text-luxury-platinum">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    身份已驗證
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-luxury-gold rounded-full mr-2"></div>
                    可參加活動
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-luxury-rose rounded-full mr-2"></div>
                    會員權益啟用
                  </div>
                </div>
              </div>
            ) : (
              <div className="luxury-card-gradient p-8">
                <h3 className="text-2xl font-bold text-gradient-luxury mb-8 flex items-center">
                  <span className="w-3 h-3 bg-luxury-gold rounded-full mr-3"></span>
                  預約面試
                </h3>
                <InterviewBooking 
                  onBookingComplete={(sessionId) => {
                    alert('面試預約成功！')
                    // Refresh user data or redirect
                  }}
                />
              </div>
            )}
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-8">
            {/* Privacy Settings */}
            <div className="luxury-card-gradient p-8">
              <h3 className="text-2xl font-bold text-gradient-luxury mb-8 flex items-center">
                <span className="w-3 h-3 bg-luxury-gold rounded-full mr-3"></span>
                帳號設定
              </h3>
              
              <div className="space-y-8">
                <div className="luxury-card-outline p-6 bg-gradient-to-br from-luxury-pearl/10 to-luxury-champagne/5">
                  <h4 className="text-xl font-bold text-luxury-midnight-black mb-6 flex items-center">
                    <span className="w-2 h-2 bg-luxury-rose rounded-full mr-3"></span>
                    隱私設定
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center p-4 luxury-card-outline bg-white/50 rounded-xl hover:bg-luxury-gold/5 transition-colors cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" defaultChecked />
                        <div className="w-6 h-6 bg-gradient-to-r from-luxury-gold to-luxury-rose rounded-md flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-4 text-luxury-midnight-black font-medium">允許其他會員查看我的個人檔案</span>
                    </label>
                    <label className="flex items-center p-4 luxury-card-outline bg-white/50 rounded-xl hover:bg-luxury-gold/5 transition-colors cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" defaultChecked />
                        <div className="w-6 h-6 bg-gradient-to-r from-luxury-gold to-luxury-rose rounded-md flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <span className="ml-4 text-luxury-midnight-black font-medium">接收活動通知電子郵件</span>
                    </label>
                    <label className="flex items-center p-4 luxury-card-outline bg-white/50 rounded-xl hover:bg-luxury-gold/5 transition-colors cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" />
                        <div className="w-6 h-6 bg-luxury-pearl/50 border-2 border-luxury-platinum/50 rounded-md"></div>
                      </div>
                      <span className="ml-4 text-luxury-midnight-black font-medium">允許其他會員直接聯繫我</span>
                    </label>
                  </div>
                </div>

                <div className="luxury-card-outline p-6 bg-gradient-to-br from-luxury-champagne/10 to-luxury-gold/5">
                  <h4 className="text-xl font-bold text-luxury-gold mb-6 flex items-center">
                    <span className="w-2 h-2 bg-luxury-gold rounded-full mr-3 animate-pulse-luxury"></span>
                    帳號安全
                  </h4>
                  <div className="space-y-4">
                    <button className="w-full luxury-button-sm justify-between">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V7a2 2 0 012-2h6a2 2 0 012 2z" />
                        </svg>
                        更改密碼
                      </span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button className="w-full luxury-button-sm justify-between">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        更新電子郵件
                      </span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button className="w-full p-4 luxury-card-outline bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 rounded-xl transition-all duration-300 flex items-center justify-between group">
                      <span className="flex items-center font-medium">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        刪除帳號
                      </span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
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
        <p className="text-xl text-luxury-platinum">
          管理您的個人資訊、媒體檔案和帳號設定
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="luxury-card-gradient p-8 mb-8">
        <div className="flex flex-wrap gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`group relative flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-luxury-gold via-luxury-rose to-luxury-gold text-white shadow-2xl luxury-glow border-2 border-luxury-gold/50'
                  : 'luxury-card-outline bg-gradient-to-br from-white/80 via-luxury-pearl/30 to-luxury-champagne/40 text-luxury-midnight-black hover:from-luxury-gold/15 hover:via-luxury-rose/10 hover:to-luxury-champagne/25 hover:shadow-lg hover:border-luxury-gold/30'
              }`}
            >
              <span className={`text-xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'drop-shadow-lg scale-110' 
                  : 'group-hover:scale-110 group-hover:drop-shadow-md'
              }`}>
                {tab.icon}
              </span>
              <span className={`font-bold text-sm tracking-wide ${
                activeTab === tab.id
                  ? 'text-white drop-shadow-sm'
                  : 'text-luxury-midnight-black group-hover:text-luxury-gold'
              }`}>
                {tab.name}
              </span>
              {activeTab === tab.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-luxury-champagne to-white rounded-full animate-pulse-luxury shadow-lg"></div>
              )}
              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-luxury-gold/20 via-transparent to-luxury-rose/20'
                  : 'group-hover:bg-gradient-to-r group-hover:from-luxury-gold/10 group-hover:via-transparent group-hover:to-luxury-rose/10'
              }`}></div>
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