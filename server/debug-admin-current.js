// Debug script to check current admin user permissions
const NeDB = require('nedb')
const path = require('path')

// Load databases
const adminUsersDB = new NeDB({ 
  filename: path.join(__dirname, 'data/admin_users.db'), 
  autoload: true 
})

console.log('🔍 Checking current admin users in database...')

adminUsersDB.find({}, (err, docs) => {
  if (err) {
    console.error('❌ Error:', err)
    return
  }
  
  console.log(`📊 Found ${docs.length} admin users:`)
  
  docs.forEach((user, index) => {
    console.log(`\n👤 Admin User ${index + 1}:`)
    console.log('  Email:', user.email)
    console.log('  Username:', user.username)
    console.log('  Status:', user.status)
    console.log('  Permissions:', user.permissions)
    console.log('  Role ID:', user.roleId)
    console.log('  Department:', user.department)
    console.log('  Created:', user.createdAt)
    console.log('  Metadata:', user.metadata)
  })
  
  // Check if we need to update permissions
  const adminUser = docs.find(u => u.email === 'admin@infinitymatch.com')
  if (adminUser) {
    console.log('\n🔍 Checking admin@infinitymatch.com permissions...')
    if (!adminUser.permissions || !adminUser.permissions.includes('*')) {
      console.log('❌ Admin user does not have super admin permissions!')
      console.log('   Current permissions:', adminUser.permissions)
      console.log('   Need to update to: ["*"]')
      
      // Update the admin user
      adminUsersDB.update(
        { email: 'admin@infinitymatch.com' },
        { $set: { permissions: ['*'] } },
        {},
        (err, numReplaced) => {
          if (err) {
            console.error('❌ Update error:', err)
          } else {
            console.log('✅ Updated admin permissions to super admin (*):', numReplaced)
          }
          process.exit(0)
        }
      )
    } else {
      console.log('✅ Admin user has correct super admin permissions')
      process.exit(0)
    }
  } else {
    console.log('❌ admin@infinitymatch.com not found in database!')
    process.exit(1)
  }
})