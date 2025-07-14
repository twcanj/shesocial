import { useState } from 'react'
import { initializeOfflineDB } from './db/offline-db'
import { initializeSyncService } from './services/sync-service'
import { useOfflineDB, useNetworkSync, useDBStats } from './hooks/useOfflineDB'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationHeader } from './components/common/NavigationHeader'
import { EventsPage } from './pages/EventsPage'
import { MembersPage } from './pages/MembersPage'
import { AboutPage } from './pages/AboutPage'
import { PricingPage } from './pages/PricingPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminDashboard } from './pages/AdminDashboard'

function App() {
  const [count, setCount] = useState(0)
  const [currentPage, setCurrentPage] = useState<'home' | 'events' | 'members' | 'about' | 'pricing' | 'profile' | 'admin'>('home')
  
  const { isInitialized } = useOfflineDB()
  const { isOnline, pendingSyncCount, manualSync } = useNetworkSync()
  const { stats } = useDBStats()

  // Wrap entire app with AuthProvider once
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
        {/* Hide navigation for admin dashboard */}
        {currentPage !== 'admin' && (
          <NavigationHeader 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        
        {/* Render different pages based on currentPage */}
        {currentPage === 'events' && <EventsPage />}
        {currentPage === 'members' && <MembersPage onPageChange={setCurrentPage} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'pricing' && <PricingPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'admin' && <AdminDashboard />}
        
        {/* Home page */}
        {currentPage === 'home' && (
          <main className="container-luxury section-luxury">
            <div className="text-center space-y-8">
              {/* Hero Section - Mathematical Love Concept */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="text-6xl md:text-8xl font-bold text-gradient-luxury mb-4 animate-fade-in">
                    1 + 1 = ∞
                  </div>
                  <div className="text-lg text-secondary-600 mb-2">
                    當二個彼此有情人相遇，愛就開始無限
                  </div>
                </div>
                <h1 className="text-gradient-luxury animate-fade-in">
                  終結單身，開啟幸福
                </h1>
                <p className="text-2xl text-secondary-700 max-w-2xl mx-auto font-semibold">
                  為什麼30+優質台灣人選擇天造地設人成對？
                </p>
                <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                  3個月內成功配對率85%｜真實身份驗證｜隱私絕對保護
                </p>
              </div>

              {/* Customer Pain Points & Solutions */}
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="card-passion p-8 text-center">
                  <div className="text-4xl mb-4">😔</div>
                  <h3 className="text-xl font-semibold mb-4 text-white">單身生活困擾？</h3>
                  <ul className="text-left space-y-2 text-secondary-600 mb-6">
                    <li className="text-white/80">• 工作忙碌，沒時間社交</li>
                    <li className="text-white/80">• 網路交友風險高</li>
                    <li className="text-white/80">• 朋友介紹有壓力</li>
                    <li className="text-white/80">• 不知道怎麼認識優質對象</li>
                  </ul>
                  <div className="text-white font-semibold">我們理解您的需求</div>
                </div>
                
                <div className="card-luxury p-8 text-center">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="text-xl font-semibold mb-4 text-white">天造地設人成對 解決方案</h3>
                  <ul className="text-left space-y-2 text-secondary-600 mb-6">
                    <li className="text-white/80">• 每月2場精選活動</li>
                    <li className="text-white/80">• 身份真實驗證</li>
                    <li className="text-white/80">• 小班制高品質互動</li>
                    <li className="text-white/80">• 專業配對諮詢</li>
                  </ul>
                  <div className="text-white font-semibold">量身打造的社交體驗</div>
                </div>
                
                <div className="card-growth p-8 text-center">
                  <div className="text-4xl mb-4">💕</div>
                  <h3 className="text-xl font-semibold mb-4 text-white">成功收穫愛情！</h3>
                  <ul className="text-left space-y-2 text-secondary-600 mb-6">
                    <li className="text-white/80">• 85% 配對成功率</li>
                    <li className="text-white/80">• 平均3個月找到真愛</li>
                    <li className="text-white/80">• 500+ 成功案例</li>
                    <li className="text-white/80">• 終身幸福保障</li>
                  </ul>
                  <div className="text-white font-semibold">您的幸福，我們的使命</div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="card-connection p-8 mt-12">
                <h2 className="text-2xl font-bold text-center mb-8 text-white">真實會員回饋</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white/50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-luxury-gold font-bold">王小姐</span>
                      </div>
                      <div>
                        <div className="font-semibold">32歲 金融業</div>
                        <div className="text-sm text-secondary-600">加入3個月後結婚</div>
                      </div>
                    </div>
                    <p className="text-secondary-700 italic">
                      "原本對網路交友很害怕，但天造地設人成對的視訊面試讓我很安心。
                      在第二場活動就遇到現在的老公，1+1真的等於無限！"
                    </p>
                  </div>
                  
                  <div className="bg-white/50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-luxury-gold font-bold">李先生</span>
                      </div>
                      <div>
                        <div className="font-semibold">35歲 科技業</div>
                        <div className="text-sm text-secondary-600">Premium會員</div>
                      </div>
                    </div>
                    <p className="text-secondary-700 italic">
                      "工作太忙沒時間交朋友，天造地設人成對的活動品質很高，
                      都是真心想找伴侶的人。小班制讓每個人都有機會深入了解。"
                    </p>
                  </div>
                </div>
              </div>

              {/* Call-to-Action */}
              <div className="card-connection p-8 mt-12 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">準備好找到真愛了嗎？</h2>
                <p className="text-lg text-white/80 mb-6">
                  加入500+成功會員的行列，讓我們幫您找到人生伴侶
                </p>
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                  <button 
                    onClick={() => setCurrentPage('pricing')}
                    className="btn-luxury w-full sm:w-auto"
                  >
                    查看會員方案
                  </button>
                  <button 
                    onClick={() => setCurrentPage('about')}
                    className="btn-luxury-outline w-full sm:w-auto"
                  >
                    預約免費諮詢
                  </button>
                </div>
                <p className="text-sm text-secondary-500 mt-4">
                  ✓ 免費諮詢 ✓ 無壓力了解 ✓ 專業配對建議
                </p>
              </div>
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="bg-secondary-900 text-white py-12 mt-20">
          <div className="container-luxury">
            <div className="text-center">
              <p>&copy; 2024 天造地設人成對 InfinityMatch. 1+1=∞ 台灣頂級配對平台</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}

export default App