// SheSocial Database Types for Backend
// Shared types with frontend for consistency

export interface BaseDocument {
  _id?: string
  createdAt: string | Date
  updatedAt: string | Date
  lastSync?: string | Date | null
}

// User Profile Types
export interface UserProfile extends BaseDocument {
  email: string
  password?: string
  lastLoginAt?: string | Date
  profile: {
    name: string
    age: number
    bio: string
    interests: string[]
    location: string
    avatar?: string
    videos: VideoProfile[]
    interviewStatus: {
      completed: boolean
      duration: number
      interviewer?: string
      notes?: string
      scheduledAt?: Date
    }
  }
  membership: {
    type: 'regular' | 'vip' | 'premium_1300' | 'premium_2500'
    status: 'profile_incomplete' | 'profile_completed' | 'pending_payment' | 'paid' | 'interview_scheduled' | 'interview_completed' | 'active' | 'suspended'
    joinDate: string | Date
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
    payments: PaymentRecord[]
    vouchers?: VoucherBalance
    leadSource?: string // 客戶來源追蹤
    salesNotes?: string // 銷售備註
    permissions: {
      viewParticipants: boolean
      priorityBooking: boolean
      uploadMedia: boolean
      bookInterview: boolean
    }
  }
}

// Media Management Types
export interface MediaItem extends BaseDocument {
  userId: string
  cloudinaryId: string
  url: string
  secureUrl: string
  type: 'image' | 'video'
  category: 'profile_photo' | 'introduction_video' | 'interview_video' | 'lifestyle_photo' | 'activity_photo'
  metadata: {
    filename: string
    size: number
    duration?: number // for videos
    format: string
    width?: number
    height?: number
  }
  status: 'pending' | 'approved' | 'rejected' | 'requires_revision'
  reviewInfo?: {
    reviewedBy: string
    reviewedAt: Date
    rejectionReason?: string
    notes?: string
  }
  visibility: {
    public: boolean
    members_only: boolean
    premium_only: boolean
  }
}

export interface VideoProfile {
  type: 'introduction' | 'interests' | 'profession' | 'lifestyle' | 'closing'
  mediaId: string // Reference to MediaItem
  url: string
  duration: number
  approved: boolean
  uploadedAt: Date
}

// Interview Management Types
export interface InterviewSession extends BaseDocument {
  applicantId: string
  interviewerId: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  scheduledAt: Date
  duration: number // in minutes
  type: 'video_call' | 'phone_call' | 'in_person'
  meetingUrl?: string
  notes?: string
  outcome: 'pending' | 'approved' | 'rejected' | 'requires_follow_up'
  recordingUrl?: string // Cloudinary video URL
  followUpRequired: boolean
  applicationData: {
    membershipType: UserProfile['membership']['type']
    referralSource?: string
    motivation: string
    expectations: string
  }
}

// Sales Lead Tracking Types
export interface SalesLead extends BaseDocument {
  userId: string
  userEmail: string
  userName?: string
  leadSource: 'website' | 'social_media' | 'referral' | 'advertisement' | 'other'
  leadStatus: 'new' | 'contacted' | 'interested' | 'qualified' | 'converted' | 'lost'
  membershipInterest: UserProfile['membership']['type']
  profileCompleteness: number // 0-100%
  lastActivity: Date
  salesNotes: string[]
  assignedSalesRep?: string
  estimatedValue: number
  conversionProbability: number // 0-100%
  followUpDate?: Date
  contactHistory: {
    date: Date
    method: 'email' | 'phone' | 'message' | 'meeting'
    notes: string
    outcome: 'answered' | 'no_answer' | 'interested' | 'not_interested' | 'callback_requested'
  }[]
}

// Admin and Staff Management Types
export interface AdminUser extends BaseDocument {
  email: string
  password: string
  profile: {
    name: string
    role: 'super_admin' | 'content_moderator' | 'interviewer' | 'customer_service'
    department: string
    avatar?: string
  }
  permissions: {
    manage_users: boolean
    moderate_content: boolean
    conduct_interviews: boolean
    handle_payments: boolean
    view_analytics: boolean
    manage_events: boolean
  }
  lastLoginAt?: Date
  isActive: boolean
}

// Content Moderation Queue
export interface ModerationQueue extends BaseDocument {
  mediaId: string
  userId: string
  moderatorId?: string
  priority: 'high' | 'medium' | 'low'
  category: MediaItem['category']
  status: 'pending' | 'in_review' | 'completed'
  flags?: {
    inappropriate_content: boolean
    poor_quality: boolean
    privacy_violation: boolean
    fake_profile: boolean
    other: string
  }
  moderationNotes?: string
  estimatedReviewTime?: number // in minutes
}

