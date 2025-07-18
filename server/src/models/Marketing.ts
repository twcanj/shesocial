// Marketing CTA System Models
// Enterprise-grade marketing campaign management for luxury social platform

export interface MarketingCampaign {
  campaignId: string
  name: string
  description: string
  type: 'cta' | 'email' | 'notification' | 'banner' | 'popup'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  
  // Campaign targeting
  targeting: {
    membershipTypes: ('visitor' | 'registered' | 'vip' | 'vvip')[]
    demographics?: {
      ageMin?: number
      ageMax?: number
      location?: string[]
      interests?: string[]
    }
    behaviorFilters?: {
      activityViewCount?: { min?: number; max?: number }
      registrationDate?: { from?: Date; to?: Date }
      lastActiveDate?: { from?: Date; to?: Date }
      eventParticipation?: boolean
      interviewCompleted?: boolean
    }
  }
  
  // Campaign content
  content: {
    title: string
    description: string
    primaryCTA: {
      text: string
      action: 'register' | 'upgrade' | 'book_interview' | 'view_events' | 'book_event' | 'custom'
      customUrl?: string
      variant: 'primary' | 'secondary' | 'luxury' | 'urgent'
    }
    secondaryCTA?: {
      text: string
      action: 'register' | 'upgrade' | 'book_interview' | 'view_events' | 'book_event' | 'custom'
      customUrl?: string
      variant: 'primary' | 'secondary' | 'luxury' | 'urgent'
    }
    icon?: string
    bannerImage?: string
    styling?: {
      backgroundColor?: string
      textColor?: string
      buttonColor?: string
      borderColor?: string
      fontFamily?: string
      fontSize?: string
    }
  }
  
  // Campaign scheduling
  schedule: {
    startDate: Date
    endDate?: Date
    timezone: string
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly'
    activeDays?: number[] // 0-6 (Sunday-Saturday)
    activeHours?: {
      from: string // HH:MM
      to: string   // HH:MM
    }
  }
  
  // A/B testing
  abTesting?: {
    enabled: boolean
    variants: {
      variantId: string
      name: string
      weight: number // 0-100
      content: typeof this.content
    }[]
    conversionMetric: 'click' | 'conversion' | 'registration' | 'upgrade'
  }
  
  // Campaign analytics
  analytics: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    costPerClick: number
    costPerConversion: number
    clickThroughRate: number
    conversionRate: number
    lastUpdated: Date
  }
  
  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastSync?: Date
}

export interface MarketingTemplate {
  templateId: string
  name: string
  description: string
  category: 'membership_upgrade' | 'event_promotion' | 'interview_booking' | 'welcome' | 'retention' | 'custom'
  type: 'cta' | 'email' | 'notification' | 'banner' | 'popup'
  
  // Template content with placeholders
  content: {
    title: string // Can contain {{variables}}
    description: string // Can contain {{variables}}
    primaryCTA: {
      text: string // Can contain {{variables}}
      action: 'register' | 'upgrade' | 'book_interview' | 'view_events' | 'book_event' | 'custom'
      customUrl?: string
      variant: 'primary' | 'secondary' | 'luxury' | 'urgent'
    }
    secondaryCTA?: {
      text: string
      action: 'register' | 'upgrade' | 'book_interview' | 'view_events' | 'book_event' | 'custom'
      customUrl?: string
      variant: 'primary' | 'secondary' | 'luxury' | 'urgent'
    }
    icon?: string
    bannerImage?: string
    styling?: {
      backgroundColor?: string
      textColor?: string
      buttonColor?: string
      borderColor?: string
      fontFamily?: string
      fontSize?: string
    }
  }
  
  // Template variables
  variables: {
    name: string
    type: 'string' | 'number' | 'date' | 'boolean' | 'array'
    description: string
    required: boolean
    defaultValue?: any
  }[]
  
