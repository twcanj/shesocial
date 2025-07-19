// Create 4 admin users with both level and type fields using proper server setup
const NeDBSetup = require('./dist/db/nedb-setup').default
const bcrypt = require('bcrypt')

async function createAllAdmins() {
  try {
    console.log('🔧 Creating 4 admin users with level and type fields...')
    
    // Get database instance
    const nedbSetup = NeDBSetup.getInstance()
    const databases = nedbSetup.getDatabases()
    const adminDB = databases.admin_users

    // Clear existing admin users first
    const numRemoved = await new Promise((resolve, reject) => {
      adminDB.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) reject(err)
        else resolve(numRemoved)
      })
    })
    console.log(`🗑️ Cleared ${numRemoved} existing admin users`)

    // Admin users data with both level and type
    const adminData = [
      {
        adminId: 'admin-001',
        username: 'super_admin',
        email: 'super@infinitymatch.com',
        password: 'admin123',
        level: 'C-Level',           // Admin level field
        type: 'super_admin',        // Admin type field  
        department: '執行部',
        realName: '總管理',
        employeeId: 'SUPER-001'
      },
      {
        adminId: 'admin-002',
        username: 'system_admin',
        email: 'system@infinitymatch.com',
        password: 'admin123',
        level: 'Technical',         // Admin level field
        type: 'system_admin',       // Admin type field
        department: '技術部', 
        realName: '系統管理',
        employeeId: 'SYS-001'
      },
      {
        adminId: 'admin-003',
        username: 'operation_admin',
        email: 'operation@infinitymatch.com',
        password: 'admin123',
        level: 'Operational',       // Admin level field
        type: 'operation_admin',    // Admin type field
        department: '營運部',
        realName: '營運管理',
        employeeId: 'OPS-001'
      },
      {
        adminId: 'admin-004',
        username: 'premium_admin',
        email: 'premium@infinitymatch.com',
        password: 'admin123',
        level: 'Premium Service',   // Admin level field
        type: 'premium_admin',      // Admin type field
        department: '會員部',
        realName: '付費用戶管理者',
        employeeId: 'PRM-001'
      }
    ]

    // Create each admin user
    for (const admin of adminData) {
      const passwordHash = await bcrypt.hash(admin.password, 10)
      
      const adminUser = {
        adminId: admin.adminId,
        username: admin.username,
        email: admin.email,
        passwordHash: passwordHash,
        roleId: `${admin.type}-role`,
        level: admin.level,         // Admin level field
        type: admin.type,           // Admin type field
        department: admin.department,
        status: 'active',
        twoFactorEnabled: false,
        sessionTimeout: 8,
        lastPasswordChange: Date.now(),
        profile: {
          realName: admin.realName,
          employeeId: admin.employeeId,
          department: admin.department,
          joinDate: Date.now(),
          lastLogin: null
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system'
      }

      await new Promise((resolve, reject) => {
        adminDB.insert(adminUser, (err, doc) => {
          if (err) {
            console.error(`❌ Error creating ${admin.type}:`, err)
            reject(err)
          } else {
            console.log(`✅ Created ${admin.type}:`)
            console.log(`   Email: ${doc.email}`)
            console.log(`   Level: ${doc.level}`)
            console.log(`   Type: ${doc.type}`)
            console.log(`   Department: ${doc.department}`)
            console.log(`   Real Name: ${doc.profile.realName}`)
            console.log('')
            resolve()
          }
        })
      })
    }
    
    console.log('🎉 All 4 admin users created successfully!')
    console.log('\n📋 Login credentials:')
    adminData.forEach(admin => {
      console.log(`${admin.realName}: ${admin.email} / ${admin.password}`)
    })
    
    // List all admins to verify
    const allAdmins = await new Promise((resolve, reject) => {
      adminDB.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
    
    console.log('\n✅ Verification - Admins in database:')
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.profile.realName} (${admin.type}) - Level: ${admin.level}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAllAdmins().then(() => {
  console.log('\n🚀 Admin creation completed!')
  process.exit(0)
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})