#!/usr/bin/env node
// Test admin login directly
const bcrypt = require('./server/node_modules/bcrypt')
const { AdminPermissionServiceDB } = require('./server/dist/services/AdminPermissionServiceDB.js')

async function testAdminLogin() {
  console.log('🧪 Testing admin login process...\n')
  
  try {
    const adminService = new AdminPermissionServiceDB()
    
    // Test 1: Get user by username
    console.log('1. Testing getAdminUserByUsername...')
    const user = await adminService.getAdminUserByUsername('superadmin')
    if (user) {
      console.log(`   ✅ Found user: ${user.username} (${user.email})`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Role: ${user.roleId}`)
    } else {
      console.log('   ❌ User not found!')
      return
    }
    
    // Test 2: Password verification
    console.log('\n2. Testing password verification...')
    const isValidPassword = await bcrypt.compare('SuperAdmin2025!', user.passwordHash)
    console.log(`   Password valid: ${isValidPassword ? '✅' : '❌'}`)
    
    // Test 3: Get user permissions
    console.log('\n3. Testing getUserPermissions...')
    const permissions = await adminService.getUserPermissions(user.adminId)
    console.log(`   Permission count: ${permissions.length}`)
    if (permissions.length > 0) {
      console.log(`   First few permissions: ${permissions.slice(0, 5).join(', ')}`)
    }
    
    // Test 4: Check specific permission
    console.log('\n4. Testing userHasPermission...')
    const hasAuditPermission = await adminService.userHasPermission(user.adminId, 'admin:audit')
    console.log(`   Has admin:audit permission: ${hasAuditPermission ? '✅' : '❌'}`)
    
    console.log('\n✅ All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message)
    console.error('Stack:', error.stack)
  }
}

testAdminLogin().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})