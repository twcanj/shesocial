#!/usr/bin/env node

// Admin Dashboard Test Script
// Tests the admin dashboard functionality

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:10000/api/admin';
const FRONTEND_BASE = 'http://localhost:5173';

async function testAdminSystem() {
  console.log('🧪 Testing Admin Dashboard System...\n');

  try {
    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'superadmin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    if (loginData.success) {
      console.log('✅ Admin login successful');
      console.log(`   Username: ${loginData.data.admin.username}`);
      console.log(`   Department: ${loginData.data.admin.department}`);
      console.log(`   Role: ${loginData.data.admin.roleId}`);
    } else {
      throw new Error('Admin login failed');
    }

    const token = loginData.data.accessToken;

    // Test 2: Permission Management
    console.log('\n2️⃣ Testing Permission Management...');
    const permResponse = await fetch(`${API_BASE}/permissions/atoms/grouped`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const permData = await permResponse.json();
    if (permData.success) {
      const groups = Object.keys(permData.data);
      console.log('✅ Permission atoms loaded successfully');
      console.log(`   Groups: ${groups.join(', ')}`);
      console.log(`   Total permissions: ${groups.reduce((sum, group) => sum + permData.data[group].length, 0)}`);
    } else {
      throw new Error('Permission loading failed');
    }

    // Test 3: Role Management
    console.log('\n3️⃣ Testing Role Management...');
    const rolesResponse = await fetch(`${API_BASE}/roles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const rolesData = await rolesResponse.json();
    if (rolesData.success) {
      console.log('✅ Roles loaded successfully');
      console.log(`   Available roles: ${rolesData.data.length}`);
      rolesData.data.forEach(role => {
        console.log(`   - ${role.roleId}: ${role.name} (${role.department})`);
      });
    } else {
      throw new Error('Roles loading failed');
    }

    // Test 4: Role Capabilities
    console.log('\n4️⃣ Testing Role Capabilities...');
    const capResponse = await fetch(`${API_BASE}/roles/super_admin/capabilities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const capData = await capResponse.json();
    if (capData.success) {
      console.log('✅ Role capabilities loaded successfully');
      console.log(`   Total permissions: ${capData.data.totalPermissions}`);
      console.log(`   Risk levels: ${JSON.stringify(capData.data.riskLevels)}`);
      console.log(`   Access groups: ${capData.data.canAccessGroups.join(', ')}`);
    } else {
      throw new Error('Role capabilities loading failed');
    }

    // Test 5: Frontend Accessibility
    console.log('\n5️⃣ Testing Frontend Accessibility...');
    const frontendResponse = await fetch(FRONTEND_BASE);
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible');
      console.log(`   Status: ${frontendResponse.status}`);
    } else {
      throw new Error('Frontend not accessible');
    }

    console.log('\n🎉 All admin dashboard tests passed!');
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Open http://localhost:5173 in browser');
    console.log('2. Open browser console (F12)');
    console.log('3. In console, run: window.location.hash = "#admin"');
    console.log('4. Or manually edit App.tsx currentPage to "admin"');
    console.log('5. Login with: superadmin / admin123');
    console.log('6. Test all navigation sections');
    console.log('7. Check for console errors');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAdminSystem();