import { useState } from 'react'
import { initializeOfflineDB } from './db/offline-db'
import { initializeSyncService } from './services/sync-service'
import { useOfflineDB, useNetworkSync, useDBStats } from './hooks/useOfflineDB'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationHeader } from './components/common/NavigationHeader'
import { EventsPage } from './pages/EventsPage'
import { MembersPage } from './pages/MembersPage'
import { AboutPage } from './pages/AboutPage'

function App() {
  const [count, setCount] = useState(0)
  const [currentPage, setCurrentPage] = useState<'home' | 'events' | 'members' | 'about'>('home')
  
  const { isInitialized } = useOfflineDB()
  const { isOnline, pendingSyncCount, manualSync } = useNetworkSync()
  const { stats } = useDBStats()

  // Render different pages based on currentPage  
  if (currentPage === 'events') {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
          <NavigationHeader 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <EventsPage />
        </div>
      </AuthProvider>
    )
  }

  if (currentPage === 'members') {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
          <NavigationHeader 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <MembersPage />
        </div>
      </AuthProvider>
    )
  }

  if (currentPage === 'about') {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
          <NavigationHeader 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <AboutPage />
        </div>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
        {/* Header */}
        <NavigationHeader 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

      {/* Main Content */}
      <main className="container-luxury section-luxury">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-gradient-luxury animate-fade-in">
              1+1=∞
            </h1>
            <p className="text-xl text-secondary-700 max-w-2xl mx-auto">
              尋找伴侶：一個你，一個我，畫成一個圓
            </p>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              台灣高端社交活動平台，專注於隱私保護、會員分級和優質體驗
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="card-luxury p-6 text-center">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold mb-2">離線優先</h3>
              <p className="text-secondary-600 text-sm">
                捷運隧道也能使用，完整離線功能
              </p>
            </div>
            
            <div className="card-luxury p-6 text-center">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-lg font-semibold mb-2">台灣支付</h3>
              <p className="text-secondary-600 text-sm">
                LINE Pay 主要支付方式
              </p>
            </div>
            
            <div className="card-luxury p-6 text-center">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">行動優先</h3>
              <p className="text-secondary-600 text-sm">
                90% 手機用戶優化設計
              </p>
            </div>
            
            <div className="card-luxury p-6 text-center">
              <div className="text-3xl mb-4">💎</div>
              <h3 className="text-lg font-semibold mb-2">奢華體驗</h3>
              <p className="text-secondary-600 text-sm">
                高端用戶專屬功能
              </p>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="card-luxury p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">離線功能測試</h3>
            <div className="space-y-4">
              <button
                className="btn-luxury w-full"
                onClick={() => setCount((count) => count + 1)}
              >
                點擊次數: {count}
              </button>
              <p className="text-sm text-secondary-600">
                測試離線功能：關閉網路後仍可正常操作
              </p>
            </div>
          </div>

          {/* Database Stats */}
          {stats && (
            <div className="mt-12 p-6 bg-white/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">資料庫狀態 (開發模式)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="font-medium">用戶</div>
                  <div className="text-luxury-gold">{stats.users}</div>
                </div>
                <div>
                  <div className="font-medium">活動</div>
                  <div className="text-luxury-gold">{stats.events}</div>
                </div>
                <div>
                  <div className="font-medium">預訂</div>
                  <div className="text-luxury-gold">{stats.bookings}</div>
                </div>
                <div>
                  <div className="font-medium">同步隊列</div>
                  <div className="text-luxury-gold">{stats.syncQueue}</div>
                </div>
                <div>
                  <div className="font-medium">存儲大小</div>
                  <div className="text-luxury-gold">{stats.totalSize}</div>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={manualSync}
                  className="btn-luxury-outline text-sm"
                  disabled={!isOnline}
                >
                  手動同步 {!isOnline && '(離線)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12 mt-20">
        <div className="container-luxury">
          <div className="text-center">
            <p>&copy; 2024 SheSocial. 台灣奢華社交活動平台</p>
          </div>
        </div>
      </footer>

      </div>
    </AuthProvider>
  )
}

export default App