export interface PaymentRecord {
  amount: number
  date: Date
  method: 'LINE Pay' | 'ECPay' | 'Apple Pay' | 'Google Pay'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
}

export interface VoucherBalance {
  total_100: number
  total_200: number
  used_100: number
  used_200: number
  expiry: Date
  validFor: string[]
}

// Event Types
export interface EventData extends BaseDocument {
  name: string
  metadata: {
    date: Date
    location: string
    category: string
    type: '1day_trip' | '4hour_dining' | '2day_trip'
    pricing: {
      male: number
      female: number
      voucherDiscount: {
        '100': number
        '200': number
      }
    }
    requirements: {
      ageMin: number
      ageMax: number
      maritalStatus: 'single' | 'divorced' | 'any'
    }
    schedule: {
      frequency: 'biweekly'
      cycle: '3months'
      totalEvents: number
      twoDayTrips: number
    }
  }
  participants: EventParticipant[]
  participantVisibility: {
    premium_2500: boolean
    vip: boolean
    regular: boolean
  }
  notifications: {
    sent: boolean
    sentAt?: Date
    recipients: string[]
  }
  maxParticipants: number
  status: 'draft' | 'published' | 'full' | 'completed' | 'cancelled'
}

export interface EventParticipant {
  userId: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
  paid: boolean
  voucherUsed?: {
    type: '100' | '200'
    amount: number
  }
  joinedAt: Date
}

// Booking Types
export interface BookingData extends BaseDocument {
  userId: string
  eventId: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentMethod?: string
  voucherApplied?: {
    type: '100' | '200'
    amount: number
    voucherId: string
  }
  specialRequests?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

// Sync Queue Types
export interface SyncQueueItem {
  id?: number
  collection: 'users' | 'events' | 'bookings'
  operation: 'insert' | 'update' | 'delete'
  data: any
  timestamp: number
  retries: number
  lastError?: string
  priority: 'high' | 'medium' | 'low'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface SyncResponse {
  changes: any[]
  timestamp: number
  conflicts?: ConflictItem[]
}

export interface ConflictItem {
  collection: string
  localData: any
  serverData: any
  resolution: 'server_wins' | 'client_wins' | 'merge_required'
}

// Startup Health Check Types (inspired by fortuneT implementation)
export interface StartupRecord extends BaseDocument {
  serverStartTime: Date
  environment: string
  nodeVersion: string
  processId: number
  memoryAtStartup: {
    used: number
    total: number
    rss: number
  }
  databaseStatus: 'connected' | 'error' | 'initializing'
  healthCheckResults: HealthCheckResult[]
  allSystemsHealthy: boolean
  warningCount: number
  errorCount: number
  startupDuration: number // in milliseconds
  systemInfo: {
    platform: string
    arch: string
    hostname: string
  }
}

export interface HealthCheckResult {
  component: string
  status: 'healthy' | 'warning' | 'error'
  message: string
  checkDuration: number // in milliseconds
  timestamp: Date
  details?: any
}

export interface HealthLog extends BaseDocument {
  recordType: 'startup' | 'periodic' | 'manual' | 'shutdown'
  serverUptime: number
  timestamp: Date
  memory: {
    used: number
    total: number
    rss: number
  }
  database: {
    status: 'connected' | 'error'
    collections: Record<string, number | string>
    files: Array<{
      name: string
      size: number | string
      modified: Date | null
    }>
    totalFiles: number
    r2Ready: boolean
  }
  healthScore: number // 0-100, overall system health
  warnings: string[]
  errors: string[]
  systemInfo: {
    processId: number
    nodeVersion: string
    environment: string
    platform: string
  }
}

// Database Collections
export interface DatabaseCollections {
  users: UserProfile
  events: EventData
  bookings: BookingData
  syncQueue: SyncQueueItem
  media: MediaItem
  interviews: InterviewSession
  admins: AdminUser
  moderationQueue: ModerationQueue
  salesLeads: SalesLead
  startup_records: StartupRecord
  health_logs: HealthLog
}

// Utility Types
export type CollectionName = keyof DatabaseCollections
export type DocumentType<T extends CollectionName> = DatabaseCollections[T]

// Search and Filter Types
export interface EventFilters {
  location?: string
  dateRange?: {
    start: Date
    end: Date
  }
  type?: EventData['metadata']['type']
  ageRange?: {
    min: number
    max: number
  }
  priceRange?: {
    min: number
    max: number
  }
}

export interface UserSearchFilters {
  location?: string
  ageRange?: {
    min: number
    max: number
  }
  interests?: string[]
  membershipType?: UserProfile['membership']['type']
}