// Shared types for SheSocial - avoiding cache issues

export interface EventData {
  _id?: string
  name: string
  metadata: {
    date: Date | string
    location: string
    category: string
    type: '1day_trip' | '4hour_dining' | '2day_trip'
    pricing?: {
      male: number
      female: number
      voucherDiscount?: {
        '100': number
        '200': number
      }
    }
    requirements?: {
      ageMin: number
      ageMax: number
      maritalStatus: 'single' | 'divorced' | 'any'
    }
    schedule?: {
      frequency: 'biweekly'
      cycle: '3months'
      totalEvents: number
      twoDayTrips: number
    }
  }
  participants: EventParticipant[]
  maxParticipants?: number
  status: 'draft' | 'published' | 'full' | 'completed' | 'cancelled'
  participantVisibility?: {
    premium_2500: boolean
    vip: boolean
    regular: boolean
  }
  notifications?: {
    sent: boolean
    sentAt?: Date | string
    recipients: string[]
  }
  createdAt: Date | string
  updatedAt: Date | string
  lastSync?: Date | string | null
}

export interface EventParticipant {
  userId: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
  paid: boolean
  voucherUsed?: {
    type: '100' | '200'
    amount: number
  }
  joinedAt: Date | string
}

export interface BookingData {
  _id?: string
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
  createdAt: Date | string
  updatedAt: Date | string
  lastSync?: Date | string | null
}

export interface UserProfile {
  _id?: string
  email: string
  profile: {
    name: string
    age: number
    bio?: string
    interests: string[]
    location: string
    avatar?: string
    videos: VideoProfile[]
    interviewStatus: {
      completed: boolean
      duration: number
      interviewer?: string
      notes?: string
      scheduledAt?: Date | string
    }
  }
  membership: {
    type: 'regular' | 'vip' | 'premium_1300' | 'premium_2500'
    joinDate: Date | string
    payments: PaymentRecord[]
    vouchers?: VoucherBalance
    permissions: {
      viewParticipants: boolean
      priorityBooking: boolean
    }
  }
  createdAt: Date | string
  updatedAt: Date | string
  lastSync?: Date | string | null
}

export interface VideoProfile {
  type: 'introduction' | 'interests' | 'profession' | 'lifestyle' | 'closing'
  url: string
  duration: number
  approved: boolean
  uploadedAt: Date | string
}

export interface PaymentRecord {
  amount: number
  date: Date | string
  method: 'LINE Pay' | 'ECPay' | 'Apple Pay' | 'Google Pay'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
}

export interface VoucherBalance {
  total_100: number
  total_200: number
  used_100: number
  used_200: number
  expiry: Date | string
  validFor: string[]
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

// Search and Filter Types
export interface EventFilters {
  location?: string
  dateRange?: {
    start: Date | string
    end: Date | string
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