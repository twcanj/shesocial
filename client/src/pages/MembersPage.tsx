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
          <div className="card-passion p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">訪客</h3>
              <div className="text-2xl font-bold text-white mb-1">免費</div>
              <div className="text-sm text-white/80">只能瀏覽</div>
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                只能看 3 個活動
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                查看精彩活動集
              </li>
              <li className="flex items-center opacity-50">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                不能參加活動
              </li>
            </ul>
          </div>

          {/* Registered */}
          <div className="card-growth p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">註冊會員</h3>
              <div className="text-2xl font-bold text-white mb-1">免費</div>
              <div className="text-sm text-white/80">免費註冊</div>
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                可看 12 個活動
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                個人資料管理
              </li>
              <li className="flex items-center opacity-50">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                不能參加活動
              </li>
            </ul>
          </div>

          {/* VIP */}
          <div className="card-connection p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">VIP會員</h3>
              <div className="text-2xl font-bold text-white mb-1">NT$1,300</div>
              <div className="text-sm text-white/80">付費會員</div>
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                無限次数活動瀏覽
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                可參加活動 (2月後)
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                票券折抵優惠
              </li>
            </ul>
          </div>

          {/* VVIP */}
          <div className="card-luxury p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">VVIP會員</h3>
              <div className="text-2xl font-bold text-white mb-1">NT$2,500</div>
              <div className="text-sm text-white/80">頂級付費會員</div>
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                無限次数活動瀏覽
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                查看參與者名單
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                最多票券折抵
              </li>
            </ul>
          </div>
        </div>

        {/* Business Rules */}
        <div className="card-growth p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">會員規則說明</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">活動安排</h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  每3個月舉辦6場活動
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  台灣各地精選景點
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 01-3 0m3 0V9a1.5 1.5 0 012-1.415M18 15v3m0 0l-3-3m3 3l3-3" />
                  </svg>
                  小班制精緻體驗
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">代金券規則</h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  僅適用於2日遊活動
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  無使用期限限制
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  可轉讓給他人使用
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="card-connection p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">立即加入SheSocial</h2>
            <p className="text-white/80 mb-6">
              開始您的高端社交之旅，尋找理想的人生伴侶
            </p>
            <div className="space-x-4">
              <button 
                onClick={openRegister}
                className="btn-luxury"
              >
                立即註冊
              </button>
              <button 
                onClick={() => onPageChange?.('pricing')}
                className="btn-luxury-outline"
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