// Onboarding Progress Tracker - Shows member journey status
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const OnboardingProgress: React.FC = () => {
  const { user } = useAuth()

  if (!user) return null

  const getStepStatus = (step: number) => {
    const status = user.membership?.status
    const paymentStatus = user.membership?.paymentStatus

    switch (step) {
      case 1: // Payment
        return paymentStatus === 'completed' ? 'completed' : 
               paymentStatus === 'pending' ? 'current' : 'pending'
      
      case 2: // Profile completion
        if (paymentStatus !== 'completed') return 'disabled'
        return status === 'profile_incomplete' ? 'current' :
               ['interview_scheduled', 'interview_completed', 'active'].includes(status || '') ? 'completed' : 'pending'
      
      case 3: // Interview
        if (!['interview_scheduled', 'interview_completed', 'active'].includes(status || '')) return 'disabled'
        return status === 'interview_scheduled' ? 'current' :
               ['interview_completed', 'active'].includes(status || '') ? 'completed' : 'pending'
      
      case 4: // Media upload
        if (status !== 'interview_completed' && status !== 'active') return 'disabled'
        return status === 'active' ? 'completed' : 'current'
      
      default:
        return 'pending'
    }
  }

  const steps = [
    {
      id: 1,
      title: '繳費完成',
      description: '選擇會員方案並完成付費',
      icon: '💳'
    },
    {
      id: 2,
      title: '完善資料',
      description: '填寫個人基本資料',
      icon: '📝'
    },
    {
      id: 3,
      title: '視訊面試',
      description: '30分鐘身份驗證面試',
      icon: '🎥'
    },
    {
      id: 4,
      title: '上傳媒體',
      description: '上傳個人照片和介紹影片',
      icon: '📸'
    }
  ]

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg luxury-glow'
      case 'current': return 'bg-gradient-to-r from-luxury-gold to-luxury-rose text-white shadow-lg luxury-glow'
      case 'pending': return 'bg-gradient-to-r from-luxury-pearl/40 to-luxury-champagne/30 text-luxury-platinum border border-luxury-pearl/50'
      case 'disabled': return 'bg-luxury-platinum/20 text-luxury-platinum/60 border border-luxury-platinum/30'
      default: return 'bg-gradient-to-r from-luxury-pearl/40 to-luxury-champagne/30 text-luxury-platinum'
    }
  }

  const getConnectorColor = (currentStep: number) => {
    const currentStatus = getStepStatus(currentStep)
    
    if (currentStatus === 'completed') return 'bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-sm'
    if (currentStatus === 'current') return 'bg-gradient-to-b from-luxury-gold to-luxury-rose shadow-sm'
    return 'bg-gradient-to-b from-luxury-pearl/40 to-luxury-champagne/30'
  }

  return (
    <div className="luxury-card-gradient p-8">
      <h3 className="text-2xl font-bold text-gradient-luxury mb-8 flex items-center">
        <span className="w-3 h-3 bg-luxury-gold rounded-full mr-3"></span>
        入會進度
      </h3>
      
      <div className="relative">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              <div className="flex items-center">
                {/* Step Circle */}
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold
                  ${getStepColor(status)}
                  transition-all duration-500 transform hover:scale-105
                  ${status === 'current' ? 'animate-pulse-luxury' : ''}
                `}>
                  {status === 'completed' ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`text-2xl ${status === 'current' ? 'drop-shadow-lg' : ''}`}>
                      {step.icon}
                    </span>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="ml-6 flex-1">
                  <h4 className={`font-bold text-lg mb-1 ${
                    status === 'disabled' ? 'text-luxury-platinum/60' : 
                    status === 'current' ? 'text-luxury-gold' :
                    status === 'completed' ? 'text-emerald-600' :
                    'text-luxury-midnight-black'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm mb-3 ${
                    status === 'disabled' ? 'text-luxury-platinum/50' : 
                    status === 'current' ? 'text-luxury-midnight-black/80' :
                    'text-luxury-platinum'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Current step indicator */}
                  {status === 'current' && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-luxury-gold/20 to-luxury-rose/20 text-luxury-gold border border-luxury-gold/30 shadow-sm">
                        <div className="w-2 h-2 bg-luxury-gold rounded-full mr-2 animate-pulse-luxury"></div>
                        進行中
                      </span>
                    </div>
                  )}
                  
                  {/* Completed indicator */}
                  {status === 'completed' && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        已完成
                      </span>
                    </div>
                  )}
                  
                  {/* Action buttons for current step */}
                  {status === 'current' && (
                    <div className="mt-4">
                      {step.id === 1 && (
                        <button 
                          onClick={() => window.location.href = '/pricing'}
                          className="luxury-button-sm"
                        >
                          前往付費
                        </button>
                      )}
                      {step.id === 2 && (
                        <button 
                          onClick={() => window.location.href = '/profile'}
                          className="luxury-button-sm"
                        >
                          完善資料
                        </button>
                      )}
                      {step.id === 3 && (
                        <button 
                          onClick={() => window.location.href = '/profile?tab=interview'}
                          className="luxury-button-sm"
                        >
                          預約面試
                        </button>
                      )}
                      {step.id === 4 && (
                        <button 
                          onClick={() => window.location.href = '/profile?tab=media'}
                          className="luxury-button-sm"
                        >
                          上傳媒體
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className={`
                  w-1 h-12 ml-8 mt-3 mb-3 rounded-full
                  ${getConnectorColor(step.id)}
                  transition-all duration-500
                `} />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Overall Status Message */}
      <div className="mt-8 luxury-card-outline p-6 bg-gradient-to-br from-luxury-pearl/10 to-luxury-champagne/5">
        {user.membership?.status === 'active' ? (
          <div className="flex items-center text-emerald-700">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg text-emerald-800">恭喜！入會完成 🎉</div>
              <div className="text-emerald-600 text-sm">您已完成所有入會步驟，現在可以參加活動了</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-luxury-gold to-luxury-rose rounded-full flex items-center justify-center mr-4 shadow-lg animate-pulse-luxury">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-xl text-luxury-gold mb-2 flex items-center">
                <span className="w-2 h-2 bg-luxury-gold rounded-full mr-3 animate-pulse-luxury"></span>
                下一步行動
              </div>
              <div className="text-luxury-gold text-sm font-medium leading-relaxed">
                {user.membership?.paymentStatus !== 'completed' && '請先完成付費以開始您的SheSocial之旅'}
                {user.membership?.paymentStatus === 'completed' && user.membership?.status === 'profile_incomplete' && '付費成功！請完善個人資料'}
                {user.membership?.status === 'interview_scheduled' && '資料完成！請準時參加您的面試'}
                {user.membership?.status === 'interview_completed' && '面試通過！現在可以上傳個人媒體了'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingProgress