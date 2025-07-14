// Centralized Authentication Context - eliminates prop drilling
import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthModal } from '../components/auth/AuthModal'
import { useAuthStore } from '../store/authStore'

interface AuthContextType {
  openLogin: () => void
  openRegister: () => void
  openEnhancedRegister: () => void
  closeAuth: () => void
  isAuthModalOpen: boolean
  authMode: 'login' | 'register' | 'enhanced_register'
  // Auth store data
  isAuthenticated: boolean
  user: any
  login: (email: string, password: string) => Promise<any>
  register: (userData: any) => Promise<any>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'enhanced_register'>('login')
  
  // Get auth store functions and state
  const { isAuthenticated, user, login, register, logout } = useAuthStore()

  const openLogin = () => {
    setAuthMode('login')
    setIsAuthModalOpen(true)
  }

  const openRegister = () => {
    setAuthMode('register')
    setIsAuthModalOpen(true)
  }
  
  const openEnhancedRegister = () => {
    setAuthMode('enhanced_register')
    setIsAuthModalOpen(true)
  }

  const closeAuth = () => {
    setIsAuthModalOpen(false)
  }

  const toggleMode = () => {
    if (authMode === 'login') {
      setAuthMode('register')
    } else if (authMode === 'register') {
      setAuthMode('login')
    } else {
      setAuthMode('register')
    }
  }

  return (
    <AuthContext.Provider value={{
      openLogin,
      openRegister,
      openEnhancedRegister,
      closeAuth,
      isAuthModalOpen,
      authMode,
      isAuthenticated,
      user,
      login,
      register,
      logout
    }}>
      {children}
      
      {/* Global Auth Modal - rendered once for entire app */}
      {isAuthModalOpen && (
        <AuthModal
          mode={authMode}
          onClose={closeAuth}
          onToggleMode={toggleMode}
        />
      )}
    </AuthContext.Provider>
  )
}

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}