// Member Media Upload Component with Cloudinary Integration
import React, { useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface MediaUploadProps {
  category: 'profile_photo' | 'introduction_video' | 'interview_video' | 'lifestyle_photo' | 'activity_photo'
  acceptedTypes: 'image' | 'video' | 'both'
  maxSize?: number // in MB
  maxDuration?: number // in seconds, for videos
  onUploadComplete?: (mediaId: string, url: string) => void
  onUploadError?: (error: string) => void
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  category,
  acceptedTypes,
  maxSize = 50,
  maxDuration = 300, // 5 minutes default
  onUploadComplete,
  onUploadError
}) => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const validateFile = (file: File): string | null => {
    // File size validation
    if (file.size > maxSize * 1024 * 1024) {
      return `檔案大小不能超過 ${maxSize}MB`
    }

    // File type validation
    if (acceptedTypes === 'image' && !file.type.startsWith('image/')) {
      return '只能上傳圖片檔案'
    }
    if (acceptedTypes === 'video' && !file.type.startsWith('video/')) {
      return '只能上傳影片檔案'
    }
    if (acceptedTypes === 'both' && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return '只能上傳圖片或影片檔案'
    }

    return null
  }

  const uploadToCloudinary = async (file: File) => {
    if (!user) {
      throw new Error('用戶未登入')
    }

    const validationError = validateFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    // Create FormData for Cloudinary upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'shesocial_members')
    formData.append('folder', `shesocial/members/${user._id}/${category}`)
    formData.append('context', `user_id=${user._id}|category=${category}|status=pending`)
    
    // Add video-specific parameters
    if (file.type.startsWith('video/')) {
      formData.append('resource_type', 'video')
      if (maxDuration) {
        formData.append('video_metadata', 'true')
      }
    }

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`
    
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('上傳失敗，請稍後再試')
    }

    const result = await response.json()
    
    // Validate video duration if applicable
    if (file.type.startsWith('video/') && result.duration && result.duration > maxDuration) {
      // Delete the uploaded file since it's too long
      await fetch(`https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/video/destroy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: result.public_id,
          api_key: process.env.VITE_CLOUDINARY_API_KEY,
          timestamp: Math.round(Date.now() / 1000),
          // Note: In production, signature should be generated on backend
        })
      })
      throw new Error(`影片長度不能超過 ${Math.floor(maxDuration / 60)} 分鐘`)
    }

    return result
  }

  const saveMediaToDatabase = async (cloudinaryResult: any) => {
    if (!user) throw new Error('用戶未登入')

    const mediaData = {
      userId: user._id,
      cloudinaryId: cloudinaryResult.public_id,
      url: cloudinaryResult.url,
      secureUrl: cloudinaryResult.secure_url,
      type: cloudinaryResult.resource_type === 'video' ? 'video' : 'image',
      category,
      metadata: {
        filename: cloudinaryResult.original_filename,
        size: cloudinaryResult.bytes,
        duration: cloudinaryResult.duration,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      },
      status: 'pending',
      visibility: {
        public: false, // Requires admin approval first
        members_only: true,
        premium_only: category === 'introduction_video' ? false : true
      }
    }

    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(mediaData)
    })

    if (!response.ok) {
      throw new Error('儲存媒體資訊失敗')
    }

    return response.json()
  }

  const handleFileUpload = async (file: File) => {
    if (!user) {
      onUploadError?.('請先登入')
      return
    }

    // Check if user has completed the interview
    if (user.membership?.status !== 'interview_completed' && user.membership?.status !== 'active') {
      onUploadError?.('請先完成面試才能上傳媒體')
      return
    }

    // Check upload permissions
    if (!user.membership?.permissions?.uploadMedia) {
      onUploadError?.('您目前沒有媒體上傳權限')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreviewUrl(previewUrl)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file)
      
      // Save to database
      const mediaRecord = await saveMediaToDatabase(cloudinaryResult)
      
      setUploadProgress(100)
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)
      
      onUploadComplete?.(mediaRecord.data._id, cloudinaryResult.secure_url)
      
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error instanceof Error ? error.message : '上傳失敗')
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const getCategoryDisplayName = () => {
    const categoryNames = {
      profile_photo: '個人照片',
      introduction_video: '自我介紹影片',
      interview_video: '面試影片',
      lifestyle_photo: '生活照片',
      activity_photo: '活動照片'
    }
    return categoryNames[category] || category
  }

  const getAcceptAttribute = () => {
    if (acceptedTypes === 'image') return 'image/*'
    if (acceptedTypes === 'video') return 'video/*'
    return 'image/*,video/*'
  }

  return (
    <div className="card-luxury p-6">
      <h3 className="text-lg font-semibold mb-4">上傳{getCategoryDisplayName()}</h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-luxury-gold bg-luxury-gold/10' 
            : 'border-secondary-300 hover:border-luxury-gold hover:bg-luxury-gold/5'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto text-luxury-gold">
              <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="text-secondary-700 mb-2">上傳中...</p>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div 
                  className="bg-luxury-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-secondary-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <>
            {previewUrl ? (
              <div className="space-y-4">
                {acceptedTypes === 'video' || category.includes('video') ? (
                  <video 
                    src={previewUrl} 
                    controls 
                    className="max-w-full max-h-48 mx-auto rounded-lg"
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="預覽" 
                    className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                  />
                )}
                <p className="text-sm text-secondary-600">檔案已選擇，正在處理...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto text-secondary-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-secondary-700 mb-2">
                  拖放{getCategoryDisplayName()}到此處，或點擊選擇檔案
                </p>
                <p className="text-sm text-secondary-500 mb-4">
                  {acceptedTypes === 'image' && `支援 JPG, PNG 格式，最大 ${maxSize}MB`}
                  {acceptedTypes === 'video' && `支援 MP4, MOV 格式，最大 ${maxSize}MB，${Math.floor(maxDuration / 60)} 分鐘`}
                  {acceptedTypes === 'both' && `支援圖片和影片格式，最大 ${maxSize}MB`}
                </p>
                <input
                  type="file"
                  accept={getAcceptAttribute()}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  id={`file-upload-${category}`}
                />
                <label
                  htmlFor={`file-upload-${category}`}
                  className="btn-luxury cursor-pointer inline-block"
                >
                  選擇檔案
                </label>
              </>
            )}
          </>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="mt-6 p-4 bg-luxury-pearl/20 rounded-lg">
        <h4 className="font-semibold text-secondary-800 mb-2">上傳須知</h4>
        <ul className="text-sm text-secondary-600 space-y-1">
          <li>• 所有媒體內容將由管理員審核後才會公開顯示</li>
          <li>• 請確保內容符合社區準則，避免不當內容</li>
          <li>• 審核通常在24小時內完成，您會收到電子郵件通知</li>
          {category === 'introduction_video' && (
            <li>• 自我介紹影片建議包含：姓名、年齡、職業、興趣愛好</li>
          )}
          {category === 'interview_video' && (
            <li>• 面試影片將僅供審核人員查看，不會公開展示</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default MediaUpload
