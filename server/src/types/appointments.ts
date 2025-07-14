// Appointment System Types - 預約系統類型定義
// InfinityMatch 天造地設人成對 - 1+1=∞ 台灣頂級配對平台

export type AppointmentType = 'consultation' | 'member_interview'

export type AppointmentStatus = 
  | 'available'     // 可預約
  | 'booked'        // 已預約
  | 'confirmed'     // 已確認
  | 'completed'     // 已完成
  | 'cancelled'     // 已取消
  | 'no_show'       // 未出席

export type InterviewType = 'video_call' | 'phone_call' | 'in_person'

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number // every N days/weeks/months
  daysOfWeek?: number[] // 0-6 for weekly
  endDate?: Date
  maxOccurrences?: number
}

// ===== APPOINTMENT SLOT MANAGEMENT =====

export interface AppointmentSlot {
  _id: string
  type: AppointmentType
  
  // Time Management
  date: string // YYYY-MM-DD format
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  duration: number // minutes
  timezone: string // 'Asia/Taipei'
  
  // Interviewer/Consultant Info
  interviewerId: string
  interviewerName: string
  interviewerTitle?: string
  interviewType: InterviewType
  
  // Availability
  isAvailable: boolean
  capacity: number // how many people can book this slot
  bookedCount: number
  
  // Recurring Appointments
  isRecurring: boolean
  recurringPattern?: RecurringPattern
  parentSlotId?: string // for recurring appointments
  
  // Location/Meeting Info
  location?: string // for in-person
  meetingUrl?: string // for video calls
  meetingId?: string // Zoom/Teams ID
  phoneNumber?: string // for phone calls
  
  // Business Logic
  requiresPreApproval: boolean
  cancellationDeadlineHours: number
  
  // Metadata
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// ===== APPOINTMENT BOOKING =====

export interface AppointmentBooking {
  _id: string
  slotId: string
  
  // User Information
  userId?: string // for registered users
  guestInfo?: {
    name: string
    email: string
    phone: string
    preferredContact: 'email' | 'phone' | 'line'
  }
  
  // Appointment Details
  type: AppointmentType
  status: AppointmentStatus
  
  // Scheduling
  scheduledDate: string
  scheduledTime: string
  duration: number
  timezone: string
  
  // Interview/Consultation Specific
  purpose?: string
  questions?: string[]
  membershipInterest?: string[]
  
  // Meeting Details
  meetingUrl?: string
  meetingId?: string
  dialInNumber?: string
  location?: string
  
  // Communication
  confirmationSent: boolean
  remindersSent: number
  
  // Follow-up
  completed: boolean
  outcome?: 'approved' | 'rejected' | 'pending_review'
  interviewNotes?: string
  rating?: number // 1-5 stars
  followUpRequired: boolean
  
  // Timestamps
  bookedAt: Date
  confirmedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  
  // Metadata
  cancellationReason?: string
  rescheduleCount: number
  createdAt: Date
  updatedAt: Date
}

// ===== INTERVIEWER MANAGEMENT =====

export interface Interviewer {
  _id: string
  userId: string // linked to User account
  
  // Basic Info
  name: string
  title: string
  email: string
  phone?: string
  avatar?: string
  
  // Specializations
  appointmentTypes: AppointmentType[]
  interviewTypes: InterviewType[]
  languages: string[]
  specialties: string[] // e.g., ['luxury_dating', 'relationship_coaching']
  
  // Availability
  isActive: boolean
  defaultAvailability: {
    [key: string]: { // day of week (monday, tuesday, etc.)
      enabled: boolean
      startTime: string
      endTime: string
      breakTimes?: Array<{
        startTime: string
        endTime: string
      }>
    }
  }
  
  // Settings
  maxDailyAppointments: number
  bufferTimeMinutes: number // time between appointments
  advanceBookingDays: number
  autoApproval: boolean
  
  // Performance
  totalAppointments: number
  completedAppointments: number
  averageRating: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}