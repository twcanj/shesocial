// Update admin user with permissions
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

// Path to the admin_users database file
const dbPath = path.join(__dirname, 'server/data/admin-users.db');

// Check if the file exists
if (!fs.existsSync(dbPath)) {
  console.error(`Database file not found: ${dbPath}`);
  process.exit(1);
}

// Initialize the database
const db = new Datastore({ filename: dbPath, autoload: true });

// Update the admin user with permissions
db.update(
  { email: 'admin@infinitymatch.com' },
  { $set: { permissions: ['*'] } },
  {},
  (err, numUpdated) => {
    if (err) {
      console.error('Error updating admin user:', err);
      process.exit(1);
    }

    console.log(`Updated ${numUpdated} admin user(s) with permissions`);
    
    // Verify the update
    db.findOne({ email: 'admin@infinitymatch.com' }, (err, doc) => {
      if (err) {
        console.error('Error querying database:', err);
        process.exit(1);
      }

      if (doc) {
        console.log('\nUpdated admin user:');
        console.log('=================================');
        console.log(`Admin ID: ${doc.adminId}`);
        console.log(`Username: ${doc.username}`);
        console.log(`Email: ${doc.email}`);
        console.log(`Role ID: ${doc.roleId}`);
        console.log(`Department: ${doc.department || 'Not specified'}`);
        console.log(`Status: ${doc.status}`);
        
        if (doc.permissions) {
          console.log(`Permissions: ${doc.permissions.length}`);
          console.log(doc.permissions);
        } else {
          console.log('Permissions: None or not specified');
        }
        
        console.log('=================================');
      } else {
        console.log('Admin user not found');
      }
    });
  }
);
