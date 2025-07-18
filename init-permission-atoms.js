// Initialize permission atoms
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

// Define default permission atoms
const defaultAtoms = [
  {
    atomId: 'system.overview',
    name: 'System Overview',
    description: 'Access to system overview and dashboard',
    group: 'system',
    action: 'view',
    riskLevel: 'low',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'events:view',
    name: 'View Events',
    description: 'View events and activities',
    group: 'events',
    action: 'view',
    riskLevel: 'low',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'events:create',
    name: 'Create Events',
    description: 'Create new events',
    group: 'events',
    action: 'create',
    riskLevel: 'medium',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'events:edit',
    name: 'Edit Events',
    description: 'Edit existing events',
    group: 'events',
    action: 'edit',
    riskLevel: 'medium',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'events:showcase',
    name: 'Manage Event Showcase',
    description: 'Manage event showcase',
    group: 'events',
    action: 'showcase',
    riskLevel: 'medium',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'interviews:view',
    name: 'View Interviews',
    description: 'View interview schedules and results',
    group: 'interviews',
    action: 'view',
    riskLevel: 'low',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'appointments:view',
    name: 'View Appointments',
    description: 'View appointment schedules',
    group: 'appointments',
    action: 'view',
    riskLevel: 'low',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'admin:permissions',
    name: 'Manage Permissions',
    description: 'Manage system permissions',
    group: 'admin',
    action: 'permissions',
    riskLevel: 'high',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'admin:create',
    name: 'Create Admin Users',
    description: 'Create new admin users',
    group: 'admin',
    action: 'create',
    riskLevel: 'high',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  },
  {
    atomId: 'admin:audit',
    name: 'View Audit Logs',
    description: 'View system audit logs',
    group: 'admin',
    action: 'audit',
    riskLevel: 'medium',
    department: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    createdBy: 'system'
  }
];

// Insert permission atoms
db.insert(defaultAtoms, (err, docs) => {
  if (err) {
    console.error('Error inserting permission atoms:', err);
    process.exit(1);
  }

  console.log(`Inserted ${docs.length} permission atoms`);
  
  // Verify the insertion
  db.find({}, (err, allDocs) => {
    if (err) {
      console.error('Error querying database:', err);
      process.exit(1);
    }

    console.log(`\nTotal permission atoms in database: ${allDocs.length}`);
    
    allDocs.forEach(atom => {
      console.log(`- ${atom.atomId}: ${atom.name}`);
    });
  });
});
