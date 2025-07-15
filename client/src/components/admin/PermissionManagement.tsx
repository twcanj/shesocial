// Permission Management - Manage atomic permissions and validation
import React, { useState, useEffect } from 'react'
import { useAdminAuth, adminAPI } from '../../hooks/useAdminAuth'

interface PermissionAtom {
  atomId: string
  group: string
  action: string
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  conflictsWith?: string[]
  requiresAll?: string[]
  version: string
}

interface GroupedPermissions {
  [group: string]: PermissionAtom[]
}

export const PermissionManagement: React.FC = () => {
  const { hasPermission } = useAdminAuth()
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({})
  const [loading, setLoading] = useState(true)
  const [activeGroup, setActiveGroup] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [testPermissions, setTestPermissions] = useState<string[]>([])

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getGroupedPermissions()
      const data = await response.json()
      
      if (data.success) {
        setGroupedPermissions(data.data)
        const groups = Object.keys(data.data)
        if (groups.length > 0 && !activeGroup) {
          setActiveGroup(groups[0])
        }
      }
    } catch (error) {
      console.error('Failed to load permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const validatePermissions = async (permissions: string[]) => {
    try {
      const response = await adminAPI.validatePermissions(permissions)
      const data = await response.json()
      
      if (data.success) {
        setValidationResult(data.data)
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
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

  const getRiskLevelIcon = (level: string) => {
    const icons = {
      low: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      medium: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      high: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      critical: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
        </svg>
      )
    }
    return icons[level as keyof typeof icons] || icons.low
  }

  if (!hasPermission('admin:permissions')) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-luxury-platinum/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-luxury-gold">存取被拒</h3>
        <p className="mt-1 text-sm text-luxury-platinum/60">您沒有權限管理的存取權限</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-luxury-platinum/20 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-luxury-platinum/20 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-luxury-platinum/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const groups = Object.keys(groupedPermissions)
  const activePermissions = groupedPermissions[activeGroup] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-luxury-gold">權限管理</h2>
          <p className="text-luxury-platinum/80 mt-1">管理系統權限原子和驗證規則</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="luxury-button"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增權限
        </button>
      </div>

      {/* Permission Groups Tabs */}
      <div className="border-b border-luxury-gold/20">
        <nav className="-mb-px flex space-x-8">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeGroup === group
                  ? 'border-luxury-gold text-luxury-gold'
                  : 'border-transparent text-luxury-platinum/60 hover:text-luxury-gold hover:border-luxury-gold/30'
              }`}
            >
              {group.toUpperCase()}
              <span className="ml-2 bg-luxury-gold/20 text-luxury-gold py-1 px-2 rounded-full text-xs">
                {groupedPermissions[group]?.length || 0}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-luxury-gold">
            {activeGroup.toUpperCase()} 權限清單
          </h3>
          
          <div className="space-y-3">
            {activePermissions.map((permission) => (
              <div
                key={permission.atomId}
                className="luxury-card-outline p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <code className="text-sm font-mono bg-luxury-gold/20 text-luxury-gold px-2 py-1 rounded">
                        {permission.atomId}
                      </code>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(permission.riskLevel)}`}>
                        {getRiskLevelIcon(permission.riskLevel)}
                        <span>{permission.riskLevel}</span>
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-luxury-gold mb-1">{permission.name}</h4>
                    <p className="text-sm text-luxury-platinum/80 mb-3">{permission.description}</p>
                    
                    {/* Dependencies and Conflicts */}
                    {(permission.requiresAll || permission.conflictsWith) && (
                      <div className="space-y-2">
                        {permission.requiresAll && (
                          <div className="text-xs">
                            <span className="text-luxury-platinum/60">依賴:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {permission.requiresAll.map((dep) => (
                                <code key={dep} className="bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded text-xs">
                                  {dep}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {permission.conflictsWith && (
                          <div className="text-xs">
                            <span className="text-luxury-platinum/60">衝突:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {permission.conflictsWith.map((conflict) => (
                                <code key={conflict} className="bg-red-500/20 text-red-400 px-1 py-0.5 rounded text-xs">
                                  {conflict}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!testPermissions.includes(permission.atomId)) {
                        setTestPermissions([...testPermissions, permission.atomId])
                      }
                    }}
                    className="ml-4 p-2 text-luxury-platinum/40 hover:text-luxury-gold transition-colors"
                    title="加入測試清單"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Validator */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-luxury-gold">權限驗證器</h3>
          
          <div className="luxury-card-selected p-4">
            <h4 className="font-medium text-luxury-midnight-black mb-3">測試權限組合</h4>
            
            {/* Selected Permissions */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {testPermissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center space-x-1 bg-luxury-gold/10 text-luxury-gold px-2 py-1 rounded-full text-sm"
                  >
                    <span>{permission}</span>
                    <button
                      onClick={() => setTestPermissions(testPermissions.filter(p => p !== permission))}
                      className="text-luxury-gold hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => validatePermissions(testPermissions)}
                  disabled={testPermissions.length === 0}
                  className="luxury-button-outline"
                >
                  驗證權限
                </button>
                <button
                  onClick={() => {
                    setTestPermissions([])
                    setValidationResult(null)
                  }}
                  className="btn-luxury-outline"
                >
                  清除
                </button>
              </div>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div className="border-t border-gray-200 pt-4">
                <h5 className="font-medium text-gray-900 mb-3">驗證結果</h5>
                
                <div className={`p-3 rounded-lg ${
                  validationResult.isValid 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {validationResult.isValid ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className={`font-medium ${
                      validationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResult.isValid ? '權限組合有效' : '權限組合無效'}
                    </span>
                  </div>
                  
                  {!validationResult.isValid && validationResult.errors && (
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationResult.errors.map((error: string, index: number) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span className="text-red-500">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}