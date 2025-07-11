// Authentication Modal Component
import React from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthModalProps {
  mode: 'login' | 'register'
  onClose: () => void
  onToggleMode: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  mode, 
  onClose, 
  onToggleMode 
}) => {

  const handleSuccess = () => {
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={onToggleMode}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={onToggleMode}
            />
          )}
        </div>
      </div>
    </div>
  )
}