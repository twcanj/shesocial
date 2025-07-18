// Fix admin permissions immediately
const NeDB = require('nedb')
const path = require('path')
const bcrypt = require('bcrypt')

// Load databases
const adminUsersDB = new NeDB({ 
  filename: path.join(__dirname, 'data/admin_users.db'), 
  autoload: true 
})

console.log('🔧 Fixing admin permissions...')

// First, let's see what we have
adminUsersDB.find({}, async (err, docs) => {
  if (err) {
    console.error('❌ Error:', err)
    return
  }
  
  console.log(`📊 Found ${docs.length} admin users`)
  
  if (docs.length === 0) {
    console.log('🆕 No admin users found. Creating super admin...')
    
    // Create super admin
    const superAdmin = {
      _id: 'admin-super-001',
      adminId: 'admin-super-001', 
      username: 'admin',
      email: 'admin@infinitymatch.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      roleId: 'super-admin-role-001',
      department: 'admin',
      status: 'active',
      permissions: ['*'], // Super admin
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        createdBy: 'system',
        isSystemAdmin: true,
        isSuperAdmin: true
      }
    }
    
    adminUsersDB.insert(superAdmin, (err, doc) => {
      if (err) {
        console.error('❌ Failed to create super admin:', err)
      } else {
        console.log('✅ Super admin created successfully!')
        console.log('   Email: admin@infinitymatch.com')
        console.log('   Password: admin123')
        console.log('   Permissions:', doc.permissions)
      }
      process.exit(0)
    })
  } else {
    // Update existing users to have super admin permissions
    console.log('🔧 Updating existing admin users...')
    
    docs.forEach(user => {
      console.log(`\n👤 Updating user: ${user.email}`)
      console.log('   Current permissions:', user.permissions)
      
      adminUsersDB.update(
        { _id: user._id },
        { $set: { permissions: ['*'] } },
        {},
        (err, numReplaced) => {
          if (err) {
            console.error(`❌ Failed to update ${user.email}:`, err)
          } else {
            console.log(`✅ Updated ${user.email} to super admin (*)`)
          }
        }
      )
    })
    
    setTimeout(() => {
      console.log('\n🎉 All admin users updated to super admin permissions!')
      process.exit(0)
    }, 1000)
  }
})