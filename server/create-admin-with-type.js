// Create admin user with correct type
const NeDB = require('nedb')
const bcrypt = require('bcrypt')
const path = require('path')

const adminUsersDB = new NeDB({ 
  filename: path.join(__dirname, 'data/admin_users.db'), 
  autoload: true 
})

console.log('🔧 Creating admin user with super_admin type...')

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10)
    
    const adminUser = {
      _id: 'admin-001',
      adminId: 'admin-001',
      username: 'admin',
      email: 'admin@infinitymatch.com',
      passwordHash: passwordHash,
      roleId: 'super-admin-role',
      type: 'super_admin', // This is the key field
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        realName: '系統管理員',
        employeeId: 'ADMIN-001',
        lastLogin: null
      }
    }
    
    adminUsersDB.insert(adminUser, (err, doc) => {
      if (err) {
        console.error('❌ Error creating admin:', err)
      } else {
        console.log('✅ Successfully created admin user!')
        console.log('   Email: admin@infinitymatch.com')
        console.log('   Password: admin123')
        console.log('   Type:', doc.type)
        console.log('   Status:', doc.status)
      }
      process.exit(0)
    })
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAdmin()