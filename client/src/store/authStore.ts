// Authentication Store with Zustand
// Manages user authentication state, tokens, and membership permissions
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Temporary inline type to bypass caching issues
interface UserProfile {
  _id?: string
  createdAt: Date
  updatedAt: Date
  lastSync?: Date | null
  email: string
  profile: {
    name: string
    age: number
    bio: string
    interests: string[]
    location: string
    avatar?: string
    videos: any[]
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
    payments: any[]
    vouchers?: any
    permissions: {
      viewParticipants: boolean
      priorityBooking: boolean
    }
  }
}

export interface AuthState {
  // User state
  user: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (userData: RegisterData) => Promise<AuthResponse>
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
  getCurrentUser: () => Promise<void>
  changePassword: (passwordData: ChangePasswordData) => Promise<boolean>
  
  // Membership helpers
  hasPermission: (permission: keyof UserProfile['membership']['permissions']) => boolean
  getMembershipLevel: () => UserProfile['membership']['type'] | null
  canViewParticipants: () => boolean
  hasPriorityBooking: () => boolean
  isPremiumMember: () => boolean
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  profile: {
    name: string
    age?: number
    bio?: string
    interests?: string[]
    location?: string
  }
  membershipType?: UserProfile['membership']['type']
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: UserProfile
    accessToken: string
    refreshToken: string
    expiresIn: string
  }
  error?: string
  message?: string
}

const API_BASE_URL = 'http://localhost:3001/api'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Login action
      login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        set({ isLoading: true })
        
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          })

          const result = await response.json()

          if (result.success && result.data) {
            set({
              user: result.data.user,
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            })
            
            return result
          } else {
            set({ isLoading: false })
            return result
          }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: '網路連接失敗',
            message: 'Network connection failed'
          }
        }
      },

      // Register action
      register: async (userData: RegisterData): Promise<AuthResponse> => {
        set({ isLoading: true })
        
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          const result = await response.json()

          if (result.success && result.data) {
            set({
              user: result.data.user,
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            })
            
            return result
          } else {
            set({ isLoading: false })
            return result
          }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: '網路連接失敗',
            message: 'Network connection failed'
          }
        }
      },

      // Logout action
      logout: () => {
        // Call logout endpoint if we have a token
        const { accessToken } = get()
        if (accessToken) {
          fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }).catch(() => {
            // Ignore logout errors
          })
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      // Refresh access token
      refreshAccessToken: async (): Promise<boolean> => {
        const { refreshToken } = get()
        
        if (!refreshToken) {
          return false
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })

          const result = await response.json()

          if (result.success && result.data) {
            set({
              accessToken: result.data.accessToken,
            })
            return true
          } else {
            // Refresh failed, logout user
            get().logout()
            return false
          }
        } catch (error) {
          get().logout()
          return false
        }
      },

      // Get current user info
      getCurrentUser: async (): Promise<void> => {
        const { accessToken } = get()
        
        if (!accessToken) {
          return
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          })

          const result = await response.json()

          if (result.success && result.data) {
            set({
              user: result.data,
              isAuthenticated: true,
            })
          } else {
            // Token might be expired, try to refresh
            const refreshed = await get().refreshAccessToken()
            if (refreshed) {
              await get().getCurrentUser()
            }
          }
        } catch (error) {
          console.error('Failed to get current user:', error)
        }
      },

      // Change password
      changePassword: async (passwordData: ChangePasswordData): Promise<boolean> => {
        const { accessToken } = get()
        
        if (!accessToken) {
          return false
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(passwordData),
          })

          const result = await response.json()
          return result.success
        } catch (error) {
          return false
        }
      },

      // Membership helper functions
      hasPermission: (permission: keyof UserProfile['membership']['permissions']): boolean => {
        const { user } = get()
        return user?.membership.permissions[permission] || false
      },

      getMembershipLevel: (): UserProfile['membership']['type'] | null => {
        const { user } = get()
        return user?.membership.type || null
      },

      canViewParticipants: (): boolean => {
        return get().hasPermission('viewParticipants')
      },

      hasPriorityBooking: (): boolean => {
        return get().hasPermission('priorityBooking')
      },

      isPremiumMember: (): boolean => {
        const membershipType = get().getMembershipLevel()
        return membershipType === 'premium_1300' || membershipType === 'premium_2500'
      },
    }),
    {
      name: 'shesocial-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Auto-refresh token on store initialization
if (typeof window !== 'undefined') {
  const store = useAuthStore.getState()
  if (store.refreshToken && store.isAuthenticated) {
    store.getCurrentUser()
  }
}

export default useAuthStore