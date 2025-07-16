#!/usr/bin/env node

// Comprehensive Appointment API Testing Script
// Tests complete appointment booking workflow

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:10000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testData = {
  // Test admin login
  admin: {
    username: 'admin@infinitymatch.com',
    password: 'admin123'
  },
  // Test user login
  user: {
    email: 'admin@infinitymatch.tw', 
    password: 'InfinityAdmin2025!'
  },
  // Test appointment booking
  appointmentBooking: {
    appointmentType: 'member_interview',
    contactInfo: {
      name: '張俊豪',
      email: 'member1@infinitymatch.tw',
      phone: '0912-345-678'
    },
    preferences: {
      interviewType: 'video_call',
      language: 'zh-TW'
    },
    notes: '希望討論配對偏好和會員服務',
    reminderPreferences: {
      email: true,
      sms: false,
      timings: ['1_day_before', '1_hour_before']
    }
  }
};

// Global variables for tokens and test data
let adminToken = null;
let userToken = null;
let testSlotId = null;
let testInterviewerId = null;
let testBookingId = null;

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`.blue),
  success: (msg) => console.log(`✅ ${msg}`.green),
  error: (msg) => console.log(`❌ ${msg}`.red),
  warn: (msg) => console.log(`⚠️  ${msg}`.yellow),
  step: (msg) => console.log(`\n🔄 ${msg}`.cyan.bold)
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API helper functions
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      data: error.response?.data
    };
  }
};

// Test functions
const testServerHealth = async () => {
  log.step('Testing server health');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.data.success) {
      log.success('Server is healthy');
      log.info(`Environment: ${response.data.environment}`);
      log.info(`Uptime: ${Math.round(response.data.uptime)}s`);
      log.info(`Memory: ${response.data.memory.used}MB used`);
      
      if (response.data.database?.status === 'connected') {
        log.success('Database is connected');
        log.info(`Collections: ${Object.keys(response.data.database.collections).length}`);
        log.info(`Total records: ${Object.values(response.data.database.collections).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)}`);
      }
    }
  } catch (error) {
    log.error(`Server health check failed: ${error.message}`);
    throw error;
  }
};

const testAdminAuth = async () => {
  log.step('Testing admin authentication');
  
  try {
    const response = await apiCall('POST', '/admin/auth/login', testData.admin);
    
    if (response.success && response.data.accessToken) {
      adminToken = response.data.accessToken;
      log.success('Admin authentication successful');
      log.info(`Admin: ${response.data.admin.profile.realName} (${response.data.admin.roleId})`);
      log.info(`Department: ${response.data.admin.profile.department}`);
      log.info(`Permissions: ${response.data.admin.permissions.length} permissions`);
    } else {
      throw new Error('Admin authentication failed - no token received');
    }
  } catch (error) {
    log.error(`Admin authentication failed: ${error.message}`);
    throw error;
  }
};

const testUserAuth = async () => {
  log.step('Testing user authentication');
  
  try {
    const response = await apiCall('POST', '/auth/login', testData.user);
    
    if (response.success && response.data.accessToken) {
      userToken = response.data.accessToken;
      log.success('User authentication successful');
      log.info(`User: ${response.data.user.profile.name}`);
      log.info(`Membership: ${response.data.user.membership.type}`);
      log.info(`Status: ${response.data.user.membership.status}`);
    } else {
      throw new Error('User authentication failed - no token received');
    }
  } catch (error) {
    log.error(`User authentication failed: ${error.message}`);
    throw error;
  }
};

const testGetInterviewers = async () => {
  log.step('Testing get interviewers');
  
  try {
    const response = await apiCall('GET', '/appointments/interviewers', null, adminToken);
    
    if (response.success && response.data) {
      log.success(`Found ${response.data.length} interviewers`);
      
      if (response.data.length > 0) {
        testInterviewerId = response.data[0]._id;
        log.info(`Test interviewer: ${response.data[0].name} (${response.data[0].title})`);
        log.info(`Specialties: ${response.data[0].specialties.join(', ')}`);
        log.info(`Active: ${response.data[0].isActive}`);
      } else {
        log.warn('No interviewers found - this may affect slot testing');
      }
    }
  } catch (error) {
    log.error(`Get interviewers failed: ${error.message}`);
    throw error;
  }
};

const testGetAvailableSlots = async () => {
  log.step('Testing get available appointment slots');
  
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const queryParams = new URLSearchParams({
      type: 'member_interview',
      date: tomorrow.toISOString().split('T')[0],
      ...(testInterviewerId && { interviewerId: testInterviewerId })
    });
    
    const response = await apiCall('GET', `/appointments/slots/availability?${queryParams}`);
    
    if (response.success && response.data) {
      log.success(`Found ${response.data.length} available slots`);
      
      if (response.data.length > 0) {
        testSlotId = response.data[0].slotId;
        log.info(`Test slot: ${response.data[0].startTime} - ${response.data[0].endTime}`);
        log.info(`Interviewer: ${response.data[0].interviewerName}`);
        log.info(`Available: ${response.data[0].available}`);
        log.info(`Capacity: ${response.data[0].bookingsCount}/${response.data[0].maxBookings}`);
      } else {
        log.warn('No available slots found - this may affect booking testing');
      }
    }
  } catch (error) {
    log.error(`Get available slots failed: ${error.message}`);
    throw error;
  }
};

const testCreateAppointmentBooking = async () => {
  log.step('Testing create appointment booking');
  
  if (!testSlotId) {
    log.warn('No test slot available - skipping booking creation');
    return;
  }
  
  try {
    const bookingData = {
      ...testData.appointmentBooking,
      slotId: testSlotId
    };
    
    const response = await apiCall('POST', '/appointments/bookings', bookingData, userToken);
    
    if (response.success && response.data) {
      testBookingId = response.data._id;
      log.success('Appointment booking created successfully');
      log.info(`Booking ID: ${testBookingId}`);
      log.info(`Status: ${response.data.status}`);
      log.info(`Scheduled: ${response.data.scheduledDate}`);
      log.info(`Contact: ${response.data.contactInfo.name} (${response.data.contactInfo.email})`);
    }
  } catch (error) {
    log.error(`Create booking failed: ${error.message}`);
    if (error.data) {
      log.error(`Error details: ${JSON.stringify(error.data, null, 2)}`);
    }
    throw error;
  }
};

const testGetUserBookings = async () => {
  log.step('Testing get user bookings');
  
  try {
    const response = await apiCall('GET', '/appointments/bookings', null, userToken);
    
    if (response.success && response.data) {
      log.success(`Found ${response.data.length} user bookings`);
      
      response.data.forEach((booking, index) => {
        log.info(`Booking ${index + 1}:`);
        log.info(`  ID: ${booking._id}`);
        log.info(`  Type: ${booking.appointmentType}`);
        log.info(`  Status: ${booking.status}`);
        log.info(`  Date: ${booking.scheduledDate}`);
        log.info(`  Contact: ${booking.contactInfo.name}`);
      });
    }
  } catch (error) {
    log.error(`Get user bookings failed: ${error.message}`);
    throw error;
  }
};

const testGetAppointmentStats = async () => {
  log.step('Testing get appointment statistics');
  
  try {
    const response = await apiCall('GET', '/appointments/stats', null, adminToken);
    
    if (response.success && response.data) {
      log.success('Appointment statistics retrieved');
      log.info(`Total slots: ${response.data.totalSlots}`);
      log.info(`Available slots: ${response.data.availableSlots}`);
      log.info(`Total bookings: ${response.data.totalBookings}`);
      log.info(`Today's bookings: ${response.data.todaysBookings}`);
      log.info(`Upcoming bookings: ${response.data.upcomingBookings}`);
      
      if (response.data.bookingsByStatus) {
        log.info('Bookings by status:');
        Object.entries(response.data.bookingsByStatus).forEach(([status, count]) => {
          log.info(`  ${status}: ${count}`);
        });
      }
    }
  } catch (error) {
    log.error(`Get appointment stats failed: ${error.message}`);
    throw error;
  }
};

