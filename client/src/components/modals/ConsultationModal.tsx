// Consultation Booking Modal Content - reusable component
import React from 'react'

export const ConsultationModalContent: React.FC = () => {
  return (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-luxury-gold/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gradient-luxury mb-2">預約視訊面試</h3>
        <p className="text-gray-600">
          所有新會員都需要通過30分鐘的視訊面試<br/>
          確保會員品質和平台安全
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">面試內容包括：</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 身份驗證和基本資料確認</li>
            <li>• 參與動機和期望了解</li>
            <li>• 平台規則和安全須知</li>
            <li>• 會員權益和功能介紹</li>
          </ul>
        </div>

        <div className="p-4 bg-luxury-gold/5 border border-luxury-gold/20 rounded-lg">
          <h4 className="font-semibold text-luxury-gold mb-2">聯絡方式：</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>客服專線：0800-123-456</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>客服信箱：support@shesocial.tw</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>服務時間：週一至週五 10:00-18:00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => window.open('tel:0800123456')}
          className="btn-luxury w-full"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          立即撥打客服專線
        </button>
        <button 
          onClick={() => window.open('mailto:support@shesocial.tw?subject=預約視訊面試&body=您好，我想要預約新會員視訊面試，請協助安排時間。%0A%0A姓名：%0A聯絡電話：%0A希望面試時間：')}
          className="btn-luxury-outline w-full"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          發送預約信件
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          我們會在24小時內回覆您的預約申請
        </p>
      </div>
    </>
  )
}