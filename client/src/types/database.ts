// SheSocial Database Types
// Matches NeDB structure for seamless sync

export interface BaseDocument {
  _id?: string
  createdAt: Date
  updatedAt: Date
  lastSync?: Date | null
}

// User Profile Types
export interface UserProfile extends BaseDocument {
  email: string
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
    joinDate: Date
    payments: PaymentRecord[]
    vouchers?: VoucherBalance
    permissions: {
      viewParticipants: boolean
      priorityBooking: boolean
    }
  }
}

export interface VideoProfile {
  type: 'introduction' | 'interests' | 'profession' | 'lifestyle' | 'closing'
  url: string
  duration: number
  approved: boolean
  uploadedAt: Date
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

// Database Collections
export interface DatabaseCollections {
  users: UserProfile
  events: EventData
  bookings: BookingData
  syncQueue: SyncQueueItem
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
