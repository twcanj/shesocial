// Fix super admin email to match user's expectation
const NeDBSetup = require('./dist/db/nedb-setup').default

async function fixSuperAdminEmail() {
  try {
    console.log('🔧 Updating super admin email to admin@infinitymatch.com...')
    
    // Get database instance
    const nedbSetup = NeDBSetup.getInstance()
    const databases = nedbSetup.getDatabases()
    const adminDB = databases.admin_users

    // Update the super admin email
    const updateResult = await new Promise((resolve, reject) => {
      adminDB.update(
        { type: 'super_admin' },
        { 
          $set: { 
            email: 'admin@infinitymatch.com',
            username: 'admin',
            updatedAt: Date.now()
          }
        },
        { upsert: false },
        (err, numReplaced) => {
          if (err) reject(err)
          else resolve(numReplaced)
        }
      )
    })
    
    if (updateResult > 0) {
      console.log('✅ Successfully updated super admin email')
      
      // Verify the update
      const updatedAdmin = await new Promise((resolve, reject) => {
        adminDB.findOne({ type: 'super_admin' }, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })
      
      if (updatedAdmin) {
        console.log('✅ Verified super admin details:')
        console.log(`   Email: ${updatedAdmin.email}`)
        console.log(`   Username: ${updatedAdmin.username}`)
        console.log(`   Type: ${updatedAdmin.type}`)
        console.log(`   Level: ${updatedAdmin.level}`)
        console.log(`   Real Name: ${updatedAdmin.profile.realName}`)
        console.log('')
      }
      
    } else {
      console.log('❌ No super admin found to update')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixSuperAdminEmail().then(() => {
  console.log('🚀 Super admin email fix completed!')
  process.exit(0)
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})