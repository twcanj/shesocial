// Fix admin permissions in the database
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

async function fixAdminPermissions() {
  try {
    console.log('Fixing admin permissions in the database...');
    
    // Path to the admin_users database file
    const dbPath = path.join(__dirname, 'server/data/admin-users.db');
    
    // Check if the file exists
    if (!fs.existsSync(dbPath)) {
      console.error(`Database file not found: ${dbPath}`);
      return;
    }
    
    // Initialize the database
    const db = new Datastore({ filename: dbPath, autoload: true });
    
    // Update the admin user with all required permissions
    const permissions = [
      '*',  // Wildcard permission
      'events:view',
      'events:create',
      'events:edit',
      'events:showcase',
      'interviews:view',
      'appointments:view',
      'admin:permissions',
      'admin:create',
      'admin:audit'
    ];
    
    await new Promise((resolve, reject) => {
      db.update(
        { email: 'admin@infinitymatch.com' },
        { $set: { permissions } },
        {},
        (err, numUpdated) => {
          if (err) reject(err);
          else resolve(numUpdated);
        }
      );
    });
    
    console.log('Admin permissions updated successfully');
    
    // Verify the update
    const adminUser = await new Promise((resolve, reject) => {
      db.findOne({ email: 'admin@infinitymatch.com' }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
    
    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }
    
    console.log('Updated admin user:');
    console.log('Admin ID:', adminUser.adminId);
    console.log('Username:', adminUser.username);
    console.log('Email:', adminUser.email);
    console.log('Permissions:', adminUser.permissions);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAdminPermissions();
