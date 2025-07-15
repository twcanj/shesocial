// Reusable Authentication Reminder Component
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface AuthReminderProps {
  title?: string
  description?: string
  className?: string
}

export const AuthReminder: React.FC<AuthReminderProps> = ({
  title = "加入SheSocial會員",
  description = "登入後即可報名活動、查看詳細資訊，開始您的社交之旅",
  className = ""
}) => {
  const { openLogin, openRegister } = useAuth()

  return (
    <div className={`mt-12 text-center ${className}`}>
      <div className="luxury-card-selected p-8 max-w-md mx-auto">
        <svg className="mx-auto h-12 w-12 text-luxury-midnight-black mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 className="luxury-card-title mb-2">
          {title}
        </h3>
        <p className="text-luxury-midnight-black/80 mb-6">
          {description}
        </p>
        <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
          <button 
            onClick={openLogin}
            className="w-full sm:w-auto px-4 py-2 font-medium rounded-lg transition-all duration-300 border-2 border-luxury-midnight-black bg-transparent text-luxury-midnight-black hover:bg-luxury-midnight-black hover:text-luxury-gold"
          >
            登入
          </button>
          <button 
            onClick={openRegister}
            className="w-full sm:w-auto luxury-card-button-selected"
          >
            註冊會員
          </button>
        </div>
      </div>
    </div>
  )
}