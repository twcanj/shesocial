#!/usr/bin/env node
// Admin System Seeding Script
// Seeds permission atoms, roles, and admin users to the actual database

const bcrypt = require('./server/node_modules/bcrypt')
const NeDBSetup = require('./server/dist/db/nedb-setup.js').default
const { DEFAULT_PERMISSION_ATOMS, DEFAULT_ADMIN_ROLES } = require('./server/dist/models/AdminPermission.js')

async function seedAdminSystem() {
  console.log('🔐 Starting admin system seeding...\n')
  
  try {
    // Initialize database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    console.log('📊 Seeding permission atoms...')
    
    // Seed permission atoms
    for (const atomData of DEFAULT_PERMISSION_ATOMS) {
      const atom = {
        ...atomData,
        _id: atomData.atomId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
      
      try {
        await new Promise((resolve, reject) => {
          db.permission_atoms.insert(atom, (err, doc) => {
            if (err) {
              if (err.message.includes('unique')) {
                // Atom already exists, skip
                resolve(null)
              } else {
                reject(err)
              }
            } else {
              resolve(doc)
            }
          })
        })
        console.log(`   ✅ ${atom.atomId}`)
      } catch (error) {
        console.log(`   ⚠️  ${atom.atomId} (already exists)`)
      }
    }
    
    console.log(`\n📋 Seeding admin roles...`)
    
    // Seed admin roles
    for (const roleData of DEFAULT_ADMIN_ROLES) {
      const role = {
        ...roleData,
        _id: roleData.roleId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system'
      }
      
      try {
        await new Promise((resolve, reject) => {
          db.admin_roles.insert(role, (err, doc) => {
            if (err) {
              if (err.message.includes('unique')) {
                // Role already exists, skip
                resolve(null)
              } else {
                reject(err)
              }
            } else {
              resolve(doc)
            }
          })
        })
        console.log(`   ✅ ${role.name} (${role.department})`)
      } catch (error) {
        console.log(`   ⚠️  ${role.name} (already exists)`)
      }
    }
    
    console.log(`\n👤 Seeding admin users...`)
    
    // Seed admin users
    const adminUsers = [
      // Super Admin (Executive)
      {
        adminId: 'admin-001',
        username: 'admin',
        email: 'admin@infinitymatch.com',
        passwordHash: await bcrypt.hash('admin123', 12),
        profile: {
          realName: '總管理員',
          employeeId: 'CEO-001',
          department: 'executive',
          joinDate: new Date(),
          lastLogin: null
        },
        roleId: 'super_admin',
        customPermissions: [],
        status: 'active',
        twoFactorEnabled: false,
        ipWhitelist: null,
        sessionTimeout: 480, // 8 hours
        createdBy: 'system',
        lastModifiedBy: 'system'
      },
      // System Admin
      {
        adminId: 'admin-002',
        username: 'sysadmin',
        email: 'sysadmin@infinitymatch.tw',
        passwordHash: await bcrypt.hash('SysAdmin2025!', 12),
        profile: {
          realName: '李技術長',
          employeeId: 'CTO-002',
          department: 'technical',
          joinDate: new Date(),
          lastLogin: null
        },
        roleId: 'system_admin',
        customPermissions: [],
        status: 'active',
        twoFactorEnabled: false,
        ipWhitelist: null,
        sessionTimeout: 480, // 8 hours
        createdBy: 'admin-001',
        lastModifiedBy: 'admin-001'
      },
      // Operations Admin
      {
        adminId: 'admin-003',
        username: 'operations',
        email: 'operations@infinitymatch.tw',
        passwordHash: await bcrypt.hash('Operations2025!', 12),
        profile: {
          realName: '王營運經理',
          employeeId: 'OPS-003',
          department: 'operations',
          joinDate: new Date(),
          lastLogin: null
        },
        roleId: 'operation_admin',
        customPermissions: [],
        status: 'active',
        twoFactorEnabled: false,
        ipWhitelist: null,
        sessionTimeout: 360, // 6 hours
        createdBy: 'admin-001',
        lastModifiedBy: 'admin-001'
      },
      // Customer Admin
      {
        adminId: 'admin-004',
        username: 'customer',
        email: 'customer@infinitymatch.tw',
        passwordHash: await bcrypt.hash('Customer2025!', 12),
        profile: {
          realName: '陳客戶經理',
          employeeId: 'CSM-004',
          department: 'members',
          joinDate: new Date(),
          lastLogin: null
        },
        roleId: 'customer_admin',
        customPermissions: [],
        status: 'active',
        twoFactorEnabled: false,
        ipWhitelist: null,
        sessionTimeout: 360, // 6 hours
        createdBy: 'admin-001',
        lastModifiedBy: 'admin-001'
      }
    ]
    
    for (const adminData of adminUsers) {
      const admin = {
        ...adminData,
        _id: adminData.adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      try {
        await new Promise((resolve, reject) => {
          db.admin_users.insert(admin, (err, doc) => {
            if (err) {
              if (err.message.includes('unique')) {
                // Admin already exists, skip
                resolve(null)
              } else {
                reject(err)
              }
            } else {
              resolve(doc)
            }
          })
        })
        console.log(`   ✅ ${admin.username} - ${admin.profile.realName} (${admin.profile.department})`)
      } catch (error) {
        console.log(`   ⚠️  ${admin.username} (already exists)`)
      }
    }
    
    console.log('\n📈 Admin system statistics:')
    
    // Get counts
    const atomCount = await new Promise((resolve, reject) => {
      db.permission_atoms.count({}, (err, count) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
    
    const roleCount = await new Promise((resolve, reject) => {
      db.admin_roles.count({}, (err, count) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
    
    const userCount = await new Promise((resolve, reject) => {
      db.admin_users.count({}, (err, count) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
    
    console.log(`   📊 Permission atoms: ${atomCount}`)
    console.log(`   🏢 Admin roles: ${roleCount}`)
    console.log(`   👥 Admin users: ${userCount}`)
    
    console.log('\n🚀 Admin login credentials (use EMAIL to login):')
    console.log('   Email: admin@infinitymatch.com,        Password: admin123')
    console.log('   Email: sysadmin@infinitymatch.tw,      Password: SysAdmin2025!')
    console.log('   Email: operations@infinitymatch.tw,    Password: Operations2025!')
    console.log('   Email: customer@infinitymatch.tw,      Password: Customer2025!')
    
  } catch (error) {
    console.error('❌ Error seeding admin system:', error.message)
    throw error
  }
}

// Run seeding
seedAdminSystem().then(() => {
  console.log('\n✅ Admin system seeding complete')
  process.exit(0)
}).catch((error) => {
  console.error('\n❌ Admin system seeding failed:', error)
  process.exit(1)
})