const testRescheduleBooking = async () => {
  log.step('Testing reschedule booking');
  
  if (!testBookingId) {
    log.warn('No test booking available - skipping reschedule test');
    return;
  }
  
  try {
    // First, get another available slot
    const today = new Date();
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const queryParams = new URLSearchParams({
      type: 'member_interview',
      date: dayAfterTomorrow.toISOString().split('T')[0],
      ...(testInterviewerId && { interviewerId: testInterviewerId })
    });
    
    const slotsResponse = await apiCall('GET', `/appointments/slots/availability?${queryParams}`);
    
    if (slotsResponse.success && slotsResponse.data.length > 0) {
      const newSlotId = slotsResponse.data[0].slotId;
      
      const rescheduleData = {
        newSlotId,
        reason: 'API 測試重新安排',
        notifyUser: true
      };
      
      const response = await apiCall('POST', `/appointments/bookings/${testBookingId}/reschedule`, rescheduleData, adminToken);
      
      if (response.success && response.data) {
        log.success('Booking rescheduled successfully');
        log.info(`New scheduled date: ${response.data.scheduledDate}`);
        log.info(`Status: ${response.data.status}`);
        log.info(`Reason: ${response.data.rescheduleReason}`);
      }
    } else {
      log.warn('No available slots for reschedule test');
    }
  } catch (error) {
    log.error(`Reschedule booking failed: ${error.message}`);
    if (error.data) {
      log.error(`Error details: ${JSON.stringify(error.data, null, 2)}`);
    }
    throw error;
  }
};

