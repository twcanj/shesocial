// Test admin permissions API
const axios = require('axios');

async function testAdminPermissions() {
  try {
    console.log('Testing admin login...');
    
    // Login to get token
    const loginResponse = await axios.post('http://localhost:10000/api/admin/auth/login', {
      email: 'admin@infinitymatch.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!loginResponse.data.success) {
      console.error('Login failed:', loginResponse.data);
      return;
    }
    
    console.log('Login successful!');
    
    const token = loginResponse.data.data.accessToken;
    
    // Check permissions
    console.log('\nChecking permissions...');
    
    const permissionsResponse = await axios.get('http://localhost:10000/api/admin/debug/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!permissionsResponse.data.success) {
      console.error('Failed to check permissions:', permissionsResponse.data);
      return;
    }
    
    console.log('Permissions check successful!');
    console.log('Admin user:', permissionsResponse.data.data.username);
    console.log('Direct permissions:', permissionsResponse.data.data.directPermissions);
    console.log('Role permissions:', permissionsResponse.data.data.rolePermissions);
    console.log('Custom permissions:', permissionsResponse.data.data.customPermissions);
    
    console.log('\nPermission checks:');
    const permissionChecks = permissionsResponse.data.data.permissionChecks;
    Object.keys(permissionChecks).forEach(permission => {
      console.log(`- ${permission}: ${permissionChecks[permission] ? '✅' : '❌'}`);
    });
    
    // Test all endpoints
    const endpoints = [
      { name: 'Events', url: 'http://localhost:10000/api/admin/events', permission: 'events:view' },
      { name: 'Interviews', url: 'http://localhost:10000/api/admin/interviews', permission: 'interviews:view' },
      { name: 'Appointments', url: 'http://localhost:10000/api/admin/appointments', permission: 'appointments:view' }
    ];
    
    console.log('\nTesting endpoints:');
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\nTesting ${endpoint.name} endpoint...`);
        
        const response = await axios.get(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`${endpoint.name} endpoint successful!`);
        console.log(`${endpoint.name} data:`, response.data);
      } catch (error) {
        console.error(`Failed to get ${endpoint.name.toLowerCase()}:`, error.response ? error.response.data : error.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAdminPermissions();
