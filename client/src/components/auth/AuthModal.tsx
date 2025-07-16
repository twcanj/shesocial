// Authentication Modal Component
import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { EnhancedRegistration } from '../onboarding/EnhancedRegistration'

interface AuthModalProps {
  mode: 'login' | 'register' | 'enhanced_register'
  onClose: () => void
  onToggleMode: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  mode, 
    onClose
}) => {
    const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'enhanced_register'>(mode)
  

  const handleSuccess = () => {
    onClose()
  }
  
  const handleRegistrationComplete = (userId: string) => {
    console.log('Registration completed for user:', userId)
    // Redirect to pricing page with personalized recommendations
    window.location.href = '/pricing'
  }
  
  const handleUseEnhancedRegistration = () => {
    setShowEnhancedRegistration(true)
    setCurrentMode('enhanced_register')
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-luxury-midnight-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-luxury-midnight-black border border-luxury-gold/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-platinum/60 hover:text-luxury-gold transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          {currentMode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={() => setCurrentMode('register')}
            />
          ) : currentMode === 'enhanced_register' ? (
            <EnhancedRegistration
              onRegistrationComplete={handleRegistrationComplete}
            />
          ) : (
            <div>
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setCurrentMode('login')}
              />
              
              {/* Option to use enhanced registration */}
              <div className="mt-6 luxury-card-outline p-4">
                <h4 className="font-semibold text-luxury-gold mb-2">
                  獲得個性化推薦
                </h4>
                <p className="text-sm text-luxury-platinum/80 mb-3">
                  填寫詳細資料，我們將為您推薦最適合的會員方案並提供專屬優惠
                </p>
                <button
                  onClick={handleUseEnhancedRegistration}
                  className="luxury-button-outline text-sm"
                >
                  使用進階註冊
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}