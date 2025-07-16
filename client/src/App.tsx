import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuthStore } from './store/authStore'
import { NavigationHeaderRouter } from './components/common/NavigationHeaderRouter'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { MembersPage } from './pages/MembersPage'
import { AboutPage } from './pages/AboutPage'
import { PricingPage } from './pages/PricingPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { useAdminAuth } from './hooks/useAdminAuth'

// Component to handle auth initialization
function AuthInitializer() {
  const { isAuthenticated, refreshToken, getCurrentUser } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we have a refresh token in storage and are marked as authenticated
      if (refreshToken && isAuthenticated) {
        try {
          await getCurrentUser()
        } catch (error) {
          // If restoration fails, clear the invalid auth state
          useAuthStore.getState().logout()
        }
      }
    }

    // Small delay to ensure Zustand has hydrated from localStorage
    const timer = setTimeout(initializeAuth, 200)
    return () => clearTimeout(timer)
  }, []) // Only run once on mount

  return null
}

// Admin Route Guard Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth()
  const location = useLocation()

  if (!isAuthenticated && location.pathname !== '/admin_login') {
    return <AdminLoginPage />
  }

  return <>{children}</>
}

// Main App Layout Component
function AppLayout() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAdminLoginPage = location.pathname === '/admin_login'

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
      <AuthInitializer />
      
      {/* Show navigation header for regular pages only */}
      {!isAdminRoute && !isAdminLoginPage && <NavigationHeaderRouter />}
      
      <Routes>
        {/* Regular User Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Admin Routes */}
        <Route path="/admin_login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* Future admin routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>

      {/* Footer - only show for regular pages */}
      {!isAdminRoute && !isAdminLoginPage && (
        <footer className="bg-secondary-900 text-white py-12 mt-20">
          <div className="container-luxury">
            <div className="text-center">
              <p>&copy; 2024 天造地設人成對 InfinityMatch. 1+1=∞ 台灣頂級配對平台</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  )
}

export default App