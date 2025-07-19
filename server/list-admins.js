// List all admin users in the database
const NeDB = require('nedb')
const path = require('path')

const adminUsersDB = new NeDB({ 
  filename: path.join(__dirname, 'data/admin_users.db'), 
  autoload: true 
})

console.log('📋 Listing all admin users in database...\n')

adminUsersDB.find({}, (err, docs) => {
  if (err) {
    console.error('❌ Error reading admin users:', err)
    process.exit(1)
  }
  
  if (docs.length === 0) {
    console.log('❌ No admin users found in database')
  } else {
    console.log(`✅ Found ${docs.length} admin user(s):\n`)
    
    docs.forEach((admin, index) => {
      console.log(`${index + 1}. Admin User:`)
      console.log(`   ID: ${admin._id || admin.adminId}`)
      console.log(`   Username: ${admin.username}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Level: ${admin.level || 'Not set'}`)
      console.log(`   Type: ${admin.type || 'Not set'}`)
      console.log(`   Department: ${admin.department || 'Not set'}`)
      console.log(`   Status: ${admin.status}`)
      console.log(`   Real Name: ${admin.profile?.realName || 'Not set'}`)
      console.log(`   Employee ID: ${admin.profile?.employeeId || 'Not set'}`)
      console.log(`   Created: ${admin.createdAt || 'Not set'}`)
      console.log(`   Last Login: ${admin.profile?.lastLogin || 'Never'}`)
      console.log('')
    })
  }
  
  process.exit(0)
})