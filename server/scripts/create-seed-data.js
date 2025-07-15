#!/usr/bin/env node
// Create Seed Data Script - Populates database with predefined users and data
// Run with: node server/scripts/create-seed-data.js

const bcrypt = require('bcrypt')
const path = require('path')
const fs = require('fs')

// Import our database setup
const NeDBSetup = require('../dist/db/nedb-setup').default
const { SYSTEM_USERS, ADMIN_USERS, INTERVIEWERS } = require('./seed-data')

// Import models
const { UserModel } = require('../dist/models/User')
const { InterviewerModel } = require('../dist/models/Interviewer')
const { AdminPermissionService } = require('../dist/services/AdminPermissionService')

async function createSeedData() {
  console.log('🌱 Starting seed data creation for InfinityMatch platform...\n')

  try {
    // Initialize database
    console.log('📊 Initializing database connections...')
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    console.log('✅ Database initialized successfully\n')

    // Initialize models
    const userModel = new UserModel(db.users)
    const interviewerModel = new InterviewerModel(db)
    const adminPermissionService = new AdminPermissionService()

    // Create system users
    console.log('👥 Creating system users...')
    const createdUsers = []
    
    for (const userData of SYSTEM_USERS) {
      try {
        // Hash password
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds)
        
        // Prepare user data
        const userToCreate = {
          ...userData,
          password: hashedPassword,
          _id: undefined // Let NeDB generate ID
        }

        // Create user
        const result = await userModel.create(userToCreate)
        if (result.success) {
          console.log(`  ✅ Created user: ${userData.profile.name} (${userData.email})`)
          createdUsers.push({
            ...result.data,
            originalPassword: userData.password // For logging
          })
        } else {
          console.log(`  ❌ Failed to create user ${userData.email}: ${result.error}`)
        }
      } catch (error) {
        console.log(`  ❌ Error creating user ${userData.email}: ${error.message}`)
      }
    }

    console.log(`\n✅ Created ${createdUsers.length}/${SYSTEM_USERS.length} system users\n`)

    // Create admin users
    console.log('🔐 Creating admin users...')
    const createdAdmins = []

    for (const adminData of ADMIN_USERS) {
      try {
        // Hash password
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds)
        
        // Prepare admin data
        const adminToCreate = {
          ...adminData,
          passwordHash: hashedPassword,
          password: undefined, // Remove plain password
          _id: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Create admin user through permission service
        const createdAdmin = await adminPermissionService.createAdminUser(adminToCreate)
        console.log(`  ✅ Created admin: ${adminData.profile.realName} (${adminData.username})`)
        
        createdAdmins.push({
          ...createdAdmin,
          originalPassword: adminData.password // For logging
        })
      } catch (error) {
        console.log(`  ❌ Error creating admin ${adminData.username}: ${error.message}`)
      }
    }

    console.log(`\n✅ Created ${createdAdmins.length}/${ADMIN_USERS.length} admin users\n`)

    // Create interviewers (using admin user IDs)
    console.log('🎯 Creating interviewer profiles...')
    const createdInterviewers = []

    // Create interviewer resources (managed by operations staff, not system users)
    for (let i = 0; i < INTERVIEWERS.length; i++) {
      try {
        const interviewerTemplate = INTERVIEWERS[i]
        
        const interviewerData = {
          ...interviewerTemplate,
          userId: null, // 面試官不是系統用戶，由營運人員管理
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

    // Generate login credentials summary
    console.log('📋 LOGIN CREDENTIALS SUMMARY')
    console.log('=' * 50)
    
    console.log('\n🔐 ADMIN USERS:')
    createdAdmins.forEach(admin => {
      console.log(`  👤 ${admin.profile.realName}`)
      console.log(`     Email: ${admin.email}`)
      console.log(`     Username: ${admin.username}`)
      console.log(`     Password: ${admin.originalPassword}`)
      console.log(`     Role: ${admin.roleId}`)
      console.log(`     Department: ${admin.profile.department}`)
      console.log('')
    })

    console.log('\n👥 PLATFORM USERS:')
    createdUsers.forEach(user => {
      console.log(`  👤 ${user.profile.name}`)
      console.log(`     Email: ${user.email}`)
      console.log(`     Password: ${user.originalPassword}`)
      console.log(`     Membership: ${user.membership.type}`)
      console.log(`     Status: ${user.membership.status}`)
      console.log(`     Can View Participants: ${user.membership.permissions.viewParticipants}`)
      console.log('')
    })

    console.log('\n🎯 INTERVIEWERS:')
    createdInterviewers.forEach(interviewer => {
      console.log(`  👤 ${interviewer.name}`)
      console.log(`     Title: ${interviewer.title}`)
      console.log(`     Email: ${interviewer.email}`)
      console.log(`     Specialties: ${interviewer.specialties.join(', ')}`)
      console.log(`     Active: ${interviewer.isActive}`)
      console.log('')
    })

    console.log('\n🚀 NEXT STEPS:')
    console.log('1. Start the server: npm run dev:server')
    console.log('2. Login to admin panel with admin credentials')
    console.log('3. Create appointment slots using the interviewer IDs')
    console.log('4. Test the booking system with different user types')
    console.log('')
    console.log('🌟 Seed data creation completed successfully!')

  } catch (error) {
    console.error('❌ Fatal error during seed data creation:', error)
    process.exit(1)
  }
}

// Main execution
if (require.main === module) {
  createSeedData()
    .then(() => {
      console.log('\n✅ Seed data creation process finished.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Seed data creation failed:', error)
      process.exit(1)
    })
}

module.exports = { createSeedData }