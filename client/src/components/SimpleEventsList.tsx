// Simple Events List - avoiding complex type issues
import React from 'react'

interface SimpleEventsListProps {
  onNavigateHome?: () => void
}

export const SimpleEventsList: React.FC<SimpleEventsListProps> = ({ onNavigateHome }) => {
  const mockEvents = [
    {
      id: '1',
      name: '台北奢華晚宴',
      location: '台北君悅酒店',
      date: '2025-07-15',
      type: '4小時餐會',
      participants: 12,
      maxParticipants: 20
    },
    {
      id: '2', 
      name: '陽明山一日遊',
      location: '陽明山國家公園',
      date: '2025-07-20',
      type: '一日遊',
      participants: 8,
      maxParticipants: 15
    },
    {
      id: '3',
      name: '墾丁二日遊',
      location: '墾丁國家公園',
      date: '2025-07-25',
      type: '二日遊',
      participants: 6,
      maxParticipants: 12
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
      {/* Header Navigation */}
      <header className="nav-luxury">
        <div className="container-luxury">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Logo - clickable to go home */}
              <button 
                onClick={onNavigateHome}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo.jpeg" 
                  alt="SheSocial Logo" 
                  className="h-12 w-12 object-contain filter brightness-0 invert sepia saturate-[3] hue-rotate-[25deg] brightness-[1.2]"
                />
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-gradient-luxury">
                    SheSocial
                  </div>
                  <div className="text-sm text-secondary-500 -mt-1">
                    奢華社交活動平台
                  </div>
                </div>
              </button>
            </div>
            <nav className="hidden md:flex space-x-8">
              <span className="text-luxury-gold font-medium">
                活動
              </span>
              <button className="text-secondary-600 hover:text-luxury-gold transition-colors">
                會員
              </button>
              <button className="text-secondary-600 hover:text-luxury-gold transition-colors">
                關於
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <button className="btn-luxury-ghost">
                  登入
                </button>
                <button className="btn-luxury">
                  註冊
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-luxury section-luxury">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-luxury mb-2">
            精選活動
          </h1>
          <p className="text-gray-600">
            台灣高端社交活動平台，尋找您的理想伴侶
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockEvents.map((event) => (
            <div key={event.id} className="card-luxury p-6">
              {/* Event Header */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.name}
                </h3>
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {event.date}
                </div>
              </div>

              {/* Event Type Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-luxury-gold text-white">
                  {event.type}
                </span>
              </div>

              {/* Participants */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>參與人數</span>
                  <span>{event.participants}/{event.maxParticipants}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-luxury-gold h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(event.participants / event.maxParticipants) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="btn-luxury w-full">
                  查看詳情
                </button>
                <button className="btn-luxury-outline w-full">
                  立即報名
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="card-luxury p-8 max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-luxury-gold mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              加入SheSocial會員
            </h3>
            <p className="text-gray-600 mb-4">
              登入後即可報名活動、查看詳細資訊，開始您的社交之旅
            </p>
            <div className="space-x-3">
              <button className="btn-luxury-outline">
                登入
              </button>
              <button className="btn-luxury">
                註冊會員
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}