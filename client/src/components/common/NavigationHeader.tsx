// Navigation Header - Shared navigation component for all pages
import React from 'react'
import { useOfflineDB, useNetworkSync } from '../../hooks/useOfflineDB'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../../contexts/AuthContext'

interface NavigationHeaderProps {
  currentPage: string
  onPageChange: (page: 'home' | 'events' | 'members' | 'about' | 'pricing') => void
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentPage,
  onPageChange
}) => {
  const { isInitialized } = useOfflineDB()
  const { isOnline, pendingSyncCount } = useNetworkSync()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { openLogin, openRegister } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="nav-luxury">
      <div className="container-luxury">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo - clickable to go home */}
            <button 
              onClick={() => onPageChange('home')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.jpeg" 
                alt="SheSocial Logo" 
                className="h-12 w-12 object-contain filter brightness-0 invert sepia saturate-[3] hue-rotate-[25deg] brightness-[1.2]"
              />
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-gradient-luxury">
                  SheSocial
                </div>
                <div className="text-sm text-secondary-500 -mt-1">
                  奢華社交活動平台
                </div>
              </div>
            </button>
            
            {/* Database Status Indicator */}
            <div className="flex items-center space-x-2 ml-4">
              <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-secondary-600">
                {isInitialized ? 'DB Ready' : 'DB Loading'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-xs text-secondary-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {pendingSyncCount > 0 && (
                <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                  {pendingSyncCount} pending
                </span>
              )}
            </div>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => onPageChange('events')}
              className={`transition-colors ${
                currentPage === 'events' 
                  ? 'text-luxury-gold font-semibold' 
                  : 'text-secondary-600 hover:text-luxury-gold'
              }`}
            >
              活動
            </button>
            <button 
              onClick={() => onPageChange('members')}
              className={`transition-colors ${
                currentPage === 'members' 
                  ? 'text-luxury-gold font-semibold' 
                  : 'text-secondary-600 hover:text-luxury-gold'
              }`}
            >
              會員
            </button>
            <button 
              onClick={() => onPageChange('pricing')}
              className={`transition-colors ${
                currentPage === 'pricing' 
                  ? 'text-luxury-gold font-semibold' 
                  : 'text-secondary-600 hover:text-luxury-gold'
              }`}
            >
              方案
            </button>
            <button 
              onClick={() => onPageChange('about')}
              className={`transition-colors ${
                currentPage === 'about' 
                  ? 'text-luxury-gold font-semibold' 
                  : 'text-secondary-600 hover:text-luxury-gold'
              }`}
            >
              關於
            </button>
          </nav>
          
          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-secondary-700">
                      {user?.profile?.name || user?.email}
                    </div>
                    <div className="text-xs text-secondary-500 capitalize">
                      {user?.membership?.type || 'regular'} 會員
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn-luxury-ghost text-sm"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={openLogin}
                  className="btn-luxury-ghost"
                >
                  登入
                </button>
                <button 
                  onClick={openRegister}
                  className="btn-luxury"
                >
                  註冊
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}