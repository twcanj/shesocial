// Check permission atoms in the database
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

// Path to the permission_atoms database file
const dbPath = path.join(__dirname, 'server/data/permission-atoms.db');

// Check if the file exists
if (!fs.existsSync(dbPath)) {
  console.error(`Database file not found: ${dbPath}`);
  process.exit(1);
}

// Initialize the database
const db = new Datastore({ filename: dbPath, autoload: true });

// Find all permission atoms
db.find({}, (err, docs) => {
  if (err) {
    console.error('Error querying database:', err);
    process.exit(1);
  }

  console.log(`Found ${docs.length} permission atoms:`);
  
  docs.forEach(atom => {
    console.log('\n=================================');
    console.log(`Atom ID: ${atom.atomId}`);
    console.log(`Name: ${atom.name}`);
    console.log(`Category: ${atom.category || atom.group || 'Not specified'}`);
    console.log(`Description: ${atom.description || 'Not specified'}`);
    console.log('=================================');
  });
});
