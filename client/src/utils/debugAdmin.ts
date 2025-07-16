// Debug utilities for admin authentication issues

export const clearAdminStorage = () => {
  localStorage.removeItem('admin-auth-storage')
  sessionStorage.removeItem('admin-auth-storage')
  console.log('Admin storage cleared')
}

export const inspectAdminStorage = () => {
  const localStorage_data = localStorage.getItem('admin-auth-storage')
  const sessionStorage_data = sessionStorage.getItem('admin-auth-storage')
  
  console.log('LocalStorage admin data:', localStorage_data ? JSON.parse(localStorage_data) : null)
  console.log('SessionStorage admin data:', sessionStorage_data ? JSON.parse(sessionStorage_data) : null)
}

export const createMockAdmin = () => {
  const mockAdmin = {
    state: {
      admin: {
        adminId: 'mock-admin-123',
        username: 'admin',
        email: 'admin@infinitymatch.tw',
        roleId: 'super-admin',
        department: 'executive' as const,
        permissions: ['*'], // Super admin permissions
        profile: {
          realName: '系統管理員',
          employeeId: 'EMP001',
          lastLogin: new Date()
        },
        status: 'active' as const
      },
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      isAuthenticated: true,
      loading: false
    },
    version: 0
  }
  
  localStorage.setItem('admin-auth-storage', JSON.stringify(mockAdmin))
  console.log('Mock admin created in localStorage')
  return mockAdmin
}

// Make these available globally for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).debugAdmin = {
    clearAdminStorage,
    inspectAdminStorage,
    createMockAdmin
  }
}
