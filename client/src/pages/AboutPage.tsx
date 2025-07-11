// About Page - Platform information and company details
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CTASection } from '../components/ui/CTASection'
import { ModalTrigger } from '../components/ui/ModalTrigger'
import { ConsultationModalContent } from '../components/modals/ConsultationModal'

export const AboutPage: React.FC = () => {
  const { openRegister } = useAuth()
  return (
    <>
      <div className="container-luxury section-luxury">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-gradient-luxury animate-fade-in mb-6">
            關於 SheSocial
          </h1>
          <p className="text-xl text-secondary-700 max-w-3xl mx-auto mb-4">
            尋找伴侶：一個你，一個我，畫成一個圓
          </p>
          <p className="text-lg text-secondary-600 max-w-4xl mx-auto">
            台灣高端社交活動平台，專注於隱私保護、會員分級和優質體驗
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="card-luxury p-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">我們的使命</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              SheSocial致力於為台灣單身族群提供安全、優質的社交環境。我們相信每個人都值得擁有真摯的感情，
              透過精心策劃的活動和嚴格的會員篩選機制，讓您在舒適的環境中遇見志同道合的人。
            </p>
          </div>

          <div className="card-luxury p-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">隱私承諾</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              我們深知隱私的重要性，採用業界最高標準的資料保護措施。所有會員資料經過加密處理，
              活動參與者資訊僅在必要時分享，確保您的個人隱私得到最完善的保護。
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">核心價值</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-luxury-gold/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">品質至上</h3>
              <p className="text-gray-600">
                精心挑選活動地點，嚴格篩選會員資格，確保每一次體驗都達到最高標準
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-luxury-gold/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 01-3 0m3 0V9a1.5 1.5 0 012-1.415M18 15v3m0 0l-3-3m3 3l3-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">真誠交流</h3>
              <p className="text-gray-600">
                營造真實、開放的交流環境，讓每位會員都能展現最真實的自己
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-luxury-gold/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">安全保障</h3>
              <p className="text-gray-600">
                建立完善的安全機制，保護會員的人身安全和隱私安全
              </p>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="card-luxury p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">平台特色</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center mr-4 mt-1">
                  <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">離線優先設計</h3>
                  <p className="text-gray-600">
                    即使在捷運隧道中也能正常使用，完整的離線功能讓您隨時隨地管理活動
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center mr-4 mt-1">
                  <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">台灣在地支付</h3>
                  <p className="text-gray-600">
                    支援LINE Pay、Apple Pay、Google Pay等台灣常用支付方式
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center mr-4 mt-1">
                  <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">資料安全加密</h3>
                  <p className="text-gray-600">
                    採用JWT認證和bcrypt加密，保護您的個人資料和隱私安全
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center mr-4 mt-1">
                  <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">分級會員制度</h3>
                  <p className="text-gray-600">
                    4階段會員等級，提供不同層次的服務和專屬權益
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center mr-4 mt-1">
                  <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">視訊面試機制</h3>
                  <p className="text-gray-600">
                    所有新會員需通過30分鐘視訊面試，確保會員品質和真實性
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center mr-4 mt-1">
                  <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">精選活動地點</h3>
                  <p className="text-gray-600">
                    每3個月6場活動，精選台灣各地景點，小班制高品質體驗
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">技術架構</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-luxury p-6 text-center">
              <div className="text-3xl mb-4">⚛️</div>
              <h3 className="text-lg font-semibold mb-2">前端技術</h3>
              <p className="text-secondary-600 text-sm">
                React 19 + TypeScript + Vite
              </p>
            </div>
            
            <div className="card-luxury p-6 text-center">
              <div className="text-3xl mb-4">🗄️</div>
              <h3 className="text-lg font-semibold mb-2">離線存儲</h3>
              <p className="text-secondary-600 text-sm">
                IndexedDB + Dexie.js
              </p>
            </div>
            
            <div className="card-luxury p-6 text-center">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2">設計系統</h3>
              <p className="text-secondary-600 text-sm">
                Tailwind CSS + 奢華主題
              </p>
            </div>
            
            <div className="card-luxury p-6 text-center">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">PWA 應用</h3>
              <p className="text-secondary-600 text-sm">
                Service Worker + 離線功能
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center">
          <div className="card-luxury p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">聯絡我們</h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@shesocial.tw</span>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>客服專線：0800-123-456</span>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>台北市信義區信義路五段7號</span>
              </div>
            </div>
            <div className="mt-8">
              <button 
                onClick={openRegister}
                className="btn-luxury mr-4"
              >
                立即加入
              </button>
              <ModalTrigger
                trigger={(onClick) => (
                  <button 
                    onClick={onClick}
                    className="btn-luxury-outline"
                  >
                    預約諮詢
                  </button>
                )}
                size="sm"
              >
                <ConsultationModalContent />
              </ModalTrigger>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}