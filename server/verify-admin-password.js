// Verify admin password for admin@infinitymatch.com
const NeDBSetup = require('./dist/db/nedb-setup').default
const bcrypt = require('bcrypt')

async function verifyAdminPassword() {
  try {
    console.log('🔧 Verifying admin@infinitymatch.com password...')
    
    // Get database instance
    const nedbSetup = NeDBSetup.getInstance()
    const databases = nedbSetup.getDatabases()
    const adminDB = databases.admin_users

    // Find the admin user
    const adminUser = await new Promise((resolve, reject) => {
      adminDB.findOne({ email: 'admin@infinitymatch.com' }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log('✅ Found admin user:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Username: ${adminUser.username}`)
    console.log(`   Type: ${adminUser.type}`)
    console.log(`   Level: ${adminUser.level}`)
    console.log('')
    
    // Test password verification
    const testPassword = 'admin123'
    const passwordMatch = await bcrypt.compare(testPassword, adminUser.passwordHash)
    
    if (passwordMatch) {
      console.log('✅ Password verification SUCCESSFUL!')
      console.log(`   Password "${testPassword}" matches the stored hash`)
    } else {
      console.log('❌ Password verification FAILED!')
      console.log(`   Password "${testPassword}" does not match the stored hash`)
      console.log(`   Stored hash: ${adminUser.passwordHash}`)
    }
    
    // Test login simulation
    console.log('\n🔐 Login Test Simulation:')
    console.log(`Email: admin@infinitymatch.com`)
    console.log(`Password: admin123`)
    console.log(`Result: ${passwordMatch ? 'LOGIN SUCCESS' : 'LOGIN FAILED'}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

verifyAdminPassword().then(() => {
  console.log('\n🚀 Password verification completed!')
  process.exit(0)
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})