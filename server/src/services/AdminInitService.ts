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

      // Create default admin user
      const adminId = uuidv4()
      const roleId = uuidv4()
      const passwordHash = await bcrypt.hash('admin123', 10)

      const adminUser = {
        adminId,
        username: 'admin',
        email: 'admin@infinitymatch.com',
        passwordHash,
        roleId,
        department: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
        metadata: {
          createdBy: 'system',
          isSystemAdmin: true
        }
      }

      // Insert admin user
      await new Promise<void>((resolve, reject) => {
        this.db.admin_users.insert(adminUser, (err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // Create default admin role
      const adminRole = {
        roleId,
        name: 'System Admin',
        department: 'admin',
        permissions: ['*'], // All permissions
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          createdBy: 'system',
          isSystemRole: true
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

      console.log('✅ Default admin user created successfully')
      console.log('   Email: admin@infinitymatch.com')
      console.log('   Password: admin123')
      console.log('   Role: System Admin')

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

      // Define default permission atoms
      const defaultAtoms = [
        {
          atomId: 'system.overview',
          name: 'System Overview',
          description: 'Access to system overview and dashboard',
          category: 'system',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'user.read',
          name: 'View Users',
          description: 'View user profiles and information',
          category: 'user',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'user.write',
          name: 'Manage Users',
          description: 'Create, update, and delete user accounts',
          category: 'user',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'event.read',
          name: 'View Events',
          description: 'View events and activities',
          category: 'event',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'event.write',
          name: 'Manage Events',
          description: 'Create, update, and delete events',
          category: 'event',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'appointment.read',
          name: 'View Appointments',
          description: 'View appointment bookings and schedules',
          category: 'appointment',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'appointment.write',
          name: 'Manage Appointments',
          description: 'Create, update, and cancel appointments',
          category: 'appointment',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'marketing.read',
          name: 'View Marketing',
          description: 'View marketing campaigns and analytics',
          category: 'marketing',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'marketing.write',
          name: 'Manage Marketing',
          description: 'Create and manage marketing campaigns',
          category: 'marketing',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'admin.read',
          name: 'View Admin',
          description: 'View admin users and roles',
          category: 'admin',
          department: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { createdBy: 'system', isSystemPermission: true }
        },
        {
          atomId: 'admin.write',
          name: 'Manage Admin',
          description: 'Create and manage admin users and roles',
          category: 'admin',
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