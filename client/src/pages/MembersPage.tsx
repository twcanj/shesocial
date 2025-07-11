// Members Page - Membership information and management
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CTASection } from '../components/ui/CTASection'
import { ModalTrigger } from '../components/ui/ModalTrigger'
import { MembershipDetailsModalContent } from '../components/modals/MembershipDetailsModal'

export const MembersPage: React.FC = () => {
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
          {/* Regular */}
          <div className="card-luxury p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">一般會員</h3>
              <div className="text-2xl font-bold text-luxury-gold mb-1">¥600</div>
              <div className="text-sm text-gray-600">入會費 + ¥300/月</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                參與活動
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                基本功能使用
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                30分鐘視訊面試
              </li>
            </ul>
          </div>

          {/* VIP */}
          <div className="card-luxury p-6 border-2 border-luxury-gold">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-luxury-gold/10 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">VIP會員</h3>
              <div className="text-2xl font-bold text-luxury-gold mb-1">¥1000</div>
              <div className="text-sm text-gray-600">入會費 + ¥300/月</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                優先報名權
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                創建活動權限
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                專屬客服支援
              </li>
            </ul>
          </div>

          {/* Premium 1300 */}
          <div className="card-luxury p-6 bg-gradient-to-br from-luxury-champagne to-luxury-pearl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium 1300</h3>
              <div className="text-2xl font-bold text-purple-600 mb-1">¥1300</div>
              <div className="text-sm text-gray-600">代金券套餐</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                包含VIP所有權益
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ¥100代金券 x 13張
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                適用2日遊活動
              </li>
            </ul>
          </div>

          {/* Premium 2500 */}
          <div className="card-luxury p-6 bg-gradient-to-br from-luxury-gold/20 to-luxury-rose/20 border-2 border-luxury-gold">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium 2500</h3>
              <div className="text-2xl font-bold text-luxury-gold mb-1">¥2500</div>
              <div className="text-sm text-gray-600">頂級套餐</div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                查看參與者名單
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ¥200代金券 x 12.5張
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                所有頂級權益
              </li>
            </ul>
          </div>
        </div>

        {/* Business Rules */}
        <div className="card-luxury p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">會員規則說明</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-luxury-gold">活動安排</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  每3個月舉辦6場活動
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  台灣各地精選景點
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 01-3 0m3 0V9a1.5 1.5 0 012-1.415M18 15v3m0 0l-3-3m3 3l3-3" />
                  </svg>
                  小班制精緻體驗
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-luxury-gold">代金券規則</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  僅適用於2日遊活動
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  無使用期限限制
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="card-luxury p-8 max-w-2xl mx-auto bg-gradient-to-r from-luxury-champagne to-luxury-pearl">
            <h2 className="text-2xl font-bold mb-4">立即加入SheSocial</h2>
            <p className="text-gray-600 mb-6">
              開始您的高端社交之旅，尋找理想的人生伴侶
            </p>
            <div className="space-x-4">
              <button 
                onClick={openRegister}
                className="btn-luxury"
              >
                立即註冊
              </button>
              <ModalTrigger
                trigger={(onClick) => (
                  <button 
                    onClick={onClick}
                    className="btn-luxury-outline"
                  >
                    了解更多
                  </button>
                )}
                size="lg"
              >
                <MembershipDetailsModalContent />
              </ModalTrigger>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}