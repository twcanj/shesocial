// Navigation Header - Shared navigation component for all pages
import React, { useState } from 'react'
import { useOfflineDB, useNetworkSync } from '../../hooks/useOfflineDB'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../../contexts/AuthContext'

interface NavigationHeaderProps {
  currentPage: string
  onPageChange: (page: 'home' | 'events' | 'members' | 'about' | 'pricing' | 'profile') => void
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentPage,
  onPageChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isInitialized } = useOfflineDB()
  const { isOnline, pendingSyncCount } = useNetworkSync()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { openLogin, openRegister } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const handlePageChange = (page: 'home' | 'events' | 'members' | 'about' | 'pricing' | 'profile') => {
    onPageChange(page)
    setIsMobileMenuOpen(false) // Close mobile menu after navigation
  }

  return (
    <header className="nav-luxury">
      <div className="container-luxury">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo - clickable to go home */}
            <button 
              onClick={() => handlePageChange('home')}
              className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.jpeg" 
                alt="InfinityMatch Logo" 
                className="h-10 w-10 md:h-12 md:w-12 object-contain filter brightness-0 invert sepia saturate-[3] hue-rotate-[25deg] brightness-[1.2]"
              />
              <div className="flex flex-col">
                <div className="text-xl md:text-2xl font-bold text-gradient-luxury">
                  天造地設人成對
                </div>
                <div className="text-xs md:text-sm text-secondary-500 -mt-1 hidden sm:block">
                  InfinityMatch | 1+1=∞
                </div>
              </div>
            </button>
            
            {/* Database Status Indicator - Hidden on very small screens */}
            <div className="hidden sm:flex items-center space-x-2 ml-4">
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
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => handlePageChange('events')}
              className={`transition-colors ${
                currentPage === 'events' 
                  ? 'text-luxury-gold font-semibold' 
                  : 'text-secondary-600 hover:text-luxury-gold'
              }`}
            >
              活動
            </button>
            <button 
              onClick={() => handlePageChange('members')}
              className={`transition-colors ${
                currentPage === 'members' 
                  ? 'text-luxury-gold font-semibold' 
                  : 'text-secondary-600 hover:text-luxury-gold'
              }`}
            >
              會員
            </button>
            <button 
              onClick={() => handlePageChange('pricing')}
              className={`transition-colors ${
                currentPage === 'pricing' 
                  ? 'text-luxury-gold font-semibold' 
                  : 'text-secondary-600 hover:text-luxury-gold'
              }`}
            >
              方案
            </button>
            <button 
              onClick={() => handlePageChange('about')}
              className={`transition-colors ${
                currentPage === 'about' 
                  ? 'text-luxury-gold font-semibold' 
                  : 'text-secondary-600 hover:text-luxury-gold'
              }`}
            >
              關於
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-secondary-600 hover:text-luxury-gold hover:bg-secondary-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-secondary-700">
                      {user?.profile?.name || user?.email}
                    </div>
                    <div className="text-xs text-secondary-500 capitalize">
                      {user?.membership?.type || 'regular'} 會員
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handlePageChange('profile')}
                  className={`btn-luxury-ghost text-sm ${
                    currentPage === 'profile' ? 'bg-luxury-gold/20 text-luxury-gold' : ''
                  }`}
                >
                  個人檔案
                </button>
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                <button 
                  onClick={() => handlePageChange('events')}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'events' 
                      ? 'text-luxury-gold font-semibold bg-luxury-gold/10' 
                      : 'text-secondary-600 hover:text-luxury-gold hover:bg-secondary-50'
                  }`}
                >
                  活動
                </button>
                <button 
                  onClick={() => handlePageChange('members')}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'members' 
                      ? 'text-luxury-gold font-semibold bg-luxury-gold/10' 
                      : 'text-secondary-600 hover:text-luxury-gold hover:bg-secondary-50'
                  }`}
                >
                  會員
                </button>
                <button 
                  onClick={() => handlePageChange('pricing')}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'pricing' 
                      ? 'text-luxury-gold font-semibold bg-luxury-gold/10' 
                      : 'text-secondary-600 hover:text-luxury-gold hover:bg-secondary-50'
                  }`}
                >
                  方案
                </button>
                <button 
                  onClick={() => handlePageChange('about')}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'about' 
                      ? 'text-luxury-gold font-semibold bg-luxury-gold/10' 
                      : 'text-secondary-600 hover:text-luxury-gold hover:bg-secondary-50'
                  }`}
                >
                  關於
                </button>
              </div>

              {/* Mobile Auth Section */}
              <div className="border-t border-secondary-200 pt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-secondary-700">
                          {user?.profile?.name || user?.email}
                        </div>
                        <div className="text-xs text-secondary-500 capitalize">
                          {user?.membership?.type || 'regular'} 會員
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full btn-luxury-ghost text-left"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        openLogin()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full btn-luxury-ghost text-left"
                    >
                      登入
                    </button>
                    <button 
                      onClick={() => {
                        openRegister()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full btn-luxury text-left"
                    >
                      註冊
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Status Indicators */}
              <div className="border-t border-secondary-200 pt-4">
                <div className="flex items-center justify-between text-xs text-secondary-500">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{isInitialized ? 'DB Ready' : 'DB Loading'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  {pendingSyncCount > 0 && (
                    <span className="bg-yellow-600 text-white px-2 py-1 rounded">
                      {pendingSyncCount} pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}