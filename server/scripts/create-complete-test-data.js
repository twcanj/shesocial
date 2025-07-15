#!/usr/bin/env node
// Complete Test Data Creation Script
// Creates users, admins, interviewers, and appointment slots in one go

const bcrypt = require('bcrypt')
const path = require('path')

// Import database setup
const NeDBSetup = require('../dist/db/nedb-setup').default
const { SYSTEM_USERS, ADMIN_USERS, INTERVIEWERS } = require('./seed-data')

// Import models
const { UserModel } = require('../dist/models/User')
const { InterviewerModel } = require('../dist/models/Interviewer')
const { AppointmentSlotModel } = require('../dist/models/AppointmentSlot')
const { AdminPermissionService } = require('../dist/services/AdminPermissionService')

// Helper functions for appointment slots
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function createTimeSlot(date, startTime, endTime, duration = 30) {
  return {
    date: formatDate(date),
    startTime,
    endTime,
    duration
  }
}

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
  
  // Generate 30-minute slots with buffer time
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
    
    // Move to next slot (30 min + buffer time)
    currentTime.setMinutes(currentTime.getMinutes() + 30 + interviewer.bufferTimeMinutes)
  }
  
  return slots
}

async function createCompleteTestData() {
  console.log('🌱 Starting complete test data creation for InfinityMatch platform...\n')
  
  try {
    // Initialize database
    console.log('📊 Initializing database connections...')
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    console.log('✅ Database initialized successfully\n')
    
    // Initialize models
    const userModel = new UserModel(db.users)
    const interviewerModel = new InterviewerModel(db)
    const appointmentSlotModel = new AppointmentSlotModel(db)
    const adminPermissionService = new AdminPermissionService()
    
    // === STEP 1: Create system users ===
    console.log('👥 Creating system users...')
    const createdUsers = []
    
    for (const userData of SYSTEM_USERS) {
      try {
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds)
        
        const userToCreate = {
          ...userData,
          password: hashedPassword,
          _id: undefined
        }
        
        const result = await userModel.create(userToCreate)
        if (result.success) {
          console.log(`  ✅ Created user: ${userData.profile.name} (${userData.email})`)
          createdUsers.push({
            ...result.data,
            originalPassword: userData.password
          })
        } else {
          console.log(`  ❌ Failed to create user ${userData.email}: ${result.error}`)
        }
      } catch (error) {
        console.log(`  ❌ Error creating user ${userData.email}: ${error.message}`)
      }
    }
    
    console.log(`\n✅ Created ${createdUsers.length}/${SYSTEM_USERS.length} system users\n`)
    
    // === STEP 2: Create admin users ===
    console.log('🔐 Creating admin users...')
    const createdAdmins = []
    
    for (const adminData of ADMIN_USERS) {
      try {
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds)
        
        const adminToCreate = {
          ...adminData,
          passwordHash: hashedPassword,
          password: undefined,
          _id: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const createdAdmin = await adminPermissionService.createAdminUser(adminToCreate)
        console.log(`  ✅ Created admin: ${adminData.profile.realName} (${adminData.username})`)
        
        createdAdmins.push({
          ...createdAdmin,
          originalPassword: adminData.password
        })
      } catch (error) {
        console.log(`  ❌ Error creating admin ${adminData.username}: ${error.message}`)
      }
    }
    
    console.log(`\n✅ Created ${createdAdmins.length}/${ADMIN_USERS.length} admin users\n`)
    
    // === STEP 3: Create interviewers ===
    console.log('🎯 Creating interviewer profiles...')
    const createdInterviewers = []
    
    for (let i = 0; i < INTERVIEWERS.length; i++) {
      try {
        const interviewerTemplate = INTERVIEWERS[i]
        
        const interviewerData = {
          ...interviewerTemplate,
          userId: null,
          _id: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const createdInterviewer = await interviewerModel.create(interviewerData)
        console.log(`  ✅ Created interviewer: ${interviewerData.name} (${interviewerData.title})`)
        createdInterviewers.push(createdInterviewer)
      } catch (error) {
        console.log(`  ❌ Error creating interviewer ${INTERVIEWERS[i].name}: ${error.message}`)
      }
    }
    
    console.log(`\n✅ Created ${createdInterviewers.length}/${INTERVIEWERS.length} interviewer profiles\n`)
    
    // === STEP 4: Create appointment slots ===
    console.log('📅 Creating appointment slots for next 2 weeks...')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1) // Start from tomorrow
    startDate.setHours(0, 0, 0, 0)
    const numberOfDays = 14 // 2 weeks
    
    let totalSlotsCreated = 0
    const slotsByInterviewer = {}
    
    for (const interviewer of createdInterviewers) {
      console.log(`🎯 Creating slots for ${interviewer.name}`)
      
      slotsByInterviewer[interviewer.name] = {
        consultation: 0,
        member_interview: 0,
        total: 0
      }
      
      for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
        const currentDate = addDays(startDate, dayOffset)
        
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
                maxBookings: 1,
                bookedCount: 0,
                
                // Interview settings
                interviewType: interviewer.interviewTypes[0],
                
                // Business rules
                requiresPreApproval: !interviewer.autoApproval,
                cancellationDeadlineHours: 24,
                
                // Meeting info
                meetingUrl: null,
                location: null,
                
                // Recurring settings
                isRecurring: false,
                recurringPattern: null,
                
                // Notes
                notes: `${appointmentType === 'consultation' ? '諮詢預約' : '會員面試'} - ${interviewer.name}`,
                
                // Metadata
                createdBy: 'system-seed'
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
    }
    
    console.log(`\n✅ Created ${totalSlotsCreated} total appointment slots\n`)
    
    // === FINAL SUMMARY ===
    console.log('📋 COMPLETE TEST DATA SUMMARY')
    console.log('=' * 50)
    
    console.log('\n🔐 ADMIN USERS:')
    createdAdmins.forEach(admin => {
      console.log(`  👤 ${admin.profile.realName}`)
      console.log(`     Email: ${admin.email}`)
      console.log(`     Username: ${admin.username}`)
      console.log(`     Password: ${admin.originalPassword}`)
      console.log(`     Role: ${admin.roleId}`)
      console.log('')
    })
    
    console.log('👥 PLATFORM USERS:')
    createdUsers.forEach(user => {
      console.log(`  👤 ${user.profile.name}`)
      console.log(`     Email: ${user.email}`)
      console.log(`     Password: ${user.originalPassword}`)
      console.log(`     Membership: ${user.membership.type}`)
      console.log('')
    })
    
    console.log('🎯 INTERVIEWERS:')
    createdInterviewers.forEach(interviewer => {
      console.log(`  👤 ${interviewer.name} (${interviewer.title})`)
      console.log(`     Email: ${interviewer.email}`)
      console.log(`     Types: ${interviewer.appointmentTypes.join(', ')}`)
      console.log(`     Slots: ${slotsByInterviewer[interviewer.name].total}`)
      console.log('')
    })
    
    console.log('📅 APPOINTMENT SLOTS:')
    console.log(`  📈 Total slots: ${totalSlotsCreated}`)
    console.log(`  📆 Period: ${formatDate(startDate)} to ${formatDate(addDays(startDate, numberOfDays - 1))}`)
    console.log('')
    
    for (const [interviewerName, stats] of Object.entries(slotsByInterviewer)) {
      console.log(`  👤 ${interviewerName}: ${stats.total} slots`)
      console.log(`     💬 Consultation: ${stats.consultation}`)
      console.log(`     🎯 Member Interview: ${stats.member_interview}`)
    }
    
    console.log('\n🚀 NEXT STEPS:')
    console.log('1. Start the server: npm run dev:server')
    console.log('2. Test API endpoints with admin credentials')
    console.log('3. Test appointment booking workflow')
    console.log('4. Build frontend appointment interface')
    console.log('')
    console.log('🌟 Complete test data creation finished successfully!')
    
  } catch (error) {
    console.error('❌ Fatal error during complete test data creation:', error)
    process.exit(1)
  }
}

// Main execution
if (require.main === module) {
  createCompleteTestData()
    .then(() => {
      console.log('\n✅ Complete test data creation process finished.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Complete test data creation failed:', error)
      process.exit(1)
    })
}

module.exports = { createCompleteTestData }