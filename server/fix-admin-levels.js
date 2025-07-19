// Fix admin levels to use level 1 and level 2
const NeDBSetup = require('./dist/db/nedb-setup').default

async function fixAdminLevels() {
  try {
    console.log('🔧 Fixing admin levels to use level 1 and level 2...')
    
    // Get database instance
    const nedbSetup = NeDBSetup.getInstance()
    const databases = nedbSetup.getDatabases()
    const adminDB = databases.admin_users

    // Update super_admin to level 1
    await new Promise((resolve, reject) => {
      adminDB.update(
        { type: 'super_admin' },
        { $set: { level: 1 } },
        {},
        (err, numReplaced) => {
          if (err) reject(err)
          else {
            console.log(`✅ Updated super_admin to level 1 (${numReplaced} records)`)
            resolve()
          }
        }
      )
    })

    // Update system_admin to level 1  
    await new Promise((resolve, reject) => {
      adminDB.update(
        { type: 'system_admin' },
        { $set: { level: 1 } },
        {},
        (err, numReplaced) => {
          if (err) reject(err)
          else {
            console.log(`✅ Updated system_admin to level 1 (${numReplaced} records)`)
            resolve()
          }
        }
      )
    })

    // Update operation_admin to level 2
    await new Promise((resolve, reject) => {
      adminDB.update(
        { type: 'operation_admin' },
        { $set: { level: 2 } },
        {},
        (err, numReplaced) => {
          if (err) reject(err)
          else {
            console.log(`✅ Updated operation_admin to level 2 (${numReplaced} records)`)
            resolve()
          }
        }
      )
    })

    // Update premium_admin to level 2
    await new Promise((resolve, reject) => {
      adminDB.update(
        { type: 'premium_admin' },
        { $set: { level: 2 } },
        {},
        (err, numReplaced) => {
          if (err) reject(err)
          else {
            console.log(`✅ Updated premium_admin to level 2 (${numReplaced} records)`)
            resolve()
          }
        }
      )
    })

    console.log('\n🎉 All admin levels updated successfully!')
    console.log('📋 Level structure:')
    console.log('   Level 1: super_admin, system_admin (top-level, no permission checks)')
    console.log('   Level 2: operation_admin, premium_admin (permission checks required)')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixAdminLevels().then(() => {
  console.log('\n🚀 Admin level fix completed!')
  process.exit(0)
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})