// Fix admin type for existing admin user
const NeDB = require('nedb')
const path = require('path')

const adminUsersDB = new NeDB({ 
  filename: path.join(__dirname, 'data/admin_users.db'), 
  autoload: true 
})

console.log('🔧 Setting admin type for admin user...')

// Update the admin user to have super_admin type
adminUsersDB.update(
  { email: 'admin@infinitymatch.com' },
  { $set: { type: 'super_admin' } },
  { upsert: false },
  (err, numReplaced) => {
    if (err) {
      console.error('❌ Error updating admin type:', err)
    } else if (numReplaced > 0) {
      console.log('✅ Successfully set admin type to super_admin')
    } else {
      console.log('❌ No admin user found to update')
    }
    
    // Verify the update
    adminUsersDB.findOne({ email: 'admin@infinitymatch.com' }, (err, doc) => {
      if (err) {
        console.error('❌ Error finding admin:', err)
      } else if (doc) {
        console.log('✅ Verified admin user:')
        console.log('   Email:', doc.email)
        console.log('   Username:', doc.username)
        console.log('   Type:', doc.type)
        console.log('   Status:', doc.status)
      } else {
        console.log('❌ Admin user not found after update')
      }
      process.exit(0)
    })
  }
)