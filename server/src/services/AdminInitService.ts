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

      console.log('✅ Default admin user created successfully')
      console.log('   Email: admin@infinitymatch.com')
      console.log('   Password: admin123')
      console.log('   Role: System Admin')

    } catch (error) {
      console.error('❌ Failed to initialize default admin:', error)
      throw error
    }
  }
}

export default AdminInitService