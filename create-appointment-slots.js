#!/usr/bin/env node
// Create Appointment Slots Script
// Creates test appointment slots for the next 2 weeks

const path = require('path')
const NeDBSetup = require('./server/dist/db/nedb-setup').default

async function createAppointmentSlots() {
  console.log('📅 Creating appointment slots for testing...\n')

  try {
    // Initialize database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    // Get interviewers
    const interviewers = await new Promise((resolve, reject) => {
      db.interviewers.find({}, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    if (interviewers.length === 0) {
      console.log('❌ No interviewers found. Please run seed data creation first.')
      return
    }

    console.log(`✅ Found ${interviewers.length} interviewers`)

    // Create slots for next 14 days
    const slots = []
    const today = new Date()
    
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const date = new Date(today)
      date.setDate(today.getDate() + dayOffset)
      
      // Skip weekends for now
      if (date.getDay() === 0 || date.getDay() === 6) continue
      
      // Create morning and afternoon slots
      const timeSlots = [
        { hour: 10, minute: 0 },  // 10:00 AM
        { hour: 11, minute: 0 },  // 11:00 AM
        { hour: 14, minute: 0 },  // 2:00 PM
        { hour: 15, minute: 0 },  // 3:00 PM
        { hour: 16, minute: 0 }   // 4:00 PM
      ]
      
      for (const timeSlot of timeSlots) {
        for (const interviewer of interviewers) {
          const startTime = new Date(date)
          startTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0)
          
          const endTime = new Date(startTime)
          endTime.setMinutes(endTime.getMinutes() + 30) // 30-minute slots
          
          const slot = {
            slotId: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            appointmentType: Math.random() > 0.5 ? 'member_interview' : 'consultation',
            interviewerId: interviewer._id,
            interviewerName: interviewer.name,
            startTime: startTime,
            endTime: endTime,
            isAvailable: true,
            maxBookings: 1,
            currentBookings: 0,
            location: {
              type: 'video_call',
              details: {
                platform: 'zoom',
                meetingId: `zoom_${Math.random().toString(36).substr(2, 10)}`,
                password: Math.random().toString(36).substr(2, 8)
              }
            },
            metadata: {
              duration: 30,
              language: 'zh-TW',
              specialRequirements: [],
              notes: `${interviewer.name}的預約時段`
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system'
          }
          
          slots.push(slot)
        }
      }
    }

    // Insert slots into database
    console.log(`📅 Creating ${slots.length} appointment slots...`)
    
    for (const slot of slots) {
      await new Promise((resolve, reject) => {
        db.appointments_slots.insert(slot, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })
    }

    console.log(`✅ Created ${slots.length} appointment slots successfully!`)
    
    // Show summary
    const consultationSlots = slots.filter(s => s.appointmentType === 'consultation').length
    const interviewSlots = slots.filter(s => s.appointmentType === 'member_interview').length
    
    console.log(`\n📊 Slot Summary:`)
    console.log(`   💼 Consultation slots: ${consultationSlots}`)
    console.log(`   🎯 Interview slots: ${interviewSlots}`)
    console.log(`   📅 Date range: ${slots[0].startTime.toDateString()} to ${slots[slots.length-1].startTime.toDateString()}`)
    console.log(`   👥 Interviewers: ${interviewers.length}`)
    
    console.log('\n🚀 Ready to test appointment booking!')
    
  } catch (error) {
    console.error('❌ Error creating appointment slots:', error)
  }
}

// Run the script
createAppointmentSlots()
