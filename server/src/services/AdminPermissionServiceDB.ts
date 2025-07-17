// Database-backed Admin Permission Service
// Handles atomic permission validation, role management, and conflict resolution using NeDB
import {
  PermissionAtom,
  AdminRole,
  AdminUser,
  PermissionAuditLog,
  DEFAULT_PERMISSION_ATOMS,
  DEFAULT_ADMIN_ROLES
} from '../models/AdminPermission'
import NeDBSetup, { type DatabaseCollections } from '../db/nedb-setup'

export class AdminPermissionServiceDB {
  private db: DatabaseCollections

  constructor() {
    this.db = NeDBSetup.getInstance().getDatabases()
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
    const existingAtom = await this.getPermissionAtom(atom.atomId)
    if (existingAtom) {
      throw new Error(`Permission atom ${atom.atomId} already exists`)
    }

    // Validate dependencies exist
    if (atom.requiresAll) {
      for (const required of atom.requiresAll) {
        const requiredAtom = await this.getPermissionAtom(required)
        if (!requiredAtom) {
          throw new Error(`Required permission ${required} does not exist`)
        }
      }
    }

    // Validate conflicts exist
    if (atom.conflictsWith) {
      for (const conflict of atom.conflictsWith) {
        const conflictAtom = await this.getPermissionAtom(conflict)
        if (!conflictAtom) {
          throw new Error(`Conflicting permission ${conflict} does not exist`)
        }
      }
    }

    // Insert to database
    const insertedAtom = await new Promise<PermissionAtom>((resolve, reject) => {
      this.db.permission_atoms.insert(newAtom, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    await this.auditLog({
      adminId: atom.createdBy,
      action: 'create_role',
      targetType: 'permission',
      targetId: atom.atomId,
      changes: { after: insertedAtom },
      success: true,
      ipAddress: '127.0.0.1', // Should come from request
      userAgent: 'system'
    })

    return insertedAtom
  }

  async getPermissionAtom(atomId: string): Promise<PermissionAtom | null> {
    return new Promise((resolve, reject) => {
      this.db.permission_atoms.findOne({ atomId }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async getAllPermissionAtoms(): Promise<PermissionAtom[]> {
    return new Promise((resolve, reject) => {
      this.db.permission_atoms.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  async getPermissionAtomsByGroup(group: string): Promise<PermissionAtom[]> {
    return new Promise((resolve, reject) => {
      this.db.permission_atoms.find({ group }, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
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

    // Insert to database
    const insertedRole = await new Promise<AdminRole>((resolve, reject) => {
      this.db.admin_roles.insert(newRole, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    await this.auditLog({
      adminId: role.createdBy,
      action: 'create_role',
      targetType: 'role',
      targetId: role.roleId,
      changes: { after: insertedRole },
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'system'
    })

    return insertedRole
  }

  async getRole(roleId: string): Promise<AdminRole | null> {
    return new Promise((resolve, reject) => {
      this.db.admin_roles.findOne({ roleId }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async updateRole(roleId: string, updates: Partial<AdminRole>, updatedBy: string): Promise<AdminRole> {
    const existingRole = await this.getRole(roleId)
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

    // Update in database
    await new Promise<void>((resolve, reject) => {
      this.db.admin_roles.update({ roleId }, updatedRole, {}, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

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
    return new Promise((resolve, reject) => {
      this.db.admin_roles.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  async getRolesByDepartment(department: AdminRole['department']): Promise<AdminRole[]> {
    return new Promise((resolve, reject) => {
      this.db.admin_roles.find({ department }, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
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

    // Get all permission atoms from database
    const allAtoms = await this.getAllPermissionAtoms()
    const atomMap = new Map(allAtoms.map(atom => [atom.atomId, atom]))

    // Check each permission exists
    for (const permission of permissions) {
      if (!atomMap.has(permission)) {
        errors.push(`Permission ${permission} does not exist`)
      }
    }

    // Check dependencies
    for (const permission of permissions) {
      const atom = atomMap.get(permission)
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
      const atom = atomMap.get(permission)
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
    const user = await this.getAdminUser(adminId)
    if (!user || user.status !== 'active') {
      return false
    }

    const role = await this.getRole(user.roleId)
    if (!role || !role.isActive) {
      return false
    }

    // Check for wildcard permission (super admin)
    if (role.permissions.includes('*') || user.customPermissions?.includes('*')) {
      return true
    }

    // Check role permissions
    const hasRolePermission = role.permissions.includes(permission)

    // Check custom permissions
    const hasCustomPermission = user.customPermissions?.includes(permission) || false

    return hasRolePermission || hasCustomPermission
  }

  async getUserPermissions(adminId: string): Promise<string[]> {
    const user = await this.getAdminUser(adminId)
    if (!user || user.status !== 'active') {
      return []
    }

    const role = await this.getRole(user.roleId)
    if (!role || !role.isActive) {
      return []
    }

    // Handle wildcard permission
    if (role.permissions.includes('*')) {
      const allAtoms = await this.getAllPermissionAtoms()
      return allAtoms.map(atom => atom.atomId)
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
    const role = await this.getRole(user.roleId)
    if (!role) {
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

    // Insert to database
    const insertedUser = await new Promise<AdminUser>((resolve, reject) => {
      this.db.admin_users.insert(newUser, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    await this.auditLog({
      adminId: user.createdBy,
      action: 'create_role',
      targetType: 'user',
      targetId: user.adminId,
      changes: { after: insertedUser },
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'system'
    })

    return insertedUser
  }

  async getAdminUser(adminId: string): Promise<AdminUser | null> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.findOne({ adminId }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | null> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.findOne({ username }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | null> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.findOne({ email }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  async updateAdminUser(adminId: string, updates: Partial<AdminUser>, updatedBy: string): Promise<AdminUser> {
    const existingUser = await this.getAdminUser(adminId)
    if (!existingUser) {
      throw new Error(`Admin user ${adminId} not found`)
    }

    // Validate role if being updated
    if (updates.roleId) {
      const role = await this.getRole(updates.roleId)
      if (!role) {
        throw new Error(`Role ${updates.roleId} does not exist`)
      }
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

    // Update in database
    await new Promise<void>((resolve, reject) => {
      this.db.admin_users.update({ adminId }, updatedUser, {}, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

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

    // Insert to database
    await new Promise<void>((resolve, reject) => {
      this.db.permission_audit_logs.insert(auditEntry, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async getAuditLogs(filters?: {
    adminId?: string
    targetType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<PermissionAuditLog[]> {
    return new Promise((resolve, reject) => {
      let query: any = {}
      
      if (filters) {
        if (filters.adminId) query.adminId = filters.adminId
        if (filters.targetType) query.targetType = filters.targetType
        if (filters.startDate || filters.endDate) {
          query.timestamp = {}
          if (filters.startDate) query.timestamp.$gte = filters.startDate
          if (filters.endDate) query.timestamp.$lte = filters.endDate
        }
      }

      this.db.permission_audit_logs.find(query).sort({ timestamp: -1 }).limit(filters?.limit || 100).exec((err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  // Utility Methods
  async getPermissionsByGroup(): Promise<Record<string, PermissionAtom[]>> {
    const allAtoms = await this.getAllPermissionAtoms()
    const groups: Record<string, PermissionAtom[]> = {}

    for (const atom of allAtoms) {
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
    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`Role ${roleId} not found`)
    }

    const allAtoms = await this.getAllPermissionAtoms()
    const atomMap = new Map(allAtoms.map(atom => [atom.atomId, atom]))

    if (role.permissions.includes('*')) {
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
      .map(p => atomMap.get(p))
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