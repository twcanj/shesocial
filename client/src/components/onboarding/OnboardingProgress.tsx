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
      case 'completed': return 'bg-green-500 text-white'
      case 'current': return 'bg-luxury-gold text-white'
      case 'pending': return 'bg-secondary-200 text-secondary-600'
      case 'disabled': return 'bg-gray-100 text-gray-400'
      default: return 'bg-secondary-200 text-secondary-600'
    }
  }

  const getConnectorColor = (currentStep: number) => {
    const currentStatus = getStepStatus(currentStep)
    const nextStatus = getStepStatus(currentStep + 1)
    
    if (currentStatus === 'completed') return 'bg-green-500'
    if (currentStatus === 'current') return 'bg-luxury-gold'
    return 'bg-secondary-200'
  }

  return (
    <div className="card-luxury p-6">
      <h3 className="text-lg font-semibold text-secondary-800 mb-6">入會進度</h3>
      
      <div className="relative">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              <div className="flex items-center">
                {/* Step Circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium
                  ${getStepColor(status)}
                  transition-colors duration-200
                `}>
                  {status === 'completed' ? '✓' : step.icon}
                </div>
                
                {/* Step Content */}
                <div className="ml-4 flex-1">
                  <h4 className={`font-medium ${
                    status === 'disabled' ? 'text-gray-400' : 'text-secondary-800'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${
                    status === 'disabled' ? 'text-gray-400' : 'text-secondary-600'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Current step indicator */}
                  {status === 'current' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-luxury-gold/20 text-luxury-gold">
                        進行中
                      </span>
                    </div>
                  )}
                  
                  {/* Action buttons for current step */}
                  {status === 'current' && (
                    <div className="mt-3">
                      {step.id === 1 && (
                        <button 
                          onClick={() => window.location.href = '/pricing'}
                          className="btn-luxury-outline text-sm"
                        >
                          前往付費
                        </button>
                      )}
                      {step.id === 2 && (
                        <button 
                          onClick={() => window.location.href = '/profile'}
                          className="btn-luxury-outline text-sm"
                        >
                          完善資料
                        </button>
                      )}
                      {step.id === 3 && (
                        <button 
                          onClick={() => window.location.href = '/profile?tab=interview'}
                          className="btn-luxury-outline text-sm"
                        >
                          預約面試
                        </button>
                      )}
                      {step.id === 4 && (
                        <button 
                          onClick={() => window.location.href = '/profile?tab=media'}
                          className="btn-luxury-outline text-sm"
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
                  w-0.5 h-8 ml-6 mt-2 mb-2
                  ${getConnectorColor(step.id)}
                  transition-colors duration-200
                `} />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Overall Status Message */}
      <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
        {user.membership?.status === 'active' ? (
          <div className="flex items-center text-green-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">恭喜！您已完成所有入會步驟，現在可以參加活動了</span>
          </div>
        ) : (
          <div className="text-secondary-700">
            <span className="font-medium">
              {user.membership?.paymentStatus !== 'completed' && '請先完成付費以開始您的SheSocial之旅'}
              {user.membership?.paymentStatus === 'completed' && user.membership?.status === 'profile_incomplete' && '付費成功！請完善個人資料'}
              {user.membership?.status === 'interview_scheduled' && '資料完成！請準時參加您的面試'}
              {user.membership?.status === 'interview_completed' && '面試通過！現在可以上傳個人媒體了'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingProgress