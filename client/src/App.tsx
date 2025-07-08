import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
      {/* Header */}
      <header className="nav-luxury">
        <div className="container-luxury">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-gradient-luxury">
                SheSocial
              </div>
              <div className="text-sm text-secondary-500">
                奢華社交活動平台
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-secondary-600 hover:text-luxury-gold transition-colors">
                活動
              </a>
              <a href="#" className="text-secondary-600 hover:text-luxury-gold transition-colors">
                會員
              </a>
              <a href="#" className="text-secondary-600 hover:text-luxury-gold transition-colors">
                關於
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="btn-luxury-ghost">
                登入
              </button>
              <button className="btn-luxury">
                註冊
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-luxury section-luxury">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-gradient-luxury animate-fade-in">
              1+1=∞
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto text-balance">
              尋找伴侶：一個你，一個我，畫成一個圓
            </p>
            <p className="text-secondary-500 max-w-xl mx-auto">
              台灣高端奢華社交活動平台，專注於隱私保護、會員分級和優質體驗
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card-luxury card-luxury-hover">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-luxury-gold to-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">🎭</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800">
                  隱私保護
                </h3>
                <p className="text-secondary-600">
                  嚴格的會員驗證和隱私保護，確保您的個人資訊安全
                </p>
              </div>
            </div>

            <div className="card-luxury card-luxury-hover">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-luxury-gold to-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">💎</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800">
                  奢華體驗
                </h3>
                <p className="text-secondary-600">
                  精選高端場所和活動，提供獨特的奢華社交體驗
                </p>
              </div>
            </div>

            <div className="card-luxury card-luxury-hover">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-luxury-gold to-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">🌟</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800">
                  會員分級
                </h3>
                <p className="text-secondary-600">
                  VIP 會員享有專屬權限，查看活動參與者資料
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="mt-16 space-y-8">
            <div className="card-luxury max-w-md mx-auto">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-secondary-800">
                  互動示範
                </h3>
                <p className="text-secondary-600">
                  點擊按鈕體驗我們的設計系統
                </p>
                <button 
                  className="btn-luxury w-full"
                  onClick={() => setCount((count) => count + 1)}
                >
                  點擊次數: {count}
                </button>
                <div className="flex space-x-2">
                  <button className="btn-luxury-outline flex-1">
                    次要按鈕
                  </button>
                  <button className="btn-luxury-ghost flex-1">
                    幽靈按鈕
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack Info */}
          <div className="mt-16 glass rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-secondary-800 mb-6">
              技術架構
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-secondary-700">前端技術</h4>
                <ul className="space-y-2 text-secondary-600">
                  <li>• React 19 + TypeScript</li>
                  <li>• Tailwind CSS 奢華設計系統</li>
                  <li>• Vite 快速開發</li>
                  <li>• CRDT (Yjs) 離線優先</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-secondary-700">後端技術</h4>
                <ul className="space-y-2 text-secondary-600">
                  <li>• Node.js + Express</li>
                  <li>• NeDB 輕量資料庫</li>
                  <li>• LINE Pay 支付整合</li>
                  <li>• Cloudflare R2 儲存</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold text-secondary-800">
              準備好開始了嗎？
            </h2>
            <p className="text-secondary-600 max-w-xl mx-auto">
              加入我們的奢華社交圈，尋找您的完美伴侶
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-luxury text-lg px-12 py-4">
                立即註冊
              </button>
              <button className="btn-luxury-outline text-lg px-12 py-4">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 bg-secondary-800 text-white">
        <div className="container-luxury py-12">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-gradient-luxury">
              SheSocial
            </div>
            <p className="text-secondary-300">
              台灣高端奢華社交活動平台
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="hover:text-luxury-gold transition-colors">
                隱私政策
              </a>
              <a href="#" className="hover:text-luxury-gold transition-colors">
                使用條款
              </a>
              <a href="#" className="hover:text-luxury-gold transition-colors">
                聯絡我們
              </a>
            </div>
            <p className="text-secondary-400 text-sm">
              © 2024 SheSocial. 版權所有.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App