// Admin Permission Service
// Handles atomic permission validation, role management, and conflict resolution
import { 
  PermissionAtom, 
  AdminRole, 
  AdminUser, 
  PermissionAuditLog,
  DEFAULT_PERMISSION_ATOMS,
  DEFAULT_ADMIN_ROLES
} from '../models/AdminPermission'

export class AdminPermissionService {
  private permissionAtoms: Map<string, PermissionAtom> = new Map()
  private adminRoles: Map<string, AdminRole> = new Map()
  private adminUsers: Map<string, AdminUser> = new Map()
  private auditLogs: PermissionAuditLog[] = []

  constructor() {
    this.initializeDefaultPermissions()
  }

  // Initialize default permissions and roles
  private initializeDefaultPermissions() {
    // Load default permission atoms
    DEFAULT_PERMISSION_ATOMS.forEach(atom => {
      const fullAtom: PermissionAtom = {
        ...atom,
        _id: atom.atomId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
      this.permissionAtoms.set(atom.atomId, fullAtom)
    })

    // Load default admin roles
    DEFAULT_ADMIN_ROLES.forEach(role => {
      const fullRole: AdminRole = {
        ...role,
        _id: role.roleId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system'
      }
      this.adminRoles.set(role.roleId, fullRole)
    })
  }

  // Permission Atom Management
  async createPermissionAtom(atom: Omit<PermissionAtom, '_id' | 'createdAt' | 'updatedAt'>): Promise<PermissionAtom> {
    const newAtom: PermissionAtom = {
      ...atom,
      _id: atom.atomId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Validate atom doesn't already exist
    if (this.permissionAtoms.has(atom.atomId)) {
      throw new Error(`Permission atom ${atom.atomId} already exists`)
    }

    // Validate dependencies exist
    if (atom.requiresAll) {
      for (const required of atom.requiresAll) {
        if (!this.permissionAtoms.has(required)) {
          throw new Error(`Required permission ${required} does not exist`)
        }
      }
    }

    // Validate conflicts exist
    if (atom.conflictsWith) {
      for (const conflict of atom.conflictsWith) {
        if (!this.permissionAtoms.has(conflict)) {
          throw new Error(`Conflicting permission ${conflict} does not exist`)
        }
      }
    }

    this.permissionAtoms.set(atom.atomId, newAtom)
    
    await this.auditLog({
      adminId: atom.createdBy,
      action: 'create_role',
      targetType: 'permission',
      targetId: atom.atomId,
      changes: { after: newAtom },
      success: true,
      ipAddress: '127.0.0.1', // Should come from request
      userAgent: 'system'
    })

    return newAtom
  }

  async getAllPermissionAtoms(): Promise<PermissionAtom[]> {
    return Array.from(this.permissionAtoms.values())
  }

  async getPermissionAtomsByGroup(group: string): Promise<PermissionAtom[]> {
    return Array.from(this.permissionAtoms.values()).filter(atom => atom.group === group)
  }

  // Role Management
  async createRole(role: Omit<AdminRole, '_id' | 'createdAt' | 'updatedAt'>): Promise<AdminRole> {
    // Validate permissions exist and don't conflict
    const validationResult = await this.validatePermissions(role.permissions)
    if (!validationResult.isValid) {
      throw new Error(`Invalid permissions: ${validationResult.errors.join(', ')}`)
    }

    const newRole: AdminRole = {
      ...role,
      _id: role.roleId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.adminRoles.set(role.roleId, newRole)
    
    await this.auditLog({
      adminId: role.createdBy,
      action: 'create_role',
      targetType: 'role',
      targetId: role.roleId,
      changes: { after: newRole },
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'system'
    })

    return newRole
  }

  async updateRole(roleId: string, updates: Partial<AdminRole>, updatedBy: string): Promise<AdminRole> {
    const existingRole = this.adminRoles.get(roleId)
    if (!existingRole) {
      throw new Error(`Role ${roleId} not found`)
    }

    // Validate new permissions if being updated
    if (updates.permissions) {
      const validationResult = await this.validatePermissions(updates.permissions)
      if (!validationResult.isValid) {
        throw new Error(`Invalid permissions: ${validationResult.errors.join(', ')}`)
      }
    }

    const updatedRole: AdminRole = {
      ...existingRole,
      ...updates,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    }

    this.adminRoles.set(roleId, updatedRole)
    
    await this.auditLog({
      adminId: updatedBy,
      action: 'modify',
      targetType: 'role',
      targetId: roleId,
      changes: { 
        before: existingRole, 
        after: updatedRole,
        permissionsAdded: updates.permissions?.filter(p => !existingRole.permissions.includes(p)),
        permissionsRemoved: existingRole.permissions.filter(p => !updates.permissions?.includes(p))
      },
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'system'
    })

    return updatedRole
  }

  async getAllRoles(): Promise<AdminRole[]> {
    return Array.from(this.adminRoles.values())
  }

  async getRolesByDepartment(department: AdminRole['department']): Promise<AdminRole[]> {
    return Array.from(this.adminRoles.values()).filter(role => role.department === department)
  }

  // Permission Validation
  async validatePermissions(permissions: string[]): Promise<{isValid: boolean, errors: string[]}> {
    const errors: string[] = []
    const permissionSet = new Set(permissions)

    // Handle wildcard permission (super admin)
    if (permissions.includes('*')) {
      if (permissions.length > 1) {
        errors.push('Wildcard permission (*) cannot be combined with other permissions')
      }
      return { isValid: errors.length === 0, errors }
    }

    // Check each permission exists
    for (const permission of permissions) {
      if (!this.permissionAtoms.has(permission)) {
        errors.push(`Permission ${permission} does not exist`)
      }
    }

    // Check dependencies
    for (const permission of permissions) {
      const atom = this.permissionAtoms.get(permission)
      if (atom?.requiresAll) {
        for (const required of atom.requiresAll) {
          if (!permissionSet.has(required)) {
            errors.push(`Permission ${permission} requires ${required}`)
          }
        }
      }
    }

    // Check conflicts
    for (const permission of permissions) {
      const atom = this.permissionAtoms.get(permission)
      if (atom?.conflictsWith) {
        for (const conflict of atom.conflictsWith) {
          if (permissionSet.has(conflict)) {
            errors.push(`Permission ${permission} conflicts with ${conflict}`)
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  // User Permission Checking
  async userHasPermission(adminId: string, permission: string): Promise<boolean> {
    const user = this.adminUsers.get(adminId)
    if (!user || user.status !== 'active') {
      return false
    }

    const role = this.adminRoles.get(user.roleId)
    if (!role || !role.isActive) {
      return false
    }

    // Check for wildcard permission (super admin)
    if (role.permissions.includes('*')) {
      return true
    }

    // Check role permissions
    const hasRolePermission = role.permissions.includes(permission)
    
    // Check custom permissions
    const hasCustomPermission = user.customPermissions?.includes(permission) || false

    return hasRolePermission || hasCustomPermission
  }

  async getUserPermissions(adminId: string): Promise<string[]> {
    const user = this.adminUsers.get(adminId)
    if (!user || user.status !== 'active') {
      return []
    }

    const role = this.adminRoles.get(user.roleId)
    if (!role || !role.isActive) {
      return []
    }

    // Handle wildcard permission
    if (role.permissions.includes('*')) {
      return Array.from(this.permissionAtoms.keys())
    }

    // Combine role and custom permissions
    const allPermissions = new Set([
      ...role.permissions,
      ...(user.customPermissions || [])
    ])

    return Array.from(allPermissions)
  }

  // Admin User Management
  async createAdminUser(user: Omit<AdminUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    // Validate role exists
    if (!this.adminRoles.has(user.roleId)) {
      throw new Error(`Role ${user.roleId} does not exist`)
    }

    // Validate custom permissions if provided
    if (user.customPermissions) {
      const validationResult = await this.validatePermissions(user.customPermissions)
      if (!validationResult.isValid) {
        throw new Error(`Invalid custom permissions: ${validationResult.errors.join(', ')}`)
      }
    }

    const newUser: AdminUser = {
      ...user,
      _id: user.adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.adminUsers.set(user.adminId, newUser)
    
    await this.auditLog({
      adminId: user.createdBy,
      action: 'create_role',
      targetType: 'user',
      targetId: user.adminId,
      changes: { after: newUser },
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'system'
    })

    return newUser
  }

  async updateAdminUser(adminId: string, updates: Partial<AdminUser>, updatedBy: string): Promise<AdminUser> {
    const existingUser = this.adminUsers.get(adminId)
    if (!existingUser) {
      throw new Error(`Admin user ${adminId} not found`)
    }

    // Validate role if being updated
    if (updates.roleId && !this.adminRoles.has(updates.roleId)) {
      throw new Error(`Role ${updates.roleId} does not exist`)
    }

    // Validate custom permissions if being updated
    if (updates.customPermissions) {
      const validationResult = await this.validatePermissions(updates.customPermissions)
      if (!validationResult.isValid) {
        throw new Error(`Invalid custom permissions: ${validationResult.errors.join(', ')}`)
      }
    }

    const updatedUser: AdminUser = {
      ...existingUser,
      ...updates,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    }

    this.adminUsers.set(adminId, updatedUser)
    
    await this.auditLog({
      adminId: updatedBy,
      action: 'modify',
      targetType: 'user',
      targetId: adminId,
      changes: { 
        before: existingUser, 
        after: updatedUser,
        permissionsAdded: updates.customPermissions?.filter(p => !existingUser.customPermissions?.includes(p)),
        permissionsRemoved: existingUser.customPermissions?.filter(p => !updates.customPermissions?.includes(p))
      },
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'system'
    })

    return updatedUser
  }

  // Audit Logging
  private async auditLog(log: Omit<PermissionAuditLog, '_id' | 'timestamp'>): Promise<void> {
    const auditEntry: PermissionAuditLog = {
      _id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...log
    }
    
    this.auditLogs.push(auditEntry)
    
    // Keep only last 10000 audit logs in memory
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000)
    }
  }

  async getAuditLogs(filters?: {
    adminId?: string
    targetType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<PermissionAuditLog[]> {
    let logs = [...this.auditLogs]

    if (filters) {
      if (filters.adminId) {
        logs = logs.filter(log => log.adminId === filters.adminId)
      }
      if (filters.targetType) {
        logs = logs.filter(log => log.targetType === filters.targetType)
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!)
      }
      if (filters.limit) {
        logs = logs.slice(0, filters.limit)
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Utility Methods
  async getPermissionsByGroup(): Promise<Record<string, PermissionAtom[]>> {
    const groups: Record<string, PermissionAtom[]> = {}
    
    for (const atom of this.permissionAtoms.values()) {
      if (!groups[atom.group]) {
        groups[atom.group] = []
      }
      groups[atom.group].push(atom)
    }

    return groups
  }

  async getRoleCapabilities(roleId: string): Promise<{
    totalPermissions: number
    permissionsByGroup: Record<string, number>
    riskLevels: Record<string, number>
    canAccessGroups: string[]
  }> {
    const role = this.adminRoles.get(roleId)
    if (!role) {
      throw new Error(`Role ${roleId} not found`)
    }

    if (role.permissions.includes('*')) {
      const allAtoms = Array.from(this.permissionAtoms.values())
      const groupCounts: Record<string, number> = {}
      const riskCounts: Record<string, number> = {}
      
      allAtoms.forEach(atom => {
        groupCounts[atom.group] = (groupCounts[atom.group] || 0) + 1
        riskCounts[atom.riskLevel] = (riskCounts[atom.riskLevel] || 0) + 1
      })

      return {
        totalPermissions: allAtoms.length,
        permissionsByGroup: groupCounts,
        riskLevels: riskCounts,
        canAccessGroups: Object.keys(groupCounts)
      }
    }

    const atoms = role.permissions
      .map(p => this.permissionAtoms.get(p))
      .filter(Boolean) as PermissionAtom[]

    const groupCounts: Record<string, number> = {}
    const riskCounts: Record<string, number> = {}
    const groups = new Set<string>()

    atoms.forEach(atom => {
      groupCounts[atom.group] = (groupCounts[atom.group] || 0) + 1
      riskCounts[atom.riskLevel] = (riskCounts[atom.riskLevel] || 0) + 1
      groups.add(atom.group)
    })

    return {
      totalPermissions: atoms.length,
      permissionsByGroup: groupCounts,
      riskLevels: riskCounts,
      canAccessGroups: Array.from(groups)
    }
  }
}