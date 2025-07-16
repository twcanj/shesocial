// Personalized Membership Recommendation based on User Profile
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserProfile } from '../../shared-types'

interface RecommendationData {
  recommendedPlan: 'regular' | 'vip' | 'premium_1300' | 'premium_2500'
  confidence: number
  reasons: string[]
  alternatives: {
    plan: string
    reason: string
  }[]
  discount?: {
    amount: number
    expiry: Date
    reason: string
  }
}

export const PersonalizedRecommendation: React.FC = () => {
  const { user } = useAuth()
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null)
  const [loading, setLoading] = useState(true)

  const generateRecommendation = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // Call recommendation API or generate locally
      const rec = generateLocalRecommendation(user)
      setRecommendation(rec)
    } catch (error) {
      console.error('Failed to generate recommendation:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    generateRecommendation();
  }, [generateRecommendation]);

  const generateLocalRecommendation = (user: UserProfile): RecommendationData => {
    const score = {
      regular: 0,
      vip: 0,
      premium_1300: 0,
      premium_2500: 0
    }
    
    const reasons: string[] = []
    const alternatives: { plan: string; reason: string }[] = []

    // Age-based recommendations
    const age = user.profile?.age || 25
    if (age >= 25 && age <= 35) {
      score.premium_1300 += 30
      score.premium_2500 += 20
      reasons.push('您的年齡層通常偏好靈活的券包方案')
    } else if (age > 35) {
      score.premium_2500 += 40
      score.vip += 30
      reasons.push('成熟族群重視查看參與者和優質服務')
    } else {
      score.regular += 30
      score.vip += 20
      reasons.push('年輕族群可從基本方案開始體驗')
    }

    // Location-based recommendations
    const location = user.profile?.location || ''
    if (['台北市', '新北市'].includes(location)) {
      score.premium_2500 += 25
      score.premium_1300 += 20
      reasons.push('都會區會員重視查看參與者功能')
    }

    // Occupation-based recommendations  
    // Note: occupation field is not in current UserProfile schema
    // This is a placeholder for future implementation
    const occupation = '' // user.profile?.occupation?.toLowerCase() || ''
    if (occupation.includes('醫師') || occupation.includes('律師') || occupation.includes('主管')) {
      score.premium_2500 += 35
      reasons.push('專業人士通常偏好Premium服務')
    } else if (occupation.includes('工程師') || occupation.includes('設計師')) {
      score.premium_1300 += 30
      reasons.push('技術專業人士喜歡靈活的券包方案')
    }

    // Interest-based recommendations
    const interests = user.profile?.interests || []
    if (interests.some((i: string) => ['旅行', '美食', '品酒'].includes(i))) {
      score.premium_2500 += 20
      score.premium_1300 += 15
      reasons.push('您的興趣顯示重視高品質體驗')
    }

    // Expectations-based recommendations
    // Note: salesLead field is not in current UserProfile schema
    // This is a placeholder for future implementation
    const expectations = '' // user.membership?.salesLead?.expectations || ''
    if (expectations.includes('高學歷') || expectations.includes('穩定') || expectations.includes('成熟')) {
      score.premium_2500 += 25
      reasons.push('您期望的伴侶特質符合Premium會員群體')
    }

    // Lead source considerations
    // Note: leadSource field is not in current UserProfile schema
    // This is a placeholder for future implementation
    const leadSource = null // user.membership?.leadSource
    if (leadSource === 'referral') {
      score.premium_1300 += 15
      reasons.push('朋友推薦的會員通常選擇中高階方案')
    }

    // Find the highest scoring plan
    const topPlan = Object.entries(score).reduce((a, b) => 
      score[a[0] as keyof typeof score] > score[b[0] as keyof typeof score] ? a : b
    )[0] as keyof typeof score

    // Generate alternatives
    const sortedPlans = Object.entries(score)
      .sort(([,a], [,b]) => b - a)
      .slice(1, 3)

    sortedPlans.forEach(([plan]) => {
      switch (plan) {
        case 'regular':
          alternatives.push({
            plan: 'Regular會員',
            reason: '預算友善的入門選擇'
          })
          break
        case 'vip':
          alternatives.push({
            plan: 'VIP會員',
            reason: '優先權益，月付制更彈性'
          })
          break
        case 'premium_1300':
          alternatives.push({
            plan: 'Premium 1300',
            reason: '性價比最高的券包方案'
          })
          break
        case 'premium_2500':
          alternatives.push({
            plan: 'Premium 2500',
            reason: '完整功能，最佳交友體驗'
          })
          break
      }
    })

    // Calculate confidence
    const maxScore = Math.max(...Object.values(score))
    const confidence = Math.min(95, Math.max(60, (maxScore / 100) * 100))

    // Generate discount if applicable
    let discount
    if (new Date().getDay() === 0) { // Sunday special
      discount = {
        amount: 10,
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        reason: '週日限時優惠'
      }
    }

    return {
      recommendedPlan: topPlan,
      confidence,
      reasons: reasons.slice(0, 3), // Top 3 reasons
      alternatives: alternatives.slice(0, 2), // Top 2 alternatives
      discount
    }
  }

  const getPlanDetails = (plan: string) => {
    const plans = {
      regular: {
        name: 'Regular會員',
        price: '¥600入會+¥300/月',
        color: 'bg-blue-500',
        features: ['參加所有活動', '基本會員權益', '客服支援']
      },
      vip: {
        name: 'VIP會員',
        price: '¥1000入會+¥300/月',
        color: 'bg-purple-500',
        features: ['優先報名', 'VIP專屬活動', '專業客服', '活動提醒']
      },
      premium_1300: {
        name: 'Premium 1300',
        price: '¥1300券包',
        color: 'bg-gold-500',
        features: ['優先報名', '活動折扣券', '特殊權益', '靈活使用']
      },
      premium_2500: {
        name: 'Premium 2500',
        price: '¥2500券包',
        color: 'bg-luxury-gold',
        features: ['查看參與者', '最高優先權', '專屬服務', '所有權益']
      }
    }
    return plans[plan as keyof typeof plans] || plans.regular
  }

  if (loading) {
    return (
      <div className="card-luxury p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>正在為您分析最適合的方案...</p>
      </div>
    )
  }

  if (!recommendation) {
    return (
      <div className="card-luxury p-8 text-center">
        <p className="text-secondary-600">無法生成個人化推薦，請稍後再試</p>
      </div>
    )
  }

  const recommendedPlan = getPlanDetails(recommendation.recommendedPlan)

  return (
    <div className="space-y-6">
      {/* Discount Banner */}
      {recommendation.discount && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">🎉 {recommendation.discount.reason}</h3>
              <p>享受 {recommendation.discount.amount}% 折扣優惠</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">優惠期限</div>
              <div className="font-semibold">
                {recommendation.discount.expiry.toLocaleDateString('zh-TW')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Recommendation */}
      <div className="card-luxury p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-luxury-gold mb-2">
            為您推薦的最佳方案
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-secondary-600">符合度：</span>
            <div className="flex items-center">
              <div className="w-20 bg-secondary-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-luxury-gold h-2 rounded-full transition-all duration-500"
                  style={{ width: `${recommendation.confidence}%` }}
                ></div>
              </div>
              <span className="text-luxury-gold font-semibold">
                {recommendation.confidence}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-luxury-gold/10 to-luxury-champagne/20 p-6 rounded-lg border-2 border-luxury-gold mb-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-luxury-gold mb-2">
              {recommendedPlan.name}
            </h3>
            <p className="text-xl font-semibold text-secondary-800 mb-4">
              {recommendedPlan.price}
              {recommendation.discount && (
                <span className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded">
                  -{recommendation.discount.amount}%
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {recommendedPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <svg className="w-4 h-4 text-luxury-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
            <button className="btn-luxury w-full">
              選擇此方案
            </button>
          </div>
        </div>

        {/* Recommendation Reasons */}
        <div className="mb-6">
          <h4 className="font-semibold text-secondary-800 mb-3">
            為什麼推薦這個方案？
          </h4>
          <div className="space-y-2">
            {recommendation.reasons.map((reason, index) => (
              <div key={index} className="flex items-start">
                <div className="w-6 h-6 bg-luxury-gold/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-luxury-gold text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-secondary-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Plans */}
        {recommendation.alternatives.length > 0 && (
          <div>
            <h4 className="font-semibold text-secondary-800 mb-3">
              其他適合的選擇
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendation.alternatives.map((alt, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-luxury-gold transition-colors">
                  <h5 className="font-semibold text-secondary-800 mb-2">
                    {alt.plan}
                  </h5>
                  <p className="text-sm text-secondary-600 mb-3">
                    {alt.reason}
                  </p>
                  <button className="btn-luxury-outline text-sm w-full">
                    了解更多
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Personal Touch */}
      <div className="card-luxury p-6 bg-luxury-pearl/20">
        <div className="flex items-start">
          <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-secondary-800 mb-2">
              專屬建議
            </h4>
            <p className="text-secondary-700 text-sm">
              根據您的個人資料，我們為您客製化了這個推薦。如有任何疑問，
              歡迎聯繫我們的顧問團隊獲得更詳細的諮詢。
            </p>
            <button className="btn-luxury-outline text-sm mt-3">
              預約免費諮詢
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalizedRecommendation
