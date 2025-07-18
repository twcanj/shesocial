// Admin User Initialization Service
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import NeDBSetup from '../db/nedb-setup'

export class AdminInitService {
  private db: any

  constructor() {
    const dbSetup = NeDBSetup.getInstance()
    this.db = dbSetup.getDatabases()
  }

  async initializeDefaultAdmin(): Promise<void> {
    try {
      // Check if admin user already exists
      const existingAdmin = await new Promise<any>((resolve, reject) => {
        this.db.admin_users.findOne({ email: 'admin@infinitymatch.com' }, (err: any, doc: any) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })

      if (existingAdmin) {
        console.log('✅ Default admin user already exists')
        return
      }

      // Create admin role first
      const roleId = uuidv4()
      
      // Create two top-level admin users
      const adminUsers = [
        {
          adminId: uuidv4(),
          username: 'admin',
          email: 'admin@infinitymatch.com',
          passwordHash: await bcrypt.hash('admin123', 10),
          roleId,
          department: 'admin',
          status: 'active',
          permissions: ['*'], // Super admin - all permissions without testing
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
          metadata: {
            createdBy: 'system',
            isSystemAdmin: true,
            isSuperAdmin: true
          }
        },
        {
          adminId: uuidv4(),
          username: 'superadmin',
          email: 'superadmin@infinitymatch.com',
          passwordHash: await bcrypt.hash('super123', 10),
          roleId,
          department: 'admin',
          status: 'active',
          permissions: ['*'], // Super admin - all permissions without testing
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
          metadata: {
            createdBy: 'system',
            isSystemAdmin: true,
            isSuperAdmin: true
          }
        }
      ]

      // Insert both admin users
      for (const adminUser of adminUsers) {
        await new Promise<void>((resolve, reject) => {
          this.db.admin_users.insert(adminUser, (err: any) => {
            if (err) reject(err)
            else resolve()
          })
        })
      }

      // Create default admin role
      const adminRole = {
        roleId,
        name: 'System Admin',
        department: 'admin',
        permissions: ['*'], // Super admin role - all permissions without testing
        isActive: true,
        isCustom: false,
        description: 'Top-level system administrator with unrestricted access to all modules and functions',
        version: '1.0',
        maxUsers: 2, // Only 2 top-level admins
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
        metadata: {
          isSystemRole: true,
          isSuperAdmin: true
        }
      }

      await new Promise<void>((resolve, reject) => {
        this.db.admin_roles.insert(adminRole, (err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // Create default permission atoms
      await this.initializePermissionAtoms()

      console.log('✅ Two top-level admin users created successfully')
      console.log('   Admin 1: admin@infinitymatch.com / admin123')
      console.log('   Admin 2: superadmin@infinitymatch.com / super123')
      console.log('   Role: System Admin (Full Access - No Permission Testing)')
      console.log('   Note: These are super admins with unrestricted access to all functions')

    } catch (error) {
      console.error('❌ Failed to initialize default admin:', error)
      throw error
    }
  }

  private async initializePermissionAtoms(): Promise<void> {
    try {
      // Check if permission atoms already exist
      const existingAtoms = await new Promise<any[]>((resolve, reject) => {
        this.db.permission_atoms.find({}, (err: any, docs: any[]) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })

      if (existingAtoms.length > 0) {
        console.log('✅ Permission atoms already exist')
        return
      }

      // Define function module-based permission atoms
      const defaultAtoms = [
        // System Module - Dashboard and system overview
        {
          atomId: 'system',
          name: 'System Module',
          description: 'Access to system dashboard, statistics, and system overview',
          category: 'system',
          group: 'system',
          action: 'access',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        
        // Events Module - Complete event management
        {
          atomId: 'events',
          name: 'Events Module',
          description: 'Full access to event management including create, view, edit, delete events',
          category: 'events',
          group: 'events',
          action: 'access',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        
        // Interviews Module - Interview and interviewer management
        {
          atomId: 'interviews',
          name: 'Interviews Module',
          description: 'Full access to interview management, interviewer scheduling, and interview reports',
          category: 'interviews',
          group: 'interviews',
          action: 'access',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        
        // Appointments Module - Appointment booking system
        {
          atomId: 'appointments',
          name: 'Appointments Module',
          description: 'Full access to appointment booking system, slots management, and booking analytics',
          category: 'appointments',
          group: 'appointments',
          action: 'access',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        
        // Reports Module - Analytics and reporting
        {
          atomId: 'reports',
          name: 'Reports Module',
          description: 'Access to analytics, reporting dashboard, and data insights',
          category: 'reports',
          group: 'reports',
          action: 'access',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        
        // Users Module - User management
        {
          atomId: 'users',
          name: 'Users Module',
          description: 'Full access to user management, member profiles, and membership administration',
          category: 'users',
          group: 'users',
          action: 'access',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        
        // Marketing Module - Marketing and CTA management
        {
          atomId: 'marketing',
          name: 'Marketing Module',
          description: 'Access to marketing campaigns, CTA management, and marketing analytics',
          category: 'marketing',
          group: 'marketing',
          action: 'access',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        
        // Admin Module - Administrative functions
        {
          atomId: 'admin',
          name: 'Admin Module',
          description: 'Administrative functions including user roles, permissions, and system configuration',
          category: 'admin',
          group: 'admin',
          action: 'access',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        }
      ]

      // Insert permission atoms
      await new Promise<void>((resolve, reject) => {
        this.db.permission_atoms.insert(defaultAtoms, (err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })

      console.log(`✅ Created ${defaultAtoms.length} permission atoms`)

    } catch (error) {
      console.error('❌ Failed to initialize permission atoms:', error)
      throw error
    }
  }
}

export default AdminInitService