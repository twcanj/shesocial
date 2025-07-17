#!/usr/bin/env node
// Quick script to create admin users
const bcrypt = require('./server/node_modules/bcrypt')
const NeDBSetup = require('./server/dist/db/nedb-setup.js').default
const { AdminPermissionService } = require('./server/dist/services/AdminPermissionService.js')

async function createAdmin() {
  console.log('🔐 Creating superadmin user...\n')
  
  try {
    // Initialize database
    const dbSetup = NeDBSetup.getInstance()
    const adminPermissionService = new AdminPermissionService()
    
    // Admin user data
    const adminData = {
      adminId: 'admin-001',
      username: 'superadmin',
      email: 'superadmin@infinitymatch.tw',
      passwordHash: await bcrypt.hash('SuperAdmin2025!', 12),
      profile: {
        realName: '張執行長',
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
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Create admin user
    const admin = await adminPermissionService.createAdminUser(adminData)
    console.log('✅ Created superadmin user:', admin.username)
    console.log('📧 Email:', admin.email)
    console.log('🏢 Department:', admin.profile.department)
    console.log('👑 Role:', admin.roleId)
    console.log('')
    console.log('🚀 You can now login with:')
    console.log('   Username: superadmin')
    console.log('   Password: SuperAdmin2025!')
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Superadmin user already exists')
    } else {
      console.error('❌ Error creating admin:', error.message)
    }
  }
}

createAdmin().then(() => {
  console.log('\n✅ Admin creation complete')
  process.exit(0)
}).catch((error) => {
  console.error('\n❌ Admin creation failed:', error)
  process.exit(1)
})