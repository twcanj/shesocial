// API Configuration
// Centralized API base URL configuration for all frontend services

export const API_CONFIG = {
  // Base URL from environment or default to development port
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
  
  // Admin API base URL
  ADMIN_BASE_URL: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:10000/api/admin',
  
  // Timeout configuration
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// Environment-specific configurations
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  apiUrl: import.meta.env.VITE_API_URL,
  adminApiUrl: import.meta.env.VITE_ADMIN_API_URL,
} as const

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Events
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
    PARTICIPANTS: (id: string) => `/events/${id}/participants`,
    SYNC: (timestamp: string) => `/events/sync/${timestamp}`,
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    UPDATE: (id: string) => `/bookings/${id}`,
    DELETE: (id: string) => `/bookings/${id}`,
    SYNC: (timestamp: string) => `/bookings/sync/${timestamp}`,
  },
  
  // Appointments
  APPOINTMENTS: {
    SLOTS: {
      AVAILABLE: '/appointments/slots/available',
      CREATE: '/appointments/slots',
      UPDATE: (id: string) => `/appointments/slots/${id}`,
      DELETE: (id: string) => `/appointments/slots/${id}`,
    },
    BOOKINGS: {
      LIST: '/appointments/bookings',
      CREATE: '/appointments/bookings',
      UPDATE: (id: string) => `/appointments/bookings/${id}`,
      RESCHEDULE: (id: string) => `/appointments/bookings/${id}/reschedule`,
      CANCEL: (id: string) => `/appointments/bookings/${id}/cancel`,
    },
    INTERVIEWERS: '/appointments/interviewers',
    STATS: '/appointments/stats',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    SYNC: (timestamp: string) => `/users/sync/${timestamp}`,
  },
  
  // Admin
  ADMIN: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
    },
    PERMISSIONS: {
      ATOMS: '/permissions/atoms',
      GROUPED: '/permissions/atoms/grouped',
      CREATE: '/permissions/atoms',
      VALIDATE: '/permissions/validate',
      CHECK: (permission: string) => `/permissions/check/${permission}`,
    },
    ROLES: {
      LIST: '/roles',
      CREATE: '/roles',
      UPDATE: (id: string) => `/roles/${id}`,
      CAPABILITIES: (id: string) => `/roles/${id}/capabilities`,
    },
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: (id: string) => `/users/${id}`,
    },
    AUDIT: {
      LOGS: '/audit/logs',
    },
  },
  
  // Health and diagnostics
  HEALTH: '/health',
  STATS: '/stats',
  SYNC: '/sync',
} as const

// Helper functions
export const buildUrl = (endpoint: string, baseUrl: string = API_CONFIG.BASE_URL): string => {
  return `${baseUrl}${endpoint}`
}

export const buildAdminUrl = (endpoint: string): string => {
  return `${API_CONFIG.ADMIN_BASE_URL}${endpoint}`
}

// Request configuration defaults
export const DEFAULT_REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
} as const

// Helper for authenticated requests
export const createAuthHeaders = (token: string): Record<string, string> => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
})

export default API_CONFIG