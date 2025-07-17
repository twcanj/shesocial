#!/usr/bin/env node
// Migration Script: Update Old Membership Types to New 4-Tier System
// Converts: premium_2500 -> vvip, premium_1300 -> vip, regular -> registered

import NeDBSetup from '../dist/db/nedb-setup.js'

// Membership type mapping from old to new
const MEMBERSHIP_MIGRATION = {
  premium_2500: 'vvip', // Premium 2500 -> VVIP (can view participants)
  premium_1300: 'vip', // Premium 1300 -> VIP (priority booking)
  regular: 'registered', // Regular -> Registered (basic member)
  vip: 'vip', // VIP stays VIP
  visitor: 'visitor', // Visitor stays visitor (if any)
  registered: 'registered', // Already correct
  vvip: 'vvip' // Already correct
}

// Permission mapping based on new membership types
const PERMISSION_MAPPING = {
  visitor: {
    viewParticipants: false,
    priorityBooking: false,
    uploadMedia: false,
    bookInterview: false
  },
  registered: {
    viewParticipants: false,
    priorityBooking: false,
    uploadMedia: true,
    bookInterview: true
  },
  vip: {
    viewParticipants: false,
    priorityBooking: true,
    uploadMedia: true,
    bookInterview: true
  },
  vvip: {
    viewParticipants: true,
    priorityBooking: true,
    uploadMedia: true,
    bookInterview: true
  }
}

async function migrateMembershipTypes() {
  console.log('🔄 Starting membership type migration...\n')

  try {
    // Initialize database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()

    // Get all users
    const users = await new Promise((resolve, reject) => {
      db.users.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    console.log(`📊 Found ${users.length} users to process\n`)

    let migratedCount = 0
    const errors = []

    for (const user of users) {
      try {
        const oldType = user.membership?.type
        const newType = MEMBERSHIP_MIGRATION[oldType]

        if (!newType) {
          console.log(`⚠️  Unknown membership type for ${user.email}: ${oldType}`)
          errors.push(`Unknown type: ${oldType} for ${user.email}`)
          continue
        }

        if (oldType === newType) {
          console.log(`✅ ${user.email} (${user.profile?.name}) - Already correct: ${oldType}`)
          continue
        }

        // Update membership type and permissions
        const updateData = {
          'membership.type': newType,
          'membership.permissions': PERMISSION_MAPPING[newType],
          updatedAt: new Date(),
          lastSync: new Date()
        }

        await new Promise((resolve, reject) => {
          db.users.update(
            { _id: user._id },
            { $set: updateData },
            {},
            (err, numReplaced) => {
              if (err) reject(err)
              else resolve(numReplaced)
            }
          )
        })

        console.log(`🔄 ${user.email} (${user.profile?.name})`)
        console.log(`   ${oldType} → ${newType}`)
        console.log(`   Permissions updated: ${JSON.stringify(PERMISSION_MAPPING[newType])}`)
        console.log('')

        migratedCount++
      } catch (error) {
        console.error(`❌ Error migrating ${user.email}:`, error.message)
        errors.push(`${user.email}: ${error.message}`)
      }
    }

    // Summary
    console.log('📋 MIGRATION SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Successfully migrated: ${migratedCount} users`)
    console.log(`❌ Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n🚨 Migration errors:')
      errors.forEach(error => console.log(`   - ${error}`))
    }

    // Verify results
    console.log('\n🔍 Verification - Current membership types:')
    const updatedUsers = await new Promise((resolve, reject) => {
      db.users.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    const typeCounts = {}
    updatedUsers.forEach(user => {
      const type = user.membership?.type || 'undefined'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} users`)
    })

    console.log('\n✅ Membership type migration completed successfully!')
    console.log('\n🎯 New 4-tier system active:')
    console.log('   - visitor: Browse only, no features')
    console.log('   - registered: Basic member, upload media + book interviews')
    console.log('   - vip: Priority booking + all registered features')
    console.log('   - vvip: View participants + all vip features')
  } catch (error) {
    console.error('❌ Fatal migration error:', error)
    process.exit(1)
  }
}

// Run migration
migrateMembershipTypes()
  .then(() => {
    console.log('\n🚀 Migration process completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })

export { migrateMembershipTypes }
