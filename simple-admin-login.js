// Simple admin login script
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function simpleAdminLogin() {
  try {
    console.log('Simulating admin login...');
    
    const email = 'admin@infinitymatch.com';
    const password = 'admin123';
    
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
      db.findOne({ email }, (err, doc) => {
        if (err) reject(err);
        else resolve(doc);
      });
    });
    
    if (!adminUser) {
      console.error('Admin user not found in database');
      return;
    }
    
    console.log('Admin user found:', adminUser.username);
    
    // Check if the password is correct
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.error('Invalid password');
      return;
    }
    
    // Check if admin is active
    if (adminUser.status !== 'active') {
      console.error('Admin account is suspended or inactive');
      return;
    }
    
    // Generate tokens
    const ADMIN_JWT_SECRET = 'admin_jwt_secret_key_should_be_secure';
    const ADMIN_JWT_EXPIRES_IN = '8h';
    
    const accessToken = jwt.sign(
      {
        adminId: adminUser.adminId,
        username: adminUser.username,
        roleId: adminUser.roleId,
        department: adminUser.department || 'admin'
      },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES_IN }
    );
    
    console.log('\nGenerated access token:', accessToken);
    
    // Decode the token to verify its contents
    const decoded = jwt.verify(accessToken, ADMIN_JWT_SECRET);
    console.log('\nDecoded token:', decoded);
    
    // Path to the admin_roles database file
    const roleDbPath = path.join(__dirname, 'server/data/admin-roles.db');
    if (!fs.existsSync(roleDbPath)) {
      console.error(`Role database file not found: ${roleDbPath}`);
      return;
    }
    
    const roleDb = new Datastore({ filename: roleDbPath, autoload: true });
    
    // Find the admin role
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
    
    console.log('\nAdmin role found:', adminRole.name);
    console.log('Role permissions:', adminRole.permissions);
    
    // Combine permissions from role and user
    const permissions = [
      ...(adminRole.permissions || []),
      ...(adminUser.permissions || [])
    ];
    
    console.log('\nCombined permissions:', permissions);
    
    // Create the response object
    const response = {
      success: true,
      data: {
        admin: {
          adminId: adminUser.adminId,
          username: adminUser.username,
          email: adminUser.email,
          roleId: adminUser.roleId,
          department: adminUser.department || 'admin',
          status: adminUser.status,
          permissions: permissions
        },
        accessToken,
        expiresIn: ADMIN_JWT_EXPIRES_IN
      }
    };
    
    console.log('\nResponse data:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

simpleAdminLogin();
