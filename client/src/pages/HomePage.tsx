// Home Page Component
// Main landing page with hero section and customer flow
import { useNavigate } from 'react-router-dom'

export const HomePage = () => {
  const navigate = useNavigate()

  return (
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
          <div className="luxury-card-outline p-8 text-center">
            <div className="text-4xl mb-4">😔</div>
            <h3 className="luxury-card-title">單身生活困擾？</h3>
            <ul className="luxury-card-features text-left">
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>工作忙碌，沒時間社交</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>網路交友風險高</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>朋友介紹有壓力</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>不知道怎麼認識優質對象</span>
              </li>
            </ul>
            <div className="mt-6 font-semibold text-luxury-gold">我們理解您的需求</div>
          </div>
          
          <div className="luxury-card-selected p-8 text-center">
            <div className="luxury-card-badge">
              <div className="luxury-card-badge-inner">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                推薦
              </div>
            </div>
            <div className="text-4xl mb-4">✨</div>
            <h3 className="luxury-card-title">天造地設人成對 解決方案</h3>
            <ul className="luxury-card-features text-left">
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-selected"></div>
                <span>每月2場精選活動</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-selected"></div>
                <span>身份真實驗證</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-selected"></div>
                <span>小班制高品質互動</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-selected"></div>
                <span>專業配對諮詢</span>
              </li>
            </ul>
            <div className="mt-6 font-semibold">量身打造的社交體驗</div>
          </div>
          
          <div className="luxury-card-outline p-8 text-center">
            <div className="text-4xl mb-4">💕</div>
            <h3 className="luxury-card-title">成功收穫愛情！</h3>
            <ul className="luxury-card-features text-left">
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>85% 配對成功率</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>平均3個月找到真愛</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>500+ 成功案例</span>
              </li>
              <li className="luxury-card-feature">
                <div className="luxury-feature-dot-outline"></div>
                <span>終身幸福保障</span>
              </li>
            </ul>
            <div className="mt-6 font-semibold text-luxury-gold">您的幸福，我們的使命</div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="luxury-card-outline p-8 mt-12">
          <h2 className="luxury-card-title text-center mb-8">真實會員回饋</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="luxury-card-outline p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-luxury-gold font-bold">王小姐</span>
                </div>
                <div>
                  <div className="font-semibold text-luxury-gold">32歲 金融業</div>
                  <div className="text-sm text-luxury-platinum/60">加入3個月後結婚</div>
                </div>
              </div>
              <p className="text-luxury-platinum/80 italic">
                                &quot;原本對網路交友很害怕，但天造地設人成對的視訊面試讓我很安心。
                在第二場活動就遇到現在的老公，1+1真的等於無限！&quot;
              </p>
            </div>
            
            <div className="luxury-card-outline p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-luxury-gold font-bold">李先生</span>
                </div>
                <div>
                  <div className="font-semibold text-luxury-gold">35歲 科技業</div>
                  <div className="text-sm text-luxury-platinum/60">VVIP會員</div>
                </div>
              </div>
              <p className="text-luxury-platinum/80 italic">
                                &quot;工作太忙沒時間交朋友，天造地設人成對的活動品質很高，
                都是真心想找伴侶的人。小班制讓每個人都有機會深入了解。&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="luxury-card-selected p-8 mt-12 text-center">
          <h2 className="luxury-card-title mb-4">準備好找到真愛了嗎？</h2>
          <p className="text-lg mb-6 text-luxury-midnight-black/80">
            加入500+成功會員的行列，讓我們幫您找到人生伴侶
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button 
              onClick={() => navigate('/pricing')}
              className="luxury-card-button-selected w-full sm:w-auto"
            >
              查看會員方案
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="w-full sm:w-auto py-3 px-6 rounded-lg font-medium transition-all duration-300 border-2 border-luxury-midnight-black bg-transparent text-luxury-midnight-black hover:bg-luxury-midnight-black hover:text-luxury-gold"
            >
              預約免費諮詢
            </button>
          </div>
          <p className="text-sm mt-4 text-luxury-midnight-black/60">
            ✓ 免費諮詢 ✓ 無壓力了解 ✓ 專業配對建議
          </p>
        </div>
      </div>
    </main>
  )
}

export default HomePage