  // Template settings
  settings: {
    isActive: boolean
    isSystem: boolean // System templates cannot be deleted
    usage: {
      totalCampaigns: number
      lastUsed?: Date
    }
  }
  
  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface MarketingAudience {
  audienceId: string
  name: string
  description: string
  type: 'static' | 'dynamic' | 'imported'
  
  // Audience criteria (for dynamic audiences)
  criteria?: {
    membershipTypes: ('visitor' | 'registered' | 'vip' | 'vvip')[]
    demographics?: {
      ageMin?: number
      ageMax?: number
      location?: string[]
      interests?: string[]
    }
    behaviorFilters?: {
      activityViewCount?: { min?: number; max?: number }
      registrationDate?: { from?: Date; to?: Date }
      lastActiveDate?: { from?: Date; to?: Date }
      eventParticipation?: boolean
      interviewCompleted?: boolean
    }
  }
  
  // Audience members (for static audiences)
  members?: {
    userId: string
    email: string
    membershipType: 'visitor' | 'registered' | 'vip' | 'vvip'
    addedDate: Date
    source: 'manual' | 'import' | 'api'
  }[]
  
  // Audience stats
  stats: {
    totalMembers: number
    activeMembers: number
    lastCalculated: Date
    membershipBreakdown: {
      visitor: number
      registered: number
      vip: number
      vvip: number
    }
  }
  
  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastSync?: Date
}

export interface MarketingAnalytics {
  analyticsId: string
  campaignId: string
  
  // Time-based metrics
  dateRange: {
    from: Date
    to: Date
  }
  
  // Performance metrics
  metrics: {
    impressions: number
    uniqueImpressions: number
    clicks: number
    uniqueClicks: number
    conversions: number
    uniqueConversions: number
    revenue: number
    
    // Calculated metrics
    clickThroughRate: number
    conversionRate: number
    costPerClick: number
    costPerConversion: number
    returnOnAdSpend: number
  }
  
  // Demographic breakdown
  demographics: {
    membershipType: {
      visitor: { impressions: number; clicks: number; conversions: number }
      registered: { impressions: number; clicks: number; conversions: number }
      vip: { impressions: number; clicks: number; conversions: number }
      vvip: { impressions: number; clicks: number; conversions: number }
    }
    ageGroups: {
      [key: string]: { impressions: number; clicks: number; conversions: number }
    }
    locations: {
      [key: string]: { impressions: number; clicks: number; conversions: number }
    }
  }
  
  // Time-based breakdown
  timeSeriesData: {
    date: Date
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }[]
  
  // A/B testing results
  abTestResults?: {
    variantId: string
    variantName: string
    impressions: number
    clicks: number
    conversions: number
    conversionRate: number
    confidence: number
    isWinner: boolean
  }[]
  
  // Top performing content
  topPerforming: {
    bestPerformingVariant?: string
    bestPerformingTime?: string
    bestPerformingAudience?: string
    recommendedOptimizations: string[]
  }
  
  // Metadata
  generatedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface MarketingEvent {
  eventId: string
  campaignId: string
  userId?: string
  sessionId?: string
  
  // Event details
  eventType: 'impression' | 'click' | 'conversion' | 'dismiss' | 'error'
  eventData: {
    ctaText?: string
    ctaAction?: string
    variantId?: string
    placement?: string
    deviceType?: 'desktop' | 'mobile' | 'tablet'
    browserType?: string
    userAgent?: string
    referrer?: string
    
    // Conversion specific
    conversionType?: 'registration' | 'upgrade' | 'booking' | 'purchase'
    conversionValue?: number
    
    // Error specific
    errorType?: string
    errorMessage?: string
  }
  
  // User context
  userContext?: {
    membershipType: 'visitor' | 'registered' | 'vip' | 'vvip'
    sessionDuration?: number
    pageViews?: number
    previousEvents?: string[]
    
    // Demographics
    age?: number
    location?: string
    interests?: string[]
  }
  
  // Timing
  timestamp: Date
  createdAt: Date
}

// Export collection types for database setup
export interface MarketingCollections {
  marketing_campaigns: MarketingCampaign
  marketing_templates: MarketingTemplate
  marketing_audiences: MarketingAudience
  marketing_analytics: MarketingAnalytics
  marketing_events: MarketingEvent
}