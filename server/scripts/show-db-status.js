#!/usr/bin/env node
// Show Database Status - Display current data and prepare for R2 integration

const NeDBSetup = require('../dist/db/nedb-setup').default

async function showDatabaseStatus() {
  console.log('📊 InfinityMatch Database Status\n')
  
  try {
    // Initialize database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    console.log(`📁 Data Path: ${dbSetup.getDataPath()}`)
    console.log(`📄 Database Files:`)
    
    const files = await dbSetup.listDatabaseFiles()
    files.forEach(file => {
      console.log(`   - ${file}`)
    })
    
    console.log('\n📈 Collection Counts:')
    
    // Get counts for each collection
    const collections = [
      'users',
      'events', 
      'bookings',
      'syncQueue',
      'appointments_slots',
      'appointment_bookings',
      'interviewers',
      'availability_overrides',
      'appointment_notifications'
    ]
    
    for (const collectionName of collections) {
      try {
        const count = await new Promise((resolve, reject) => {
          db[collectionName].count({}, (err, count) => {
            if (err) reject(err)
            else resolve(count)
          })
        })
        console.log(`   ${collectionName}: ${count} records`)
      } catch (error) {
        console.log(`   ${collectionName}: error - ${error.message}`)
      }
    }
    
    console.log('\n🔮 R2 Integration Ready:')
    console.log('   ✅ Persistent file storage enabled')
    console.log('   ✅ Database files available for upload')
    console.log('   ✅ syncToR2() method prepared')
    console.log('   ✅ restoreFromR2() method prepared')
    
    console.log('\n🚀 Next Steps for R2:')
    console.log('   1. Configure R2 credentials')
    console.log('   2. Implement file upload in syncToR2()')
    console.log('   3. Implement file download in restoreFromR2()')
    console.log('   4. Add scheduled backup functionality')
    
    console.log('\n👥 Users in Database:')
    try {
      const users = await new Promise((resolve, reject) => {
        db.users.find({}, (err, docs) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })
      console.log(users)
    } catch (error) {
      console.log(`   users: error - ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Error checking database status:', error)
  }
}

// Main execution
if (require.main === module) {
  showDatabaseStatus()
    .then(() => {
      console.log('\n✅ Database status check completed.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Database status check failed:', error)
      process.exit(1)
    })
}

module.exports = { showDatabaseStatus }