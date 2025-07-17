#!/usr/bin/env node
// Check what admin users are in the database
const NeDBSetup = require('./server/dist/db/nedb-setup.js').default

async function checkAdminUsers() {
  console.log('🔍 Checking admin users in database...\n')
  
  try {
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    // Get all admin users
    const users = await new Promise((resolve, reject) => {
      db.admin_users.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
    
    console.log(`Found ${users.length} admin users:`)
    users.forEach(user => {
      console.log(`\n👤 Admin ID: ${user.adminId}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Real Name: ${user.profile.realName}`)
      console.log(`   Department: ${user.profile.department}`)
      console.log(`   Role ID: ${user.roleId}`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Password Hash: ${user.passwordHash ? 'Set' : 'Missing'}`)
    })
    
    // Check a specific user
    const superadmin = await new Promise((resolve, reject) => {
      db.admin_users.findOne({ username: 'superadmin' }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
    
    if (superadmin) {
      console.log('\n🔑 Superadmin user found:')
      console.log(`   Username: ${superadmin.username}`)
      console.log(`   Email: ${superadmin.email}`)
      console.log(`   Status: ${superadmin.status}`)
      console.log(`   Password hash length: ${superadmin.passwordHash?.length || 0}`)
    } else {
      console.log('\n❌ Superadmin user not found!')
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error.message)
  }
}

checkAdminUsers().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})