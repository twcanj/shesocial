// Check admin roles and their permissions
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

// Path to the admin_roles database file
const dbPath = path.join(__dirname, 'server/data/admin-roles.db');

// Check if the file exists
if (!fs.existsSync(dbPath)) {
  console.error(`Database file not found: ${dbPath}`);
  process.exit(1);
}

// Initialize the database
const db = new Datastore({ filename: dbPath, autoload: true });

// Find all admin roles
db.find({}, (err, docs) => {
  if (err) {
    console.error('Error querying database:', err);
    process.exit(1);
  }

  console.log(`Found ${docs.length} admin roles:`);
  
  docs.forEach(role => {
    console.log('\n=================================');
    console.log(`Role ID: ${role.roleId}`);
    console.log(`Name: ${role.name}`);
    console.log(`Department: ${role.department || 'Not specified'}`);
    console.log(`Status: ${role.status || (role.isActive ? 'active' : 'inactive')}`);
    
    if (role.permissions) {
      console.log(`Permissions: ${role.permissions.length}`);
      console.log(role.permissions);
    } else {
      console.log('Permissions: None or not specified');
    }
    
    console.log('=================================');
  });
});
