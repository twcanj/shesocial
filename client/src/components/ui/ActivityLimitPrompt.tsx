// Activity Limit Prompt Component
// Shows upgrade prompts when users hit their activity viewing limits
import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../../contexts/AuthContext'

interface ActivityLimitPromptProps {
  totalActivities: number
  viewableActivities: number
  membershipType: 'visitor' | 'registered' | 'vip' | 'vvip'
}

export const ActivityLimitPrompt: React.FC<ActivityLimitPromptProps> = ({
  totalActivities,
  viewableActivities,
  membershipType
}) => {
    const { openRegister } = useAuth()
  
  // Don't show if user can see all activities
  if (viewableActivities >= totalActivities) {
    return null
  }

  // Don't show for premium members (they should see all activities)
  if (membershipType === 'vip' || membershipType === 'vvip') {
    return null
  }

  const remainingActivities = totalActivities - viewableActivities

  const getPromptConfig = () => {
    switch (membershipType) {
      case 'visitor':
        return {
          title: '想看更多活動？',
          subtitle: `還有 ${remainingActivities} 個精彩活動等您發現`,
          description: '免費註冊會員，即可瀏覽最多 12 個活動',
          ctaText: '免費註冊',
          action: openRegister,
          icon: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          bgGradient: 'from-blue-500 to-purple-600'
        }
      
      case 'registered':
        return {
          title: '探索無限活動',
          subtitle: `還有 ${remainingActivities} 個活動等您參與`,
          description: '升級為 VIP 會員，解鎖無限活動瀏覽，享受優先報名特權',
          ctaText: '升級 VIP',
          action: () => window.location.href = '/pricing',
          icon: (
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          ),
          bgGradient: 'from-yellow-500 to-orange-600'
        }
      
      default:
        return null
    }
  }

  const config = getPromptConfig()
  if (!config) return null

  return (
    <div className="mt-8">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${config.bgGradient} p-8 text-white`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              {config.icon}
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold mb-2">
            {config.title}
          </h3>
          
          {/* Subtitle */}
          <p className="text-lg font-medium mb-3 text-white/90">
            {config.subtitle}
          </p>
          
          {/* Description */}
          <p className="text-white/80 mb-6 leading-relaxed">
            {config.description}
          </p>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-white/90 mb-2">
              <span>已瀏覽</span>
              <span>{viewableActivities} / {totalActivities}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(viewableActivities / totalActivities) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={config.action}
            className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            {config.ctaText}
          </button>
          
          {/* Additional Info */}
          {membershipType === 'visitor' && (
            <p className="text-xs text-white/70 mt-4">
              註冊完全免費，無需信用卡
            </p>
          )}
        </div>
      </div>
    </div>
  )
}