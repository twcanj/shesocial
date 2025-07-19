// List all admin users from the proper database
const NeDBSetup = require('./dist/db/nedb-setup').default

async function listAllAdmins() {
  try {
    console.log('📋 Listing all admin users from database...\n')
    
    // Get database instance
    const nedbSetup = NeDBSetup.getInstance()
    const databases = nedbSetup.getDatabases()
    const adminDB = databases.admin_users

    // Get all admin users
    const allAdmins = await new Promise((resolve, reject) => {
      adminDB.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
    
    if (allAdmins.length === 0) {
      console.log('❌ No admin users found in database')
    } else {
      console.log(`✅ Found ${allAdmins.length} admin user(s):\n`)
      
      allAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. Admin User:`)
        console.log(`   Admin ID: ${admin.adminId}`)
        console.log(`   Username: ${admin.username}`)
        console.log(`   Email: ${admin.email}`)
        console.log(`   Level: ${admin.level || 'Not set'}`)
        console.log(`   Type: ${admin.type || 'Not set'}`)
        console.log(`   Department: ${admin.department || 'Not set'}`)
        console.log(`   Status: ${admin.status}`)
        console.log(`   Real Name: ${admin.profile?.realName || 'Not set'}`)
        console.log(`   Employee ID: ${admin.profile?.employeeId || 'Not set'}`)
        console.log(`   Role ID: ${admin.roleId}`)
        console.log(`   Created: ${new Date(admin.createdAt).toLocaleString()}`)
        console.log(`   Last Login: ${admin.profile?.lastLogin ? new Date(admin.profile.lastLogin).toLocaleString() : 'Never'}`)
        console.log('')
      })
      
      console.log('📋 Summary by Type:')
      const groupedByType = allAdmins.reduce((acc, admin) => {
        const type = admin.type || 'unknown'
        if (!acc[type]) acc[type] = []
        acc[type].push(admin)
        return acc
      }, {})
      
      Object.entries(groupedByType).forEach(([type, admins]) => {
        console.log(`   ${type}: ${admins.length} admin(s)`)
        admins.forEach(admin => {
          console.log(`     - ${admin.profile?.realName} (${admin.email})`)
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

listAllAdmins().then(() => {
  console.log('\n🚀 Admin listing completed!')
  process.exit(0)
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})