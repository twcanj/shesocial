// Role Management - Visual role editor with drag-and-drop permissions
import React, { useState } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'

interface AdminRole {
  roleId: string
  name: string
  department: 'executive' | 'technical' | 'operations' | 'members'
  permissions: string[]
  isCustom: boolean
  description: string
  isActive: boolean
  version: string
}

interface PermissionAtom {
  atomId: string
  group: string
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface RoleCapabilities {
  totalPermissions: number
  permissionsByGroup: Record<string, number>
  riskLevels: Record<string, number>
  canAccessGroups: string[]
}

export const RoleManagement: React.FC = () => {
  const { hasPermission } = useAdminAuth()
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [permissions, setPermissions] = useState<Record<string, PermissionAtom[]>>({})
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null)
  const [roleCapabilities, setRoleCapabilities] = useState<RoleCapabilities | null>(null)
    const [loading, setLoading] = useState(true)
  

    const { apiCall } = useAdminAuth()

  const loadRoleCapabilities = async (roleId: string) => {
    try {
            const response = await apiCall(`/roles/${roleId}/capabilities`)
      const data = await response.json()
      
      if (data.success) {
        setRoleCapabilities(data.data)
      }
    } catch (error) {
      console.error('Failed to load role capabilities:', error)
    }
  }

  const handleRoleSelect = (role: AdminRole) => {
    setSelectedRole(role)
    loadRoleCapabilities(role.roleId)
  }

  const getDepartmentColor = (department: string) => {
    const colors = {
      executive: 'from-purple-600 to-purple-800',
      technical: 'from-blue-600 to-blue-800',
      operations: 'from-green-600 to-green-800',
      members: 'from-orange-600 to-orange-800'
    }
    return colors[department as keyof typeof colors] || 'from-gray-600 to-gray-800'
  }

  const getDepartmentName = (department: string) => {
    const names = {
      executive: '執行部',
      technical: '技術部',
      operations: '營運部',
      members: '會員部'
    }
    return names[department as keyof typeof names] || department
  }

  const getRiskLevelColor = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (!hasPermission('admin:permissions')) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">存取被拒</h3>
        <p className="mt-1 text-sm text-gray-500">您沒有角色管理的存取權限</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="col-span-2 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">角色管理</h2>
          <p className="text-gray-600 mt-1">管理管理員角色和權限配置</p>
        </div>
        <button
                    onClick={() => {}}
          className="btn-luxury"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增角色
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">角色清單</h3>
          
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.roleId}
                onClick={() => handleRoleSelect(role)}
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  selectedRole?.roleId === role.roleId
                    ? 'border-luxury-gold bg-luxury-gold/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{role.name}</h4>
                      {!role.isCustom && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          系統預設
                        </span>
                      )}
                      {!role.isActive && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          停用
                        </span>
                      )}
                    </div>
                    
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getDepartmentColor(role.department)} mb-2`}>
                      {getDepartmentName(role.department)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                    
                    <div className="text-xs text-gray-500">
                      {role.permissions.includes('*') ? '所有權限' : `${role.permissions.length} 個權限`}
                    </div>
                  </div>
                  
                  <button
                                        onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="p-2 text-gray-400 hover:text-luxury-gold transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRole ? (
            <>
              {/* Role Header */}
              <div className={`bg-gradient-to-r ${getDepartmentColor(selectedRole.department)} p-6 rounded-lg text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedRole.name}</h3>
                    <p className="text-white/80 mt-1">{selectedRole.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <span>部門: {getDepartmentName(selectedRole.department)}</span>
                      <span>版本: {selectedRole.version}</span>
                      <span>狀態: {selectedRole.isActive ? '啟用' : '停用'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {selectedRole.permissions.includes('*') ? '∞' : selectedRole.permissions.length}
                    </div>
                    <div className="text-white/80 text-sm">權限數</div>
                  </div>
                </div>
              </div>

              {/* Role Capabilities */}
              {roleCapabilities && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">角色能力分析</h4>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{roleCapabilities.totalPermissions}</div>
                      <div className="text-sm text-blue-800">總權限數</div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{roleCapabilities.canAccessGroups.length}</div>
                      <div className="text-sm text-green-800">可存取群組</div>
                    </div>
                    
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {roleCapabilities.riskLevels.high || 0}
                      </div>
                      <div className="text-sm text-orange-800">高風險權限</div>
                    </div>
                    
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {roleCapabilities.riskLevels.critical || 0}
                      </div>
                      <div className="text-sm text-red-800">關鍵權限</div>
                    </div>
                  </div>

                  {/* Permission Groups Breakdown */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900">權限群組分佈</h5>
                    {Object.entries(roleCapabilities.permissionsByGroup).map(([group, count]) => (
                      <div key={group} className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700">{group.toUpperCase()}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-luxury-gold h-2 rounded-full"
                              style={{ width: `${(count / roleCapabilities.totalPermissions) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Permissions List */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">角色權限清單</h4>
                
                {selectedRole.permissions.includes('*') ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-luxury-gold mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <h5 className="text-lg font-medium text-gray-900 mb-2">超級管理員</h5>
                    <p className="text-gray-600">此角色擁有系統所有權限</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(permissions).map(([group, groupPermissions]) => {
                      const roleGroupPermissions = groupPermissions.filter(p => 
                        selectedRole.permissions.includes(p.atomId)
                      )
                      
                      if (roleGroupPermissions.length === 0) return null
                      
                      return (
                        <div key={group} className="border border-gray-200 rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
                            <span>{group.toUpperCase()}</span>
                            <span className="text-sm text-gray-500">
                              {roleGroupPermissions.length} / {groupPermissions.length}
                            </span>
                          </h6>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                            {roleGroupPermissions.map((permission) => (
                              <div
                                key={permission.atomId}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <div className="flex-1">
                                  <code className="text-xs font-mono text-gray-800">{permission.atomId}</code>
                                  <p className="text-xs text-gray-600 mt-1">{permission.name}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(permission.riskLevel)}`}>
                                  {permission.riskLevel}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">選擇角色</h3>
              <p className="mt-1 text-sm text-gray-500">從左側選擇角色以查看詳細資訊</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}