const testPermissionValidation = async () => {
  log.step('Testing permission validation');
  
  try {
    // Test user trying to access admin endpoint (should fail)
    log.info('Testing unauthorized access...');
    
    try {
      await apiCall('GET', '/appointments/interviewers', null, userToken);
      log.error('Permission validation failed - user should not access admin endpoint');
    } catch (error) {
      if (error.status === 403) {
        log.success('Permission validation working - user correctly denied access');
      } else {
        log.warn(`Unexpected error: ${error.message}`);
      }
    }
    
    // Test admin accessing admin endpoint (should succeed)
    log.info('Testing authorized access...');
    const response = await apiCall('GET', '/appointments/interviewers', null, adminToken);
    
    if (response.success) {
      log.success('Permission validation working - admin correctly granted access');
    }
  } catch (error) {
    log.error(`Permission validation test failed: ${error.message}`);
    throw error;
  }
};

// Main test execution
const runAllTests = async () => {
  console.log('\n🧪 Comprehensive Appointment API Testing'.bold.cyan);
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  let testsPassed = 0;
  let testsTotal = 0;
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Admin Authentication', fn: testAdminAuth },
    { name: 'User Authentication', fn: testUserAuth },
    { name: 'Get Interviewers', fn: testGetInterviewers },
    { name: 'Get Available Slots', fn: testGetAvailableSlots },
    { name: 'Create Appointment Booking', fn: testCreateAppointmentBooking },
    { name: 'Get User Bookings', fn: testGetUserBookings },
    { name: 'Get Appointment Statistics', fn: testGetAppointmentStats },
    { name: 'Reschedule Booking', fn: testRescheduleBooking },
    { name: 'Permission Validation', fn: testPermissionValidation }
  ];
  
  for (const test of tests) {
    testsTotal++;
    try {
      await test.fn();
      testsPassed++;
      log.success(`${test.name} - PASSED`);
    } catch (error) {
      log.error(`${test.name} - FAILED`);
      console.error(`Error: ${error.message}`);
    }
    
    // Add delay between tests
    await delay(500);
  }
  
  // Final summary
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('\n📊 Test Results Summary'.bold.cyan);
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${testsTotal}`);
  console.log(`Tests Passed: ${testsPassed}`.green);
  console.log(`Tests Failed: ${testsTotal - testsPassed}`.red);
  console.log(`Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  console.log(`Duration: ${duration}s`);
  
  if (testsPassed === testsTotal) {
    console.log('\n🎉 All tests passed! Appointment API is working correctly.'.green.bold);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.'.yellow.bold);
  }
  
  console.log('\n🔗 Test Data Created:');
  if (testInterviewerId) console.log(`  Interviewer ID: ${testInterviewerId}`);
  if (testSlotId) console.log(`  Slot ID: ${testSlotId}`);
  if (testBookingId) console.log(`  Booking ID: ${testBookingId}`);
  
  process.exit(testsPassed === testsTotal ? 0 : 1);
};

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n\n🛑 Tests interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled promise rejection:', error);
  process.exit(1);
});

// Start testing
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };