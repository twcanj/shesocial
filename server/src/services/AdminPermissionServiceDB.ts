import { AdminUser, AdminRole, PermissionAtom } from '../models/AdminPermission'
import NeDBSetup from '../db/nedb-setup'
import bcrypt from 'bcrypt'

export class AdminPermissionServiceDB {
  private db: any

  constructor() {
    const dbSetup = NeDBSetup.getInstance()
    this.db = dbSetup.getDatabases()
  }

  // Permission Atoms Management
  async createPermissionAtom(atom: Omit<PermissionAtom, '_id' | 'createdAt' | 'updatedAt'>): Promise<PermissionAtom> {
    const newAtom: PermissionAtom = {
      ...atom,
      _id: atom.atomId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      this.db.permission_atoms.insert(newAtom, (err: any, doc: PermissionAtom) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async getPermissionAtom(atomId: string): Promise<PermissionAtom | null> {
    return new Promise((resolve, reject) => {
      this.db.permission_atoms.findOne({ atomId }, (err: any, doc: PermissionAtom) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async getAllPermissionAtoms(): Promise<PermissionAtom[]> {
    return new Promise((resolve, reject) => {
      this.db.permission_atoms.find({}, (err: any, docs: PermissionAtom[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  async getPermissionAtomsByGroup(group: string): Promise<PermissionAtom[]> {
    return new Promise((resolve, reject) => {
      this.db.permission_atoms.find({ group }, (err: any, docs: PermissionAtom[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  async updatePermissionAtom(atomId: string, updates: Partial<PermissionAtom>): Promise<PermissionAtom> {
    const atom = await this.getPermissionAtom(atomId)
    if (!atom) {
      throw new Error(`Permission atom ${atomId} not found`)
    }

    const updatedAtom = {
      ...atom,
      ...updates,
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      this.db.permission_atoms.update(
        { atomId },
        { $set: updatedAtom },
        {},
        (err: any) => {
          if (err) reject(err)
          else resolve(updatedAtom)
        }
      )
    })
  }

  async deletePermissionAtom(atomId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.permission_atoms.remove({ atomId }, {}, (err: any, numRemoved: number) => {
        if (err) reject(err)
        else resolve(numRemoved > 0)
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
      this.db.admin_roles.insert(newRole, (err: any, doc: AdminRole) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    return insertedRole
  }

  async getRole(roleId: string): Promise<AdminRole | null> {
    return new Promise((resolve, reject) => {
      this.db.admin_roles.findOne({ roleId }, (err: any, doc: AdminRole) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async updateRole(roleId: string, updates: Partial<AdminRole>): Promise<AdminRole> {
    const role = await this.getRole(roleId)
    if (!role) {
      throw new Error(`Role ${roleId} not found`)
    }

    // Validate permissions if they're being updated
    if (updates.permissions) {
      const validationResult = await this.validatePermissions(updates.permissions)
      if (!validationResult.isValid) {
        throw new Error(`Invalid permissions: ${validationResult.errors.join(', ')}`)
      }
    }

    const updatedRole = {
      ...role,
      ...updates,
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      this.db.admin_roles.update(
        { roleId },
        { $set: updatedRole },
        {},
        (err: any) => {
          if (err) reject(err)
          else resolve(updatedRole)
        }
      )
    })
  }

  async deleteRole(roleId: string): Promise<boolean> {
    // Check if any users are using this role
    const usersWithRole = await new Promise<AdminUser[]>((resolve, reject) => {
      this.db.admin_users.find({ roleId }, (err: any, docs: AdminUser[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    if (usersWithRole.length > 0) {
      throw new Error(`Cannot delete role ${roleId} because it is assigned to ${usersWithRole.length} users`)
    }

    return new Promise((resolve, reject) => {
      this.db.admin_roles.remove({ roleId }, {}, (err: any, numRemoved: number) => {
        if (err) reject(err)
        else resolve(numRemoved > 0)
      })
    })
  }

  async getAllRoles(): Promise<AdminRole[]> {
    return new Promise((resolve, reject) => {
      this.db.admin_roles.find({}, (err: any, docs: AdminRole[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  async getRolesByDepartment(department: AdminRole['department']): Promise<AdminRole[]> {
    return new Promise((resolve, reject) => {
      this.db.admin_roles.find({ department }, (err: any, docs: AdminRole[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  // Permission Validation
  async validatePermissions(permissions: string[]): Promise<{isValid: boolean, errors: string[]}> {
    const errors: string[] = []
    const permissionSet = new Set(permissions)

    // Check if all permissions exist
    for (const permission of permissions) {
      // Skip wildcard permission
      if (permission === '*') continue

      const atom = await this.getPermissionAtom(permission)
      if (!atom) {
        errors.push(`Permission ${permission} does not exist`)
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

    // 從權限字符串中提取功能名稱（例如 'events:view' -> 'events'）
    const functionName = permission.split(':')[0]

    // 檢查直接權限
    if (user.permissions) {
      // 超級管理員權限檢查
      if (user.permissions.includes('*')) return true
      
      // 功能級別權限檢查 - 如果有該功能的任何權限，則授予該功能的所有操作權限
      if (user.permissions.includes(functionName) || 
          user.permissions.some(p => p.startsWith(functionName + ':'))) {
        return true
      }
    }

    // 檢查角色權限
    const role = await this.getRole(user.roleId)
    if (!role || !role.isActive) {
      return false
    }

    // 超級管理員角色檢查
    if (role.permissions.includes('*')) {
      return true
    }
    
    // 功能級別角色權限檢查
    if (role.permissions.includes(functionName) || 
        role.permissions.some(p => p.startsWith(functionName + ':'))) {
      return true
    }

    // 檢查自定義權限
    if (user.customPermissions) {
      if (user.customPermissions.includes('*') || 
          user.customPermissions.includes(functionName) || 
          user.customPermissions.some(p => p.startsWith(functionName + ':'))) {
        return true
      }
    }

    return false
  }

  // Admin User Management
  async getAdminUser(adminId: string): Promise<AdminUser | null> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.findOne({ adminId }, (err: any, doc: AdminUser) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | null> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.findOne({ username }, (err: any, doc: AdminUser) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | null> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.findOne({ email }, (err: any, doc: AdminUser) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async createAdminUser(user: Omit<AdminUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    // Check if username or email already exists
    const existingUsername = await this.getAdminUserByUsername(user.username)
    const existingEmail = await this.getAdminUserByEmail(user.email)

    if (existingUsername) {
      throw new Error(`Username ${user.username} already exists`)
    }

    if (existingEmail) {
      throw new Error(`Email ${user.email} already exists`)
    }

    // Validate role exists
    const role = await this.getRole(user.roleId)
    if (!role) {
      throw new Error(`Role ${user.roleId} does not exist`)
    }

    const newUser: AdminUser = {
      ...user,
      _id: user.adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      this.db.admin_users.insert(newUser, (err: any, doc: AdminUser) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  async updateAdminUser(adminId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const existingUser = await this.getAdminUser(adminId)
    if (!existingUser) {
      throw new Error(`Admin user ${adminId} not found`)
    }

    // Check if username or email is being updated and already exists
    if (updates.username && updates.username !== existingUser.username) {
      const existingUsername = await this.getAdminUserByUsername(updates.username)
      if (existingUsername) {
        throw new Error(`Username ${updates.username} already exists`)
      }
    }

    if (updates.email && updates.email !== existingUser.email) {
      const existingEmail = await this.getAdminUserByEmail(updates.email)
      if (existingEmail) {
        throw new Error(`Email ${updates.email} already exists`)
      }
    }

    // Validate role if it's being updated
    if (updates.roleId && updates.roleId !== existingUser.roleId) {
      const role = await this.getRole(updates.roleId)
      if (!role) {
        throw new Error(`Role ${updates.roleId} does not exist`)
      }
    }

    const updatedUser = {
      ...existingUser,
      ...updates,
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      this.db.admin_users.update(
        { adminId },
        { $set: updatedUser },
        {},
        (err: any) => {
          if (err) reject(err)
          else resolve(updatedUser)
        }
      )
    })
  }

  async deleteAdminUser(adminId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.remove({ adminId }, {}, (err: any, numRemoved: number) => {
        if (err) reject(err)
        else resolve(numRemoved > 0)
      })
    })
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.find({}, (err: any, docs: AdminUser[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  async getAdminUsersByRole(roleId: string): Promise<AdminUser[]> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.find({ roleId }, (err: any, docs: AdminUser[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  async getAdminUsersByDepartment(department: string): Promise<AdminUser[]> {
    return new Promise((resolve, reject) => {
      this.db.admin_users.find({ 'profile.department': department }, (err: any, docs: AdminUser[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }
}
