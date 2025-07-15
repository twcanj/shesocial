// Members Page - Membership information and management
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

interface MembersPageProps {
  onPageChange?: (page: 'home' | 'events' | 'members' | 'about' | 'pricing') => void
}

export const MembersPage: React.FC<MembersPageProps> = ({ onPageChange }) => {
  const { openRegister } = useAuth()
  return (
    <>
      <div className="container-luxury section-luxury">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-luxury mb-2">
            會員專區
          </h1>
          <p className="text-gray-600">
            會員資訊、權益說明與升級服務
          </p>
        </div>

        {/* Membership Tiers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Visitor */}
          <div className="luxury-card-outline p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="luxury-card-title">訪客</h3>
              <div className="luxury-card-pricing">
                <span className="luxury-card-price">免費</span>
              </div>
              <div className="text-sm opacity-80 mt-1">只能瀏覽</div>
            </div>
            <ul className="luxury-card-features">
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>只能看 3 個活動</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>查看精彩活動集</span>
              </li>
              <li className="luxury-card-feature opacity-50">
                <div className="luxury-feature-dot-outline opacity-50"></div>
                <span>不能參加活動</span>
              </li>
            </ul>
          </div>

          {/* Registered */}
          <div className="luxury-card-outline p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="luxury-card-title">註冊會員</h3>
              <div className="luxury-card-pricing">
                <span className="luxury-card-price">免費</span>
              </div>
              <div className="text-sm opacity-80 mt-1">免費註冊</div>
            </div>
            <ul className="luxury-card-features">
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>可看 12 個活動</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>個人資料管理</span>
              </li>
              <li className="luxury-card-feature opacity-50">
                <div className="luxury-feature-dot-outline opacity-50"></div>
                <span>不能參加活動</span>
              </li>
            </ul>
          </div>

          {/* VIP */}
          <div className="luxury-card-selected p-6">
            <div className="luxury-card-badge">
              <div className="luxury-card-badge-inner">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                推薦
              </div>
            </div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-luxury-midnight-black/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-luxury-midnight-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="luxury-card-title">VIP會員</h3>
              <div className="luxury-card-pricing">
                <span className="luxury-card-price">NT$1,300</span>
              </div>
              <div className="text-sm opacity-80 mt-1">付費會員</div>
            </div>
            <ul className="luxury-card-features">
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-selected"></div>
                <span>無限次數活動瀏覽</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-selected"></div>
                <span>可參加活動 (2月後)</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-selected"></div>
                <span>票券折抵優惠</span>
              </li>
            </ul>
          </div>

          {/* VVIP */}
          <div className="luxury-card-outline p-6">
            <div className="luxury-card-badge">
              <div className="luxury-card-badge-inner">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                頂級
              </div>
            </div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="luxury-card-title">VVIP會員</h3>
              <div className="luxury-card-pricing">
                <span className="luxury-card-price">NT$2,500</span>
              </div>
              <div className="text-sm opacity-80 mt-1">頂級付費會員</div>
            </div>
            <ul className="luxury-card-features">
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>無限次數活動瀏覽</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>查看參與者名單</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>最多票券折抵</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Business Rules */}
        <div className="luxury-card-outline p-8 mb-12">
          <h2 className="luxury-card-title text-center mb-8">會員規則說明</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-luxury-gold">活動安排</h3>
              <ul className="space-y-3 text-luxury-platinum/80">
                <li className="flex items-start">
                  <div className="luxury-feature-dot-outline mt-2"></div>
                  <span className="ml-3">每3個月舉辦6場活動</span>
                </li>
                <li className="flex items-start">
                  <div className="luxury-feature-dot-outline mt-2"></div>
                  <span className="ml-3">台灣各地精選景點</span>
                </li>
                <li className="flex items-start">
                  <div className="luxury-feature-dot-outline mt-2"></div>
                  <span className="ml-3">小班制精緻體驗</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-luxury-gold">代金券規則</h3>
              <ul className="space-y-3 text-luxury-platinum/80">
                <li className="flex items-start">
                  <div className="luxury-feature-dot-outline mt-2"></div>
                  <span className="ml-3">僅適用於2日遊活動</span>
                </li>
                <li className="flex items-start">
                  <div className="luxury-feature-dot-outline mt-2"></div>
                  <span className="ml-3">無使用期限限制</span>
                </li>
                <li className="flex items-start">
                  <div className="luxury-feature-dot-outline mt-2"></div>
                  <span className="ml-3">可轉讓給他人使用</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="luxury-card-selected p-8 max-w-2xl mx-auto">
            <h2 className="luxury-card-title mb-4">立即加入SheSocial</h2>
            <p className="text-luxury-midnight-black/80 mb-6">
              開始您的高端社交之旅，尋找理想的人生伴侶
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button 
                onClick={openRegister}
                className="luxury-card-button-selected w-full sm:w-auto"
              >
                立即註冊
              </button>
              <button 
                onClick={() => onPageChange?.('pricing')}
                className="w-full sm:w-auto px-4 py-2 font-medium rounded-lg transition-all duration-300 border-2 border-luxury-midnight-black bg-transparent text-luxury-midnight-black hover:bg-luxury-midnight-black hover:text-luxury-gold"
              >
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}