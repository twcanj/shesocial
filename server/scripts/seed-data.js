// Seed Data Script for InfinityMatch Platform
// Creates predefined users for system testing and demo purposes

const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

// Predefined system users with different membership levels
const SYSTEM_USERS = [
  // Super Admin User
  {
    email: 'admin@infinitymatch.tw',
    password: 'InfinityAdmin2025!',
    profile: {
      name: '系統管理員',
      age: 30,
      bio: 'InfinityMatch 平台系統管理員',
      interests: ['系統管理', '平台運營'],
      location: '台北市',
      avatar: null,
      videos: [],
      interviewStatus: {
        completed: true,
        duration: 0,
        interviewer: 'system',
        notes: '系統管理員免面試',
        scheduledAt: new Date()
      }
    },
    membership: {
      type: 'premium_2500',
      status: 'active',
      joinDate: new Date(),
      paymentStatus: 'completed',
      payments: [],
      vouchers: { amount100: 25, amount200: 12 },
      leadSource: 'internal',
      salesNotes: '系統管理員帳戶',
      permissions: {
        viewParticipants: true,
        priorityBooking: true,
        uploadMedia: true,
        bookInterview: true
      }
    },
    role: 'super_admin' // Special admin role
  },

  // Premium VIP Member (for testing participant viewing)
  {
    email: 'vip@infinitymatch.tw',
    password: 'VipMember2025!',
    profile: {
      name: '王雅婷',
      age: 28,
      bio: '金融業主管，喜歡品味生活，尋找有共同理想的另一半',
      interests: ['品酒', '藝術收藏', '高爾夫', '音樂會', '旅行'],
      location: '台北市信義區',
      avatar: null,
      videos: [],
      interviewStatus: {
        completed: true,
        duration: 30,
        interviewer: '面試官-王美玲',
        notes: '表達清晰，條件優秀，已通過面試',
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    },
    membership: {
      type: 'premium_2500',
      status: 'active',
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      paymentStatus: 'completed',
      payments: [{
        amount: 2500,
        method: 'LINE Pay',
        status: 'completed',
        transactionId: 'LP' + Date.now(),
        paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }],
      vouchers: { amount100: 25, amount200: 12 },
      leadSource: 'facebook_ads',
      salesNotes: '高消費族群，對服務品質要求高',
      permissions: {
        viewParticipants: true,
        priorityBooking: true,
        uploadMedia: true,
        bookInterview: true
      }
    }
  },

  // Regular VIP Member 
  {
    email: 'member1@infinitymatch.tw',
    password: 'Member2025!',
    profile: {
      name: '張俊豪',
      age: 32,
      bio: '科技業工程師，熱愛運動和美食，希望找到生活步調相近的伴侶',
      interests: ['健身', '攝影', '咖啡', '登山', '電影'],
      location: '新北市板橋區',
      avatar: null,
      videos: [],
      interviewStatus: {
        completed: true,
        duration: 30,
        interviewer: '面試官-張麗華',
        notes: '個性穩重，工作穩定，適合交友',
        scheduledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      }
    },
    membership: {
      type: 'vip',
      status: 'active',
      joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      paymentStatus: 'completed',
      payments: [{
        amount: 1300, // 1000 entry + 300 monthly
        method: 'Apple Pay',
        status: 'completed',
        transactionId: 'AP' + Date.now(),
        paidAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      }],
      vouchers: null,
      leadSource: 'google_ads',
      salesNotes: '工程師族群，理性消費',
      permissions: {
        viewParticipants: false,
        priorityBooking: true,
        uploadMedia: true,
        bookInterview: true
      }
    }
  },

  // Premium 1300 Member
  {
    email: 'premium@infinitymatch.tw',
    password: 'Premium2025!',
    profile: {
      name: '林美慧',
      age: 26,
      bio: '設計師，個性開朗，喜歡藝術和創意生活',
      interests: ['設計', '展覽', '瑜伽', '烘焙', '閱讀'],
      location: '台中市西區',
      avatar: null,
      videos: [],
      interviewStatus: {
        completed: true,
        duration: 30,
        interviewer: '面試官-王美玲',
        notes: '創意豐富，溝通能力佳',
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    },
    membership: {
      type: 'premium_1300',
      status: 'active',
      joinDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      paymentStatus: 'completed',
      payments: [{
        amount: 1300,
        method: 'LINE Pay',
        status: 'completed',
        transactionId: 'LP' + (Date.now() - 1000),
        paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      }],
      vouchers: { amount100: 13, amount200: 0 },
      leadSource: 'instagram_ads',
      salesNotes: '年輕族群，對設計和質感有要求',
      permissions: {
        viewParticipants: false,
        priorityBooking: true,
        uploadMedia: true,
        bookInterview: true
      }
    }
  },

  // Regular Member
  {
    email: 'regular@infinitymatch.tw',
    password: 'Regular2025!',
    profile: {
      name: '陳建志',
      age: 29,
      bio: '行銷專員，喜歡戶外活動，個性隨和友善',
      interests: ['籃球', '音樂', '料理', '旅行', '電玩'],
      location: '高雄市前金區',
      avatar: null,
      videos: [],
      interviewStatus: {
        completed: false,
        duration: 0,
        interviewer: null,
        notes: null,
        scheduledAt: null
      }
    },
    membership: {
      type: 'regular',
      status: 'paid',
      joinDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      paymentStatus: 'completed',
      payments: [{
        amount: 900, // 600 entry + 300 monthly
        method: 'Google Pay',
        status: 'completed',
        transactionId: 'GP' + Date.now(),
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }],
      vouchers: null,
      leadSource: 'friend_referral',
      salesNotes: '朋友推薦，基本會員',
      permissions: {
        viewParticipants: false,
        priorityBooking: false,
        uploadMedia: true,
        bookInterview: true
      }
    }
  },

  // New User (Profile Incomplete)
  {
    email: 'newuser@infinitymatch.tw',
    password: 'NewUser2025!',
    profile: {
      name: '李小華',
      age: 25,
      bio: '',
      interests: [],
      location: '',
      avatar: null,
      videos: [],
      interviewStatus: {
        completed: false,
        duration: 0,
        interviewer: null,
        notes: null,
        scheduledAt: null
      }
    },
    membership: {
      type: 'regular',
      status: 'profile_incomplete',
      joinDate: new Date(),
      paymentStatus: 'pending',
      payments: [],
      vouchers: null,
      leadSource: 'organic_search',
      salesNotes: '新註冊用戶，待完善資料',
      permissions: {
        viewParticipants: false,
        priorityBooking: false,
        uploadMedia: false,
        bookInterview: false
      }
    }
  }
]

// Admin users - 2層4類權限架構
const ADMIN_USERS = [
  // === 第一層：最高權限層 ===
  
  // 1. 總管理員 - 業務最高決策權
  {
    adminId: 'admin-001',
    username: 'superadmin',
    email: 'superadmin@infinitymatch.tw',
    password: 'SuperAdmin2025!',
    profile: {
      realName: '張執行長',
      employeeId: 'CEO-001',
      department: 'executive',
      joinDate: new Date(),
      lastLogin: null
    },
    roleId: 'super_admin',
    customPermissions: [],
    status: 'active',
    twoFactorEnabled: false,
    ipWhitelist: null,
    sessionTimeout: 480, // 8 hours
    createdBy: 'system',
    lastModifiedBy: 'system'
  },

  // 2. 系統維護員 - 技術最高權限
  {
    adminId: 'admin-002',
    username: 'sysadmin',
    email: 'sysadmin@infinitymatch.tw',
    password: 'SysAdmin2025!',
    profile: {
      realName: '李技術長',
      employeeId: 'CTO-002',
      department: 'technical',
      joinDate: new Date(),
      lastLogin: null
    },
    roleId: 'system_admin',
    customPermissions: [],
    status: 'active',
    twoFactorEnabled: false,
    ipWhitelist: null,
    sessionTimeout: 480, // 8 hours
    createdBy: 'admin-001',
    lastModifiedBy: 'admin-001'
  },

  // === 第二層：日常營運層 ===
  
  // 3. 日常營運 - 內容活動管理，不觸及客戶
  {
    adminId: 'admin-003',
    username: 'operations',
    email: 'operations@infinitymatch.tw',
    password: 'Operations2025!',
    profile: {
      realName: '王營運經理',
      employeeId: 'OPS-003',
      department: 'operations',
      joinDate: new Date(),
      lastLogin: null
    },
    roleId: 'operation_admin',
    customPermissions: [],
    status: 'active',
    twoFactorEnabled: false,
    ipWhitelist: null,
    sessionTimeout: 360, // 6 hours
    createdBy: 'admin-001',
    lastModifiedBy: 'admin-001'
  },

  // 4. 客戶管理 - 面試、付費、VIP服務專責
  {
    adminId: 'admin-004',
    username: 'customer',
    email: 'customer@infinitymatch.tw',
    password: 'Customer2025!',
    profile: {
      realName: '陳客戶經理',
      employeeId: 'CSM-004',
      department: 'members',
      joinDate: new Date(),
      lastLogin: null
    },
    roleId: 'customer_admin',
    customPermissions: [],
    status: 'active',
    twoFactorEnabled: false,
    ipWhitelist: null,
    sessionTimeout: 360, // 6 hours
    createdBy: 'admin-001',
    lastModifiedBy: 'admin-001'
  }
]

// Interviewer seed data (面試官資源 - 由營運人員管理，不需登入)
const INTERVIEWERS = [
  {
    userId: null, // 面試官不是系統用戶，不關聯管理員帳戶
    name: '王美玲',
    title: '資深情感諮詢師',
    email: 'wangmeiling@infinitymatch.tw', // 聯絡用信箱，非登入帳戶
    phone: '02-2345-6789',
    appointmentTypes: ['consultation', 'member_interview'],
    interviewTypes: ['video_call', 'phone_call'],
    languages: ['zh-TW', 'en'],
    specialties: ['luxury_dating', 'relationship_coaching', 'personality_analysis'],
    isActive: true,
    defaultAvailability: {
      monday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakTimes: [{ startTime: '12:00', endTime: '13:00' }]
      },
      tuesday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakTimes: [{ startTime: '12:00', endTime: '13:00' }]
      },
      wednesday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakTimes: [{ startTime: '12:00', endTime: '13:00' }]
      },
      thursday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakTimes: [{ startTime: '12:00', endTime: '13:00' }]
      },
      friday: {
        enabled: true,
        startTime: '09:00',
        endTime: '18:00',
        breakTimes: [{ startTime: '12:00', endTime: '13:00' }]
      },
      saturday: {
        enabled: true,
        startTime: '10:00',
        endTime: '16:00',
        breakTimes: []
      },
      sunday: {
        enabled: false,
        startTime: '00:00',
        endTime: '00:00',
        breakTimes: []
      }
    },
    maxDailyAppointments: 8,
    bufferTimeMinutes: 15,
    advanceBookingDays: 30,
    autoApproval: true,
    totalAppointments: 0,
    completedAppointments: 0,
    averageRating: 0
  },
  {
    userId: null, // 面試官不是系統用戶
    name: '張麗華',
    title: '專業配對顧問',
    email: 'zhanglihua@infinitymatch.tw', // 聯絡用信箱
    phone: '02-3456-7890',
    appointmentTypes: ['consultation', 'member_interview'],
    interviewTypes: ['video_call', 'in_person'],
    languages: ['zh-TW'],
    specialties: ['executive_dating', 'career_matching', 'life_planning'],
    isActive: true,
    defaultAvailability: {
      monday: {
        enabled: true,
        startTime: '10:00',
        endTime: '19:00',
        breakTimes: [{ startTime: '12:30', endTime: '13:30' }]
      },
      tuesday: {
        enabled: true,
        startTime: '10:00',
        endTime: '19:00',
        breakTimes: [{ startTime: '12:30', endTime: '13:30' }]
      },
      wednesday: {
        enabled: false,
        startTime: '00:00',
        endTime: '00:00',
        breakTimes: []
      },
      thursday: {
        enabled: true,
        startTime: '10:00',
        endTime: '19:00',
        breakTimes: [{ startTime: '12:30', endTime: '13:30' }]
      },
      friday: {
        enabled: true,
        startTime: '10:00',
        endTime: '19:00',
        breakTimes: [{ startTime: '12:30', endTime: '13:30' }]
      },
      saturday: {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        breakTimes: [{ startTime: '12:00', endTime: '13:00' }]
      },
      sunday: {
        enabled: false,
        startTime: '00:00',
        endTime: '00:00',
        breakTimes: []
      }
    },
    maxDailyAppointments: 6,
    bufferTimeMinutes: 30,
    advanceBookingDays: 21,
    autoApproval: false,
    totalAppointments: 0,
    completedAppointments: 0,
    averageRating: 0
  },
  {
    userId: null, // 面試官不是系統用戶
    name: '李志強',
    title: '心理諮詢專家',
    email: 'lizhiqiang@infinitymatch.tw', // 聯絡用信箱
    phone: '02-4567-8901',
    appointmentTypes: ['member_interview'],
    interviewTypes: ['video_call', 'phone_call'],
    languages: ['zh-TW', 'en'],
    specialties: ['psychology_assessment', 'personality_matching', 'relationship_counseling'],
    isActive: true,
    defaultAvailability: {
      monday: {
        enabled: true,
        startTime: '14:00',
        endTime: '21:00',
        breakTimes: [{ startTime: '17:00', endTime: '18:00' }]
      },
      tuesday: {
        enabled: true,
        startTime: '14:00',
        endTime: '21:00',
        breakTimes: [{ startTime: '17:00', endTime: '18:00' }]
      },
      wednesday: {
        enabled: true,
        startTime: '14:00',
        endTime: '21:00',
        breakTimes: [{ startTime: '17:00', endTime: '18:00' }]
      },
      thursday: {
        enabled: true,
        startTime: '14:00',
        endTime: '21:00',
        breakTimes: [{ startTime: '17:00', endTime: '18:00' }]
      },
      friday: {
        enabled: false,
        startTime: '00:00',
        endTime: '00:00',
        breakTimes: []
      },
      saturday: {
        enabled: false,
        startTime: '00:00',
        endTime: '00:00',
        breakTimes: []
      },
      sunday: {
        enabled: true,
        startTime: '10:00',
        endTime: '18:00',
        breakTimes: [{ startTime: '12:00', endTime: '13:00' }]
      }
    },
    maxDailyAppointments: 5,
    bufferTimeMinutes: 20,
    advanceBookingDays: 14,
    autoApproval: true,
    totalAppointments: 0,
    completedAppointments: 0,
    averageRating: 0
  }
]

module.exports = {
  SYSTEM_USERS,
  ADMIN_USERS,
  INTERVIEWERS
}