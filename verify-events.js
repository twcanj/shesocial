#!/usr/bin/env node
// Quick script to verify events in database
const NeDBSetup = require('./server/dist/db/nedb-setup.js').default
const { EventModel } = require('./server/dist/models/Event.js')

async function verifyEvents() {
  console.log('🔍 Verifying events in database...\n')
  
  try {
    // Initialize database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    const eventModel = new EventModel(db.events)
    
    // Get all events
    const result = await eventModel.findAll(1, 20)
    
    if (result.success) {
      console.log(`✅ Found ${result.data.length} events in database:`)
      console.log('')
      
      result.data.forEach((event, index) => {
        console.log(`${index + 1}. ${event.name}`)
        console.log(`   📅 Date: ${new Date(event.metadata.date).toLocaleDateString('zh-TW')}`)
        console.log(`   📍 Location: ${event.metadata.location}`)
        console.log(`   💰 Price: $${event.metadata.pricing.male}(男) / $${event.metadata.pricing.female}(女)`)
        console.log(`   👥 Max: ${event.maxParticipants} people`)
        console.log(`   🏷️ Category: ${event.metadata.category}`)
        console.log(`   📊 Status: ${event.status}`)
        console.log('')
      })
      
      console.log(`🎉 Total events verified: ${result.data.length}`)
    } else {
      console.log('❌ Failed to retrieve events:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

verifyEvents().then(() => {
  console.log('\n✅ Verification complete')
  process.exit(0)
}).catch((error) => {
  console.error('\n❌ Verification failed:', error)
  process.exit(1)
})