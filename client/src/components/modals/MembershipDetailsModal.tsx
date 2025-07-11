// Membership Details Modal Content - reusable component
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const MembershipDetailsModalContent: React.FC = () => {
  const { openRegister } = useAuth()

  return (
    <>
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gradient-luxury mb-4">會員詳細說明</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          了解SheSocial的完整會員制度，選擇最適合您的會員等級
        </p>
      </div>

      {/* Membership Comparison Table */}
      <div className="overflow-x-auto mb-8">
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

      {/* Detailed Information */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-luxury-gold">代金券使用規則</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 僅適用於2日遊活動</li>
              <li>• 無使用期限限制</li>
              <li>• 可轉讓給他人使用</li>
              <li>• 不可兌換現金</li>
              <li>• 每次活動限用一張</li>
            </ul>
          </div>

          <div className="p-6 bg-luxury-gold/5 border border-luxury-gold/20 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-luxury-gold">活動安排</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• 每3個月舉辦6場活動</li>
              <li>• 台灣各地精選景點</li>
              <li>• 小班制精緻體驗（8-16人）</li>
              <li>• 專業活動策劃團隊</li>
              <li>• 安全保障和隱私保護</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-blue-700">會員申請流程</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                <div className="text-sm text-gray-700">線上註冊並選擇會員等級</div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                <div className="text-sm text-gray-700">預約30分鐘視訊面試</div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                <div className="text-sm text-gray-700">身份驗證和資料確認</div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                <div className="text-sm text-gray-700">完成付款開始使用</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-green-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-green-700">安全保障</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• 嚴格身份驗證機制</li>
              <li>• 個人資料加密保護</li>
              <li>• 活動安全保險</li>
              <li>• 24小時客服支援</li>
              <li>• 隱私保護承諾</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-luxury-champagne to-luxury-pearl p-6 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-3 text-center">推薦方案</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-4 bg-white/70 rounded-lg">
            <div className="font-semibold text-gray-800 mb-2">初次體驗</div>
            <div className="text-luxury-gold font-bold">一般會員</div>
            <div className="text-gray-600 mt-1">適合想要先體驗的用戶</div>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-lg border-2 border-luxury-gold">
            <div className="font-semibold text-gray-800 mb-2">最受歡迎</div>
            <div className="text-luxury-gold font-bold">Premium 1300</div>
            <div className="text-gray-600 mt-1">性價比最高的選擇</div>
          </div>
          <div className="text-center p-4 bg-white/70 rounded-lg">
            <div className="font-semibold text-gray-800 mb-2">頂級體驗</div>
            <div className="text-luxury-gold font-bold">Premium 2500</div>
            <div className="text-gray-600 mt-1">全功能頂級會員</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <button 
          onClick={openRegister}
          className="btn-luxury px-8 py-3 text-lg"
        >
          立即註冊會員
        </button>
        <div className="text-sm text-gray-500">
          有任何問題？歡迎聯絡客服：0800-123-456
        </div>
      </div>
    </>
  )
}