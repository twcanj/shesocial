// Create 4 admin users with simple structure compatible with NeDB
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
    // Admin users data
    const adminData = [
      {
        username: 'super_admin',
        email: 'super@infinitymatch.com',
        password: 'admin123',
        level: 'C-Level',
        type: 'super_admin',
        department: '執行部',
        realName: '總管理',
        employeeId: 'SUPER-001'
      },
      {
        username: 'system_admin', 
        email: 'system@infinitymatch.com',
        password: 'admin123',
        level: 'Technical',
        type: 'system_admin',
        department: '技術部',
        realName: '系統管理',
        employeeId: 'SYS-001'
      },
      {
        username: 'operation_admin',
        email: 'operation@infinitymatch.com', 
        password: 'admin123',
        level: 'Operational',
        type: 'operation_admin',
        department: '營運部',
        realName: '營運管理',
        employeeId: 'OPS-001'
      },
      {
        username: 'premium_admin',
        email: 'premium@infinitymatch.com',
        password: 'admin123', 
        level: 'Premium Service',
        type: 'premium_admin',
        department: '會員部',
        realName: '付費用戶管理者',
        employeeId: 'PRM-001'
      }
    ]

    // Clear existing admins first
    adminUsersDB.remove({}, { multi: true }, async (err, numRemoved) => {
      if (err) {
        console.error('❌ Error clearing existing admins:', err)
        return
      }
      console.log(`🗑️ Cleared ${numRemoved} existing admin users`)

      // Create each admin
      for (let i = 0; i < adminData.length; i++) {
        const admin = adminData[i]
        const passwordHash = await bcrypt.hash(admin.password, 10)
        
        const adminUser = {
          adminId: `admin-00${i + 1}`,
          username: admin.username,
          email: admin.email,
          passwordHash: passwordHash,
          level: admin.level,        // Admin level field
          type: admin.type,          // Admin type field
          department: admin.department,
          status: 'active',
          profile: {
            realName: admin.realName,
            employeeId: admin.employeeId,
            lastLogin: null
          }
        }

        adminUsersDB.insert(adminUser, (err, doc) => {
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
          
          // Exit after last admin
          if (doc && doc.adminId === 'admin-004') {
            console.log('🎉 All 4 admin users created successfully!')
            console.log('\n📋 Login credentials:')
            adminData.forEach(admin => {
              console.log(`${admin.realName}: ${admin.email} / ${admin.password}`)
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