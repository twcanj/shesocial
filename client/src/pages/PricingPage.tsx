// Pricing Page - Dedicated page for membership plans with shareable URL
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { PersonalizedRecommendation } from '../components/sales/PersonalizedRecommendation'

export const PricingPage: React.FC = () => {
  const { openRegister, isAuthenticated, user } = useAuth()

  return (
    <div className="container-luxury section-luxury">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-gradient-luxury animate-fade-in mb-6">
          會員方案
        </h1>
        <p className="text-xl text-secondary-700 max-w-3xl mx-auto mb-4">
          選擇最適合您的會員等級，開始高端社交之旅
        </p>
        <p className="text-lg text-secondary-600 max-w-4xl mx-auto">
          4種會員等級，滿足不同需求的奢華體驗
        </p>
      </div>

      {/* Personalized Recommendation for authenticated users with completed profiles */}
      {isAuthenticated && user?.membership?.status === 'profile_completed' && (
        <div className="mb-16">
          <PersonalizedRecommendation />
        </div>
      )}

      {/* Membership Tiers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {/* Regular */}
        <div className="card-luxury p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">一般會員</h3>
            <div className="text-3xl font-bold text-luxury-gold mb-1">¥600</div>
            <div className="text-sm text-gray-600">入會費 + ¥300/月</div>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
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
          <button 
            onClick={openRegister}
            className="btn-luxury-outline w-full"
          >
            {isAuthenticated && user?.membership?.status === 'profile_completed' ? '選擇此方案' : '選擇方案'}
          </button>
        </div>

        {/* VIP */}
        <div className="card-luxury p-6 border-2 border-luxury-gold transform hover:scale-105 transition-all duration-300">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-luxury-gold text-white px-4 py-1 rounded-full text-xs font-semibold">
              推薦
            </span>
          </div>
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-luxury-gold/10 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">VIP會員</h3>
            <div className="text-3xl font-bold text-luxury-gold mb-1">¥1000</div>
            <div className="text-sm text-gray-600">入會費 + ¥300/月</div>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
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
          <button 
            onClick={openRegister}
            className="btn-luxury w-full"
          >
            {isAuthenticated && user?.membership?.status === 'profile_completed' ? '選擇此方案' : '選擇方案'}
          </button>
        </div>

        {/* Premium 1300 */}
        <div className="card-luxury p-6 bg-gradient-to-br from-luxury-champagne to-luxury-pearl hover:shadow-2xl transition-shadow duration-300">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium 1300</h3>
            <div className="text-3xl font-bold text-purple-600 mb-1">¥1300</div>
            <div className="text-sm text-gray-600">代金券套餐</div>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
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
          <button 
            onClick={openRegister}
            className="btn-luxury-outline w-full"
          >
            {isAuthenticated && user?.membership?.status === 'profile_completed' ? '選擇此方案' : '選擇方案'}
          </button>
        </div>

        {/* Premium 2500 */}
        <div className="card-luxury p-6 bg-gradient-to-br from-luxury-gold/20 to-luxury-rose/20 border-2 border-luxury-gold hover:shadow-2xl transition-all duration-300">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-luxury-gold to-luxury-rose text-white px-4 py-1 rounded-full text-xs font-semibold">
              頂級
            </span>
          </div>
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium 2500</h3>
            <div className="text-3xl font-bold text-luxury-gold mb-1">¥2500</div>
            <div className="text-sm text-gray-600">頂級套餐</div>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
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
          <button 
            onClick={openRegister}
            className="btn-luxury w-full"
          >
            {isAuthenticated && user?.membership?.status === 'profile_completed' ? '選擇此方案' : '選擇方案'}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">方案比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-luxury-champagne to-luxury-pearl">
                <th className="p-4 text-left font-semibold">功能特色</th>
                <th className="p-4 text-center font-semibold">一般會員</th>
                <th className="p-4 text-center font-semibold">VIP會員</th>
                <th className="p-4 text-center font-semibold">Premium 1300</th>
                <th className="p-4 text-center font-semibold">Premium 2500</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">入會費用</td>
                <td className="p-4 text-center">¥600</td>
                <td className="p-4 text-center">¥1000</td>
                <td className="p-4 text-center">¥1300</td>
                <td className="p-4 text-center">¥2500</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="p-4 font-medium">月費</td>
                <td className="p-4 text-center">¥300</td>
                <td className="p-4 text-center">¥300</td>
                <td className="p-4 text-center">一次性付費</td>
                <td className="p-4 text-center">一次性付費</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">參與活動</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="p-4 font-medium">優先報名權</td>
                <td className="p-4 text-center">❌</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">創建活動</td>
                <td className="p-4 text-center">❌</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="p-4 font-medium">查看參與者名單</td>
                <td className="p-4 text-center">❌</td>
                <td className="p-4 text-center">❌</td>
                <td className="p-4 text-center">❌</td>
                <td className="p-4 text-center">✅</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">代金券</td>
                <td className="p-4 text-center">❌</td>
                <td className="p-4 text-center">❌</td>
                <td className="p-4 text-center">¥100 x 13張</td>
                <td className="p-4 text-center">¥200 x 12.5張</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 font-medium">專屬客服</td>
                <td className="p-4 text-center">❌</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
                <td className="p-4 text-center">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-8">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-luxury-gold">代金券使用規則</h4>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                可轉讓給他人使用
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                不可兌換現金
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                每次活動限用一張
              </li>
            </ul>
          </div>

          <div className="p-6 bg-luxury-gold/5 border border-luxury-gold/20 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-luxury-gold">活動安排</h4>
            <ul className="text-sm text-gray-700 space-y-3">
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
                小班制精緻體驗（8-16人）
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-luxury-gold mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                安全保障和隱私保護
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-blue-700">會員申請流程</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">1</div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">線上註冊</div>
                  <div>選擇適合的會員等級並填寫基本資料</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">2</div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">預約面試</div>
                  <div>安排30分鐘視訊面試時間</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">3</div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">身份驗證</div>
                  <div>完成身份驗證和資料確認</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">4</div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">開始使用</div>
                  <div>完成付款後即可開始使用所有功能</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-green-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-green-700">安全保障</h4>
            <ul className="text-sm text-gray-700 space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                嚴格身份驗證機制
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                個人資料加密保護
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                活動安全保險
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                24小時客服支援
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">常見問題</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-semibold mb-3 text-luxury-gold">Q: 代金券可以累積使用嗎？</h4>
            <p className="text-sm text-gray-600">每次活動限用一張代金券，無法累積使用。但代金券無使用期限，可以保留到下次活動使用。</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-semibold mb-3 text-luxury-gold">Q: 可以中途升級會員等級嗎？</h4>
            <p className="text-sm text-gray-600">可以隨時升級會員等級，差價部分需要補足。降級則需要等到下一個計費周期。</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-semibold mb-3 text-luxury-gold">Q: 視訊面試需要準備什麼？</h4>
            <p className="text-sm text-gray-600">請準備身份證件、穩定的網路連線和安靜的環境。面試約30分鐘，主要了解您的參與動機。</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-semibold mb-3 text-luxury-gold">Q: 活動取消或無法參加怎麼辦？</h4>
            <p className="text-sm text-gray-600">活動開始前24小時可免費取消。如使用代金券，會原數退回帳戶。</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="card-luxury p-8 max-w-2xl mx-auto bg-gradient-to-r from-luxury-champagne to-luxury-pearl">
          <h2 className="text-2xl font-bold mb-4">
            {isAuthenticated && user?.membership?.status === 'profile_completed' 
              ? '立即選擇您的方案' 
              : '立即開始您的社交之旅'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isAuthenticated && user?.membership?.status === 'profile_completed'
              ? '根據您的個人資料，我們已為您推薦最適合的方案'
              : '選擇適合的會員方案，加入台灣頂級社交圈'}
          </p>
          <div className="space-y-4">
            <button 
              onClick={openRegister}
              className="btn-luxury px-8 py-3 text-lg"
            >
              {isAuthenticated && user?.membership?.status === 'profile_completed'
                ? '前往付款頁面'
                : '立即註冊會員'}
            </button>
            <div className="text-sm text-gray-500">
              有任何問題？歡迎聯絡客服：0800-123-456
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">分享給朋友</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => navigator.share ? navigator.share({
              title: 'SheSocial 會員方案',
              text: '台灣高端社交活動平台 - 會員方案介紹',
              url: window.location.href
            }) : navigator.clipboard.writeText(window.location.href)}
            className="btn-luxury-outline text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            分享連結
          </button>
        </div>
      </div>
    </div>
  )
}