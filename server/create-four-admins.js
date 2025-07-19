// Create all 4 admin users with both level and type fields
const NeDB = require('nedb')
const bcrypt = require('bcrypt')
const path = require('path')

const adminUsersDB = new NeDB({ 
  filename: path.join(__dirname, 'data/admin_users.db'), 
  autoload: true 
})

console.log('🔧 Creating 4 admin users with level and type fields...')

async function createAllAdmins() {
  try {
    // Clear existing admin users first
    adminUsersDB.remove({}, { multi: true }, async (err, numRemoved) => {
      if (err) {
        console.error('❌ Error clearing existing admins:', err)
        return
      }
      console.log(`🗑️ Cleared ${numRemoved} existing admin users`)
      
      // Create the 4 admin users based on documentation
      const admins = [
        {
          _id: 'admin-001',
          adminId: 'admin-001',
          username: 'super_admin',
          email: 'super@infinitymatch.com',
          passwordHash: await bcrypt.hash('admin123', 10),
          roleId: 'super-admin-role',
          level: 'C-Level',           // Admin level
          type: 'super_admin',        // Admin type
          department: '執行部',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          profile: {
            realName: '總管理',
            employeeId: 'SUPER-001',
            lastLogin: null
          }
        },
        {
          _id: 'admin-002',
          adminId: 'admin-002',
          username: 'system_admin',
          email: 'system@infinitymatch.com',
          passwordHash: await bcrypt.hash('admin123', 10),
          roleId: 'system-admin-role',
          level: 'Technical',          // Admin level
          type: 'system_admin',        // Admin type
          department: '技術部',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          profile: {
            realName: '系統管理',
            employeeId: 'SYS-001',
            lastLogin: null
          }
        },
        {
          _id: 'admin-003',
          adminId: 'admin-003',
          username: 'operation_admin',
          email: 'operation@infinitymatch.com',
          passwordHash: await bcrypt.hash('admin123', 10),
          roleId: 'operation-admin-role',
          level: 'Operational',        // Admin level
          type: 'operation_admin',     // Admin type
          department: '營運部',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          profile: {
            realName: '營運管理',
            employeeId: 'OPS-001',
            lastLogin: null
          }
        },
        {
          _id: 'admin-004',
          adminId: 'admin-004',
          username: 'premium_admin',
          email: 'premium@infinitymatch.com',
          passwordHash: await bcrypt.hash('admin123', 10),
          roleId: 'premium-admin-role',
          level: 'Premium Service',    // Admin level
          type: 'premium_admin',       // Admin type
          department: '會員部',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          profile: {
            realName: '付費用戶管理者',
            employeeId: 'PRM-001',
            lastLogin: null
          }
        }
      ]
      
      // Insert all admins
      let insertCount = 0
      for (const admin of admins) {
        adminUsersDB.insert(admin, (err, doc) => {
          if (err) {
            console.error(`❌ Error creating ${admin.type}:`, err)
          } else {
            console.log(`✅ Created ${admin.type}:`)
            console.log(`   Email: ${doc.email}`)
            console.log(`   Level: ${doc.level}`)
            console.log(`   Type: ${doc.type}`)
            console.log(`   Department: ${doc.department}`)
            console.log(`   Real Name: ${doc.profile.realName}`)
            console.log('')
          }
          
          insertCount++
          if (insertCount === admins.length) {
            console.log('🎉 All 4 admin users created successfully!')
            console.log('\n📋 Login credentials:')
            admins.forEach(admin => {
              console.log(`${admin.profile.realName}: ${admin.email} / admin123`)
            })
            process.exit(0)
          }
        })
      }
    })
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAllAdmins()