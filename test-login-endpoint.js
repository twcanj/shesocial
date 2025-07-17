#!/usr/bin/env node
// Test the exact login endpoint flow
const bcrypt = require('./server/node_modules/bcrypt')
const { AdminPermissionServiceDB } = require('./server/dist/services/AdminPermissionServiceDB.js')

async function testLoginEndpoint() {
  console.log('🔍 Testing login endpoint logic...\n')
  
  const username = 'superadmin'
  const password = 'SuperAdmin2025!'
  
  try {
    const adminPermissionService = new AdminPermissionServiceDB()
    
    console.log(`Attempting login with username: ${username}`)
    
    // Step 1: Look up admin user from database (mimicking the endpoint)
    let adminUser = null
    try {
      // Try to find by username first, then by email
      adminUser = await adminPermissionService.getAdminUserByUsername(username)
      console.log(`   Username lookup result: ${adminUser ? '✅ Found' : '❌ Not found'}`)
      
      if (!adminUser) {
        // Try email lookup if username failed
        const allUsers = await adminPermissionService.getAllAdminUsers()
        console.log(`   Found ${allUsers.length} total users`)
        adminUser = allUsers.find(user => user.email === username) || null
        console.log(`   Email lookup result: ${adminUser ? '✅ Found' : '❌ Not found'}`)
      }
    } catch (error) {
      console.error('   ❌ Error looking up admin user:', error.message)
      return
    }

    if (!adminUser) {
      console.log('   ❌ Final result: Admin user not found')
      return
    }
    
    console.log(`   ✅ Found admin user: ${adminUser.username}`)

    // Step 2: Validate password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash)
    console.log(`   Password validation: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`)
    
    if (!isValidPassword) {
      console.log('   ❌ Final result: Invalid password')
      return
    }

    // Step 3: Check if admin is active
    if (adminUser.status !== 'active') {
      console.log(`   ❌ Final result: Admin account status is ${adminUser.status}`)
      return
    }
    
    console.log(`   ✅ Admin status: ${adminUser.status}`)

    // Step 4: Get permissions
    const permissions = await adminPermissionService.getUserPermissions(adminUser.adminId)
    console.log(`   ✅ Retrieved ${permissions.length} permissions`)

    console.log('\n🎉 Login should succeed! All checks passed.')
    
  } catch (error) {
    console.error('❌ Error during login test:', error.message)
    console.error('Stack:', error.stack)
  }
}

testLoginEndpoint().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})