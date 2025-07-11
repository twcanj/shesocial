// Centralized Authentication Context - eliminates prop drilling
import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthModal } from '../components/auth/AuthModal'

interface AuthContextType {
  openLogin: () => void
  openRegister: () => void
  closeAuth: () => void
  isAuthModalOpen: boolean
  authMode: 'login' | 'register'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const openLogin = () => {
    setAuthMode('login')
    setIsAuthModalOpen(true)
  }

  const openRegister = () => {
    setAuthMode('register')
    setIsAuthModalOpen(true)
  }

  const closeAuth = () => {
    setIsAuthModalOpen(false)
  }

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
  }

  return (
    <AuthContext.Provider value={{
      openLogin,
      openRegister,
      closeAuth,
      isAuthModalOpen,
      authMode
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