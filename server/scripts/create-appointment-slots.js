#!/usr/bin/env node
// Create Appointment Slots Test Data
// Generates appointment slots for the next 2 weeks for all interviewers

const path = require('path')

// Import our database setup
const NeDBSetup = require('../dist/db/nedb-setup').default
const { AppointmentSlotModel } = require('../dist/models/AppointmentSlot')
const { InterviewerModel } = require('../dist/models/Interviewer')

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

// Helper function to add days to a date
function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Helper function to create time slot
function createTimeSlot(date, startTime, endTime, duration = 30) {
  return {
    date: formatDate(date),
    startTime,
    endTime,
    duration
  }
}

// Generate time slots based on interviewer availability
function generateTimeSlotsForDay(interviewer, date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const availability = interviewer.defaultAvailability[dayOfWeek]
  
  if (!availability || !availability.enabled) {
    return []
  }
  
  const slots = []
  const startHour = parseInt(availability.startTime.split(':')[0])
  const startMin = parseInt(availability.startTime.split(':')[1])
  const endHour = parseInt(availability.endTime.split(':')[0])
  const endMin = parseInt(availability.endTime.split(':')[1])
  
  let currentTime = new Date(date)
  currentTime.setHours(startHour, startMin, 0, 0)
  
  const endTime = new Date(date)
  endTime.setHours(endHour, endMin, 0, 0)
  
  // Generate 30-minute slots
  while (currentTime < endTime) {
    const slotEndTime = new Date(currentTime.getTime() + 30 * 60000) // 30 minutes
    
    // Check if slot conflicts with break times
    const startTimeStr = currentTime.toTimeString().slice(0, 5)
    const endTimeStr = slotEndTime.toTimeString().slice(0, 5)
    
    let isBreakTime = false
    if (availability.breakTimes) {
      for (const breakTime of availability.breakTimes) {
        if (
          (startTimeStr >= breakTime.startTime && startTimeStr < breakTime.endTime) ||
          (endTimeStr > breakTime.startTime && endTimeStr <= breakTime.endTime) ||
          (startTimeStr <= breakTime.startTime && endTimeStr >= breakTime.endTime)
        ) {
          isBreakTime = true
          break
        }
      }
    }
    
    if (!isBreakTime && slotEndTime <= endTime) {
      slots.push(createTimeSlot(date, startTimeStr, endTimeStr, 30))
    }
    
    // Move to next slot (considering buffer time)
    currentTime.setMinutes(currentTime.getMinutes() + 30 + interviewer.bufferTimeMinutes)
  }
  
  return slots
}

async function createAppointmentSlots() {
  console.log('📅 Starting appointment slots creation...\n')
  
  try {
    // Initialize database
    console.log('📊 Initializing database connections...')
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    console.log('✅ Database initialized successfully\n')
    
    // Initialize models
    const appointmentSlotModel = new AppointmentSlotModel(db)
    const interviewerModel = new InterviewerModel(db)
    
    // Get all active interviewers
    console.log('👥 Fetching active interviewers...')
    const interviewers = await interviewerModel.getActiveInterviewers()
    console.log(`Found ${interviewers.length} active interviewers\n`)
    
    if (interviewers.length === 0) {
      console.log('❌ No active interviewers found. Please run seed data creation first.')
      return
    }
    
    // Generate slots for next 2 weeks
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0) // Start from today
    const numberOfDays = 14 // 2 weeks
    
    let totalSlotsCreated = 0
    const slotsByInterviewer = {}
    
    for (const interviewer of interviewers) {
      console.log(`🎯 Creating slots for ${interviewer.name} (${interviewer.title})`)
      
      slotsByInterviewer[interviewer.name] = {
        consultation: 0,
        member_interview: 0,
        total: 0
      }
      
      for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
        const currentDate = addDays(startDate, dayOffset)
        const dateStr = formatDate(currentDate)
        
        // Skip past dates
        if (currentDate < new Date()) {
          continue
        }
        
        // Generate time slots for this day
        const timeSlots = generateTimeSlotsForDay(interviewer, currentDate)
        
        if (timeSlots.length === 0) {
          continue // No availability this day
        }
        
        // Create appointment slots for each time slot
        for (const timeSlot of timeSlots) {
          try {
            // Create slots for each appointment type the interviewer supports
            for (const appointmentType of interviewer.appointmentTypes) {
              const slotData = {
                interviewerId: interviewer._id,
                interviewerName: interviewer.name,
                type: appointmentType,
                date: timeSlot.date,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                duration: timeSlot.duration,
                timezone: 'Asia/Taipei',
                
                // Availability
                isAvailable: true,
                maxBookings: 1, // One person per slot
                bookedCount: 0,
                
                // Interview settings
                interviewType: interviewer.interviewTypes[0], // Use first available type
                
                // Business rules
                requiresPreApproval: !interviewer.autoApproval,
                cancellationDeadlineHours: 24,
                
                // Meeting info (to be set when booked)
                meetingUrl: null,
                location: null,
                
                // Recurring settings
                isRecurring: false,
                recurringPattern: null,
                
                // Notes
                notes: `${appointmentType === 'consultation' ? '諮詢預約' : '會員面試'} - ${interviewer.name}`,
                
                // Metadata
                createdBy: 'system-seed',
                createdAt: new Date(),
                updatedAt: new Date()
              }
              
              const createdSlot = await appointmentSlotModel.create(slotData)
              slotsByInterviewer[interviewer.name][appointmentType]++
              slotsByInterviewer[interviewer.name].total++
              totalSlotsCreated++
              
            }
          } catch (error) {
            console.log(`    ❌ Error creating slot for ${timeSlot.startTime}: ${error.message}`)
          }
        }
      }
      
      console.log(`  ✅ Created ${slotsByInterviewer[interviewer.name].total} slots`)
      console.log(`     - Consultation: ${slotsByInterviewer[interviewer.name].consultation}`)
      console.log(`     - Member Interview: ${slotsByInterviewer[interviewer.name].member_interview}`)
      console.log('')
    }
    
    // Summary
    console.log('📊 APPOINTMENT SLOTS SUMMARY')
    console.log('=' * 50)
    console.log(`\n📅 Period: ${formatDate(startDate)} to ${formatDate(addDays(startDate, numberOfDays - 1))}`)
    console.log(`📈 Total slots created: ${totalSlotsCreated}`)
    console.log('')
    
    for (const [interviewerName, stats] of Object.entries(slotsByInterviewer)) {
      console.log(`👤 ${interviewerName}:`)
      console.log(`   📋 Total: ${stats.total} slots`)
      console.log(`   💬 Consultation: ${stats.consultation} slots`)
      console.log(`   🎯 Member Interview: ${stats.member_interview} slots`)
      console.log('')
    }
    
    console.log('🚀 NEXT STEPS:')
    console.log('1. Start the server: npm run dev:server')
    console.log('2. Test appointment booking API endpoints')
    console.log('3. Create appointment booking test script')
    console.log('4. Build frontend appointment booking interface')
    console.log('')
    console.log('🌟 Appointment slots creation completed successfully!')
    
  } catch (error) {
    console.error('❌ Fatal error during appointment slots creation:', error)
    process.exit(1)
  }
}

// Main execution
if (require.main === module) {
  createAppointmentSlots()
    .then(() => {
      console.log('\n✅ Appointment slots creation process finished.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Appointment slots creation failed:', error)
      process.exit(1)
    })
}

module.exports = { createAppointmentSlots }