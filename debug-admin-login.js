// Debug admin login by checking the database directly
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

async function debugAdminLogin() {
  try {
    console.log('Debugging admin login...');
    
    // Path to the admin_users database file
    const dbPath = path.join(__dirname, 'server/data/admin-users.db');
    
    // Check if the file exists
    if (!fs.existsSync(dbPath)) {
      console.error(`Database file not found: ${dbPath}`);
      return;
    }
    
    // Initialize the database
    const db = new Datastore({ filename: dbPath, autoload: true });
    
    // Find the admin user
    const adminUser = await new Promise((resolve, reject) => {
      db.findOne({ email: 'admin@infinitymatch.com' }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
    
    if (!adminUser) {
      console.error('Admin user not found in database');
      return;
    }
    
    console.log('Admin user found:');
    console.log('Admin ID:', adminUser.adminId);
    console.log('Username:', adminUser.username);
    console.log('Email:', adminUser.email);
    console.log('Role ID:', adminUser.roleId);
    console.log('Department:', adminUser.department || 'Not specified');
    console.log('Status:', adminUser.status);
    console.log('Password hash:', adminUser.passwordHash);
    
    // Check if the password is correct
    const password = 'admin123';
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    console.log('Password valid:', isValidPassword);
    
    // Check permissions
    if (adminUser.permissions) {
      console.log('Permissions:', adminUser.permissions);
    } else {
      console.log('Permissions: None or not specified');
    }
    
    // Check the admin role
    const roleDbPath = path.join(__dirname, 'server/data/admin-roles.db');
    if (!fs.existsSync(roleDbPath)) {
      console.error(`Role database file not found: ${roleDbPath}`);
      return;
    }
    
    const roleDb = new Datastore({ filename: roleDbPath, autoload: true });
    
    const adminRole = await new Promise((resolve, reject) => {
      roleDb.findOne({ roleId: adminUser.roleId }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
    
    if (!adminRole) {
      console.error('Admin role not found in database');
      return;
    }
    
    console.log('\nAdmin role found:');
    console.log('Role ID:', adminRole.roleId);
    console.log('Name:', adminRole.name);
    console.log('Department:', adminRole.department || 'Not specified');
    console.log('Status:', adminRole.status || (adminRole.isActive ? 'active' : 'inactive'));
    
    if (adminRole.permissions) {
      console.log('Role permissions:', adminRole.permissions);
    } else {
      console.log('Role permissions: None or not specified');
    }
    
    // Create a new admin user with a new password
    const newPasswordHash = await bcrypt.hash('admin123', 10);
    
    // Update the admin user with a new password
    await new Promise((resolve, reject) => {
      db.update(
        { email: 'admin@infinitymatch.com' },
        { $set: { 
          passwordHash: newPasswordHash,
          permissions: ['*'] // Ensure the admin has wildcard permission
        }},
        {},
        (err, numUpdated) => {
          if (err) reject(err);
          else resolve(numUpdated);
        }
      );
    });
    
    console.log('\nAdmin user updated with new password and permissions');
    
    // Verify the update
    const updatedAdminUser = await new Promise((resolve, reject) => {
      db.findOne({ email: 'admin@infinitymatch.com' }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
    
    console.log('\nUpdated admin user:');
    console.log('Admin ID:', updatedAdminUser.adminId);
    console.log('Username:', updatedAdminUser.username);
    console.log('Email:', updatedAdminUser.email);
    console.log('Password hash:', updatedAdminUser.passwordHash);
    
    if (updatedAdminUser.permissions) {
      console.log('Permissions:', updatedAdminUser.permissions);
    } else {
      console.log('Permissions: None or not specified');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugAdminLogin();
