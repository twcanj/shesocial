// Navigation Header - React Router compatible version
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useOfflineDB, useNetworkSync } from '../../hooks/useOfflineDB'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../../contexts/AuthContext'

export const NavigationHeaderRouter: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isInitialized } = useOfflineDB()
  const { isOnline, pendingSyncCount } = useNetworkSync()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { openLogin, openRegister } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="nav-luxury">
      <div className="container-luxury">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo - clickable to go home */}
            <Link 
              to="/"
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
                  InfinityMatch 1+1=∞
                </div>
              </div>
            </Link>
            
            {/* Status indicators */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Online/Offline indicator */}
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isOnline ? '在線' : '離線'}></div>
              
              {/* Sync pending indicator */}
              {pendingSyncCount > 0 && (
                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full" 
                     title={`${pendingSyncCount} 項目待同步`}>
                  {pendingSyncCount}
                </div>
              )}
              
              {/* DB initialization indicator */}
              {!isInitialized && (
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full" 
                     title="資料庫初始化中">
                  🔄
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
            >
              首頁
            </Link>
            <Link 
              to="/events" 
              className={`nav-link ${isActive('/events') ? 'nav-link-active' : ''}`}
            >
              活動
            </Link>
            <Link 
              to="/members" 
              className={`nav-link ${isActive('/members') ? 'nav-link-active' : ''}`}
            >
              會員
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'nav-link-active' : ''}`}
            >
              關於
            </Link>
            <Link 
              to="/pricing" 
              className={`nav-link ${isActive('/pricing') ? 'nav-link-active' : ''}`}
            >
              方案
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile"
                  className="nav-link"
                >
                  個人檔案
                </Link>
                <span className="text-sm text-secondary-600">
                  歡迎, {user?.profile?.name || user?.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-secondary-600 hover:text-luxury-gold transition-colors"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={openLogin}
                  className="text-sm text-secondary-600 hover:text-luxury-gold transition-colors"
                >
                  登入
                </button>
                <button 
                  onClick={openRegister}
                  className="bg-luxury-gold text-white px-4 py-2 rounded-lg hover:bg-luxury-gold-dark transition-colors"
                >
                  註冊
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 text-secondary-600 hover:text-luxury-gold transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-secondary-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                首頁
              </Link>
              <Link 
                to="/events" 
                className={`nav-link ${isActive('/events') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                活動
              </Link>
              <Link 
                to="/members" 
                className={`nav-link ${isActive('/members') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                會員
              </Link>
              <Link 
                to="/about" 
                className={`nav-link ${isActive('/about') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                關於
              </Link>
              <Link 
                to="/pricing" 
                className={`nav-link ${isActive('/pricing') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                方案
              </Link>
              
              {/* Mobile Auth Actions */}
              <div className="border-t border-secondary-200 pt-3 mt-3">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-3">
                    <Link 
                      to="/profile"
                      className="nav-link"
                      onClick={closeMobileMenu}
                    >
                      個人檔案
                    </Link>
                    <div className="text-sm text-secondary-600 px-3">
                      歡迎, {user?.profile?.name || user?.email}
                    </div>
                    <button 
                      onClick={() => {
                        handleLogout()
                        closeMobileMenu()
                      }}
                      className="text-sm text-secondary-600 hover:text-luxury-gold transition-colors text-left px-3"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <button 
                      onClick={() => {
                        openLogin()
                        closeMobileMenu()
                      }}
                      className="text-sm text-secondary-600 hover:text-luxury-gold transition-colors text-left px-3"
                    >
                      登入
                    </button>
                    <button 
                      onClick={() => {
                        openRegister()
                        closeMobileMenu()
                      }}
                      className="bg-luxury-gold text-white px-4 py-2 rounded-lg hover:bg-luxury-gold-dark transition-colors mx-3"
                    >
                      註冊
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default NavigationHeaderRouter