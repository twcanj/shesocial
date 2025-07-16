// Admin Authentication Hook
// Manages admin authentication state separate from user authentication
import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_CONFIG } from '../config/api'

interface AdminProfile {
  adminId: string
  username: string
  email: string
  roleId: string
  department: 'executive' | 'technical' | 'operations' | 'members'
  permissions: string[]
  profile: {
    realName: string
    employeeId: string
    lastLogin: Date
  }
  status: 'active' | 'suspended' | 'inactive'
}

interface AdminAuthState {
  admin: AdminProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  
  // Actions
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
  hasPermission: (permission: string) => boolean
}

const API_BASE_URL = API_CONFIG.ADMIN_BASE_URL

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,

      login: async (username: string, password: string) => {
        set({ loading: true })
        
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || '登入失敗')
          }

          if (data.success) {
            // Ensure permissions is always an array
            const adminData = {
              ...data.data.admin,
              permissions: data.data.admin.permissions || []
            }
            
            set({
              admin: adminData,
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              isAuthenticated: true,
              loading: false
            })
          } else {
            throw new Error(data.error || '登入失敗')
          }
        } catch (error: any) {
          set({ loading: false })
          throw error
        }
      },

      logout: () => {
        // Call logout endpoint to invalidate token on server
        const { accessToken } = get()
        if (accessToken) {
          fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }).catch(() => {
            // Ignore errors on logout
          })
        }

        set({
          admin: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        })
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false

        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
          })

          const data = await response.json()

          if (response.ok && data.success) {
            set({
              accessToken: data.data.accessToken,
              isAuthenticated: true
            })
            return true
          } else {
            // Refresh failed, logout
            get().logout()
            return false
          }
        } catch (error) {
          get().logout()
          return false
        }
      },

      hasPermission: (permission: string) => {
        const { admin } = get()
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('hasPermission called with:', permission)
          console.log('admin object:', admin)
          console.log('admin.permissions:', admin?.permissions)
        }
        
        if (!admin || admin.status !== 'active') return false
        
        // Check if permissions array exists
        if (!admin.permissions || !Array.isArray(admin.permissions)) {
          console.warn('Admin permissions is not an array:', admin.permissions)
          return false
        }
        
        // Super admin has all permissions
        if (admin.permissions.includes('*')) return true
        
        return admin.permissions.includes(permission)
      }
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        admin: state.admin,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure loading is false after hydration
        if (state) {
          state.loading = false
          
          // Ensure admin.permissions is always an array
          if (state.admin && (!state.admin.permissions || !Array.isArray(state.admin.permissions))) {
            console.warn('Fixing admin.permissions from localStorage:', state.admin.permissions)
            state.admin.permissions = []
          }
        }
      }
    }
  )
)

// Main hook for components
export const useAdminAuth = () => {
  const {
    admin,
    accessToken,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshAccessToken,
    hasPermission
  } = useAdminAuthStore()

  // Auto-refresh token on mount and periodically
  useEffect(() => {
    if (accessToken && !loading) {
      // Try to refresh token on mount
      refreshAccessToken()

      // Set up periodic token refresh (every 7 hours)
      const interval = setInterval(() => {
        refreshAccessToken()
      }, 7 * 60 * 60 * 1000) // 7 hours

      return () => clearInterval(interval)
    }
  }, [accessToken, loading, refreshAccessToken])

  // API helper for authenticated requests
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = useAdminAuthStore.getState().accessToken
    
    if (!token) {
      throw new Error('未授權的請求')
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    // Handle token expiry
    if (response.status === 401) {
      const refreshSuccess = await refreshAccessToken()
      if (refreshSuccess) {
        // Retry with new token
        const newToken = useAdminAuthStore.getState().accessToken
        return fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        })
      } else {
        logout()
        throw new Error('認證已過期，請重新登入')
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response
  }

  return {
    admin,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    apiCall
  }
}

// Admin API service helpers
export const adminAPI = {
  // Permission atoms
  getPermissionAtoms: () => 
    useAdminAuth().apiCall('/permissions/atoms'),
  
  getGroupedPermissions: () => 
    useAdminAuth().apiCall('/permissions/atoms/grouped'),
  
  createPermissionAtom: (atomData: any) => 
    useAdminAuth().apiCall('/permissions/atoms', {
      method: 'POST',
      body: JSON.stringify(atomData)
    }),

  // Roles
  getRoles: (department?: string) => 
    useAdminAuth().apiCall(`/roles${department ? `?department=${department}` : ''}`),
  
  createRole: (roleData: any) => 
    useAdminAuth().apiCall('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData)
    }),
  
  updateRole: (roleId: string, updates: any) => 
    useAdminAuth().apiCall(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  
  getRoleCapabilities: (roleId: string) => 
    useAdminAuth().apiCall(`/roles/${roleId}/capabilities`),

  // Permission validation
  validatePermissions: (permissions: string[]) => 
    useAdminAuth().apiCall('/permissions/validate', {
      method: 'POST',
      body: JSON.stringify({ permissions })
    }),

  // Users
  createAdminUser: (userData: any) => 
    useAdminAuth().apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  
  updateAdminUser: (adminId: string, updates: any) => 
    useAdminAuth().apiCall(`/users/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  // Audit logs
  getAuditLogs: (filters?: any) => {
    const params = new URLSearchParams(filters || {})
    return useAdminAuth().apiCall(`/audit/logs?${params}`)
  }
}