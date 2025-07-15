#!/usr/bin/env node
// Check Appointment Slots Script

const NeDBSetup = require('./server/dist/db/nedb-setup').default

async function checkSlots() {
  try {
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    const slots = await new Promise((resolve, reject) => {
      db.appointments_slots.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    console.log('📅 Appointment Slots Data:')
    console.log(`Total slots: ${slots.length}`)
    
    if (slots.length > 0) {
      console.log('\nFirst 3 slots:')
      slots.slice(0, 3).forEach((slot, index) => {
        console.log(`\n${index + 1}. Slot:`)
        console.log(`   ID: ${slot.slotId}`)
        console.log(`   Type: ${slot.appointmentType}`)
        console.log(`   Interviewer: ${slot.interviewerName}`)
        console.log(`   Start: ${slot.startTime}`)
        console.log(`   Available: ${slot.isAvailable}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkSlots()
