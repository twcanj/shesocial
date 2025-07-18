// Test admin login endpoint
const axios = require('axios');

async function testAdminLoginEndpoint() {
  try {
    console.log('Testing admin login endpoint...');
    
    const response = await axios.post('http://localhost:10000/api/admin/auth/login', {
      email: 'admin@infinitymatch.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if the response contains the expected permissions
    if (response.data.success && response.data.data && response.data.data.admin && response.data.data.admin.permissions) {
      console.log('\nPermissions check:');
      
      const permissions = response.data.data.admin.permissions;
      console.log('Permissions:', permissions);
      
      const permissionsToCheck = [
        '*',
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
      
      permissionsToCheck.forEach(permission => {
        const hasPermission = permissions.includes(permission);
        console.log(`- ${permission}: ${hasPermission ? '✅' : '❌'}`);
      });
    } else {
      console.log('No permissions found in response');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAdminLoginEndpoint();
