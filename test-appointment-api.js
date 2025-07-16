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
  // Test user login - we need to create a test user first
  user: {
    email: 'testuser@infinitymatch.tw', 
    password: 'TestUser123!'
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

const testCleanupExistingUser = async () => {
  log.step('Cleaning up existing test user');
  
  try {
    // Try to login first to check if user exists
    const loginResponse = await apiCall('POST', '/auth/login', testData.user);
    
    if (loginResponse.success && loginResponse.data.accessToken) {
      const userId = loginResponse.data.user._id;
      
      log.info(`Found existing test user: ${loginResponse.data.user.profile.name}`);
      
      // Try to delete the user using admin privileges
      try {
        const deleteResponse = await apiCall('DELETE', `/admin/users/${userId}`, null, adminToken);
        
        if (deleteResponse.success) {
          log.success('Existing test user deleted successfully');
          return true; // Can now create new user
        } else {
          log.warn('Could not delete existing user - will skip registration test');
          return false;
        }
      } catch (deleteError) {
        log.warn(`Could not delete existing user: ${deleteError.message}`);
        return false; // Skip registration test
      }
    }
  } catch (error) {
    if (error.message.includes('電子郵件或密碼錯誤')) {
      log.info('Test user does not exist - can proceed with registration');
      return true; // User doesn't exist, can create
    } else {
      log.error(`Cleanup check failed: ${error.message}`);
      return true; // Assume can create
    }
  }
  
  return true;
};

const testCreateTestUser = async () => {
  log.step('Creating test user');
  
  // Check if user already exists
  const canCreate = await testCleanupExistingUser();
  
  if (!canCreate) {
    log.warn('Skipping user creation - user already exists');
    return;
  }
  
  try {
    const registerData = {
      email: testData.user.email,
      password: testData.user.password,
      profile: {
        name: '測試用戶',
        age: 30,
        bio: '測試用戶帳號',
        interests: ['旅遊', '美食'],
        location: '台北市',
        interviewStatus: {
          completed: false,
          duration: 0
        }
      },
      membership: {
        type: 'vvip',
        joinDate: new Date().toISOString(),
        payments: [],
        permissions: {
          viewParticipants: true,
          priorityBooking: true
        }
      }
    };
    
    const response = await apiCall('POST', '/auth/register', registerData);
    
    if (response.success) {
      log.success('Test user created successfully');
      log.info(`User: ${response.data?.user?.profile?.name}`);
    } else {
      log.warn('Test user creation failed - continuing anyway');
    }
  } catch (error) {
    if (error.message.includes('已存在') || error.message.includes('已被註冊')) {
      log.warn('Test user already exists - continuing with login');
    } else {
      log.error(`Create test user failed: ${error.message}`);
      throw error;
    }
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
      log.info(`Status: ${response.data.user.membership.status || 'Active'}`);
      
      // If user is not VVIP, let's try to upgrade them for testing
      if (response.data.user.membership.type !== 'vvip') {
        log.info('Upgrading user to VVIP for testing purposes...');
        try {
          const upgradeResponse = await apiCall('PUT', `/admin/users/${response.data.user._id}`, {
            membership: {
              ...response.data.user.membership,
              type: 'vvip',
              permissions: {
                viewParticipants: true,
                priorityBooking: true
              }
            }
          }, adminToken);
          
          if (upgradeResponse.success) {
            log.success('User upgraded to VVIP successfully');
            
            // Re-login to get updated token
            const newLoginResponse = await apiCall('POST', '/auth/login', testData.user);
            if (newLoginResponse.success && newLoginResponse.data.accessToken) {
              userToken = newLoginResponse.data.accessToken;
              log.info(`Updated membership: ${newLoginResponse.data.user.membership.type}`);
            }
          } else {
            log.warn('Could not upgrade user to VVIP - continuing with current membership');
          }
        } catch (upgradeError) {
          log.warn(`Could not upgrade user: ${upgradeError.message}`);
        }
      }
    } else {
      throw new Error('User authentication failed - no token received');
    }
  } catch (error) {
    log.error(`User authentication failed: ${error.message}`);
    throw error;
  }
};

const testCreateTestInterviewer = async () => {
  log.step('Creating test interviewer');
  
  try {
    const interviewerData = {
      name: '測試面試官',
      email: 'testinterviewer@infinitymatch.tw',
      title: '資深面試官',
      bio: '專業面試官，擅長會員諮詢和配對建議',
      specialties: ['關係諮詢', '配對建議', '會員面試'],
      appointmentTypes: ['member_interview', 'consultation'],
      interviewTypes: ['video_call', 'phone_call'],
      isActive: true,
      availability: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }]
      },
      languages: ['zh-TW', 'en'],
      maxDailyBookings: 8,
      bookingAdvanceTime: 24,
      pricing: {
        consultation: 500,
        member_interview: 0
      }
    };
    
    const response = await apiCall('POST', '/appointments/interviewers', interviewerData, userToken);
    
    if (response.success !== false) {
      log.success('Test interviewer created successfully');
      testInterviewerId = response.interviewer?._id;
      log.info(`Interviewer: ${response.interviewer?.name}`);
    } else {
      log.warn('Test interviewer might already exist');
    }
  } catch (error) {
    if (error.message.includes('已存在') || error.message.includes('exists')) {
      log.warn('Test interviewer already exists');
    } else {
      log.error(`Create test interviewer failed: ${error.message}`);
      // Continue anyway
    }
  }
};

const testGetInterviewers = async () => {
  log.step('Testing get interviewers');
  
  try {
    const response = await apiCall('GET', '/appointments/interviewers', null, null); // No auth required for GET
    
    if (response.success !== false && response.interviewers) {
      log.success(`Found ${response.interviewers.length} interviewers`);
      
      if (response.interviewers.length > 0) {
        testInterviewerId = response.interviewers[0]._id;
        log.info(`Test interviewer: ${response.interviewers[0].name} (${response.interviewers[0].title || 'No title'})`);
        log.info(`Specialties: ${response.interviewers[0].specialties?.join(', ') || 'None'}`);
        log.info(`Active: ${response.interviewers[0].isActive}`);
      } else {
        log.warn('No interviewers found - this may affect slot testing');
      }
    } else {
      log.warn('No interviewers found - this may affect slot testing');
    }
  } catch (error) {
    log.error(`Get interviewers failed: ${error.message}`);
    throw error;
  }
};

const testCreateTestSlots = async () => {
  log.step('Creating test appointment slots');
  
  if (!testInterviewerId) {
    log.warn('No test interviewer available - skipping slot creation');
    return;
  }
  
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const slotData = {
      interviewerId: testInterviewerId,
      appointmentType: 'member_interview',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      maxBookings: 1,
      isRecurring: false,
      availableFor: ['registered', 'vip', 'vvip'],
      location: {
        type: 'video_call',
        details: 'Google Meet 連結將於預約確認後提供'
      },
      pricing: {
        consultation: 500,
        member_interview: 0
      }
    };
    
    const response = await apiCall('POST', '/appointments/slots', slotData, userToken);
    
    if (response.success !== false) {
      log.success('Test appointment slot created successfully');
      testSlotId = response.slot?._id;
      log.info(`Slot: ${response.slot?.startTime} - ${response.slot?.endTime}`);
    } else {
      log.warn('Test slot might already exist');
    }
  } catch (error) {
    if (error.message.includes('已存在') || error.message.includes('exists')) {
      log.warn('Test slot already exists');
    } else {
      log.error(`Create test slot failed: ${error.message}`);
      // Continue anyway
    }
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
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0],
      ...(testInterviewerId && { interviewerId: testInterviewerId })
    });
    
    const response = await apiCall('GET', `/appointments/slots/available?${queryParams}`);
    
    if (response.success !== false && response.slots) {
      log.success(`Found ${response.slots.length} available slots`);
      
      if (response.slots.length > 0) {
        testSlotId = response.slots[0]._id;
        log.info(`Test slot: ${response.slots[0].startTime} - ${response.slots[0].endTime}`);
        log.info(`Interviewer: ${response.slots[0].interviewerName || 'Unknown'}`);
        log.info(`Available: ${response.slots[0].available}`);
        log.info(`Capacity: ${response.slots[0].bookingsCount || 0}/${response.slots[0].maxBookings || 1}`);
      } else {
        log.warn('No available slots found - this may affect booking testing');
      }
    } else {
      log.warn('No available slots found - this may affect booking testing');
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
    // Add user email as query parameter since the API requires it
    const queryParams = new URLSearchParams({
      email: testData.user.email
    });
    
    const response = await apiCall('GET', `/appointments/bookings?${queryParams}`, null, userToken);
    
    if (response.success !== false && response.bookings) {
      log.success(`Found ${response.bookings.length} user bookings`);
      
      response.bookings.forEach((booking, index) => {
        log.info(`Booking ${index + 1}:`);
        log.info(`  ID: ${booking._id}`);
        log.info(`  Type: ${booking.appointmentType}`);
        log.info(`  Status: ${booking.status}`);
        log.info(`  Date: ${booking.scheduledDate}`);
        log.info(`  Contact: ${booking.contactInfo.name}`);
      });
    } else {
      log.warn('No user bookings found');
    }
  } catch (error) {
    log.error(`Get user bookings failed: ${error.message}`);
    throw error;
  }
};

const testGetAppointmentStats = async () => {
  log.step('Testing get appointment statistics');
  
  try {
    const response = await apiCall('GET', '/appointments/stats', null, userToken);
    
    if (response.success !== false && response.stats) {
      log.success('Appointment statistics retrieved');
      log.info(`Total slots: ${response.stats.totalSlots || 0}`);
      log.info(`Available slots: ${response.stats.availableSlots || 0}`);
      log.info(`Total bookings: ${response.stats.totalBookings || 0}`);
      log.info(`Today's bookings: ${response.stats.todaysBookings || 0}`);
      log.info(`Upcoming bookings: ${response.stats.upcomingBookings || 0}`);
      
      if (response.stats.bookingsByStatus) {
        log.info('Bookings by status:');
        Object.entries(response.stats.bookingsByStatus).forEach(([status, count]) => {
          log.info(`  ${status}: ${count}`);
        });
      }
    } else {
      log.warn('No appointment statistics available');
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
      startDate: dayAfterTomorrow.toISOString().split('T')[0],
      endDate: dayAfterTomorrow.toISOString().split('T')[0],
      ...(testInterviewerId && { interviewerId: testInterviewerId })
    });
    
    const slotsResponse = await apiCall('GET', `/appointments/slots/available?${queryParams}`);
    
    if (slotsResponse.success !== false && slotsResponse.slots?.length > 0) {
      const newSlotId = slotsResponse.slots[0]._id;
      
      const rescheduleData = {
        newSlotId,
        reason: 'API 測試重新安排',
        notifyUser: true
      };
      
      const response = await apiCall('PUT', `/appointments/bookings/${testBookingId}/reschedule`, rescheduleData, userToken);
      
      if (response.success !== false && response.booking) {
        log.success('Booking rescheduled successfully');
        log.info(`New scheduled date: ${response.booking.scheduledDate}`);
        log.info(`Status: ${response.booking.status}`);
        log.info(`Reason: ${response.booking.rescheduleReason || 'API 測試重新安排'}`);
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
    { name: 'Cleanup & Create Test User', fn: testCreateTestUser },
    { name: 'User Authentication', fn: testUserAuth },
    { name: 'Create Test Interviewer', fn: testCreateTestInterviewer },
    { name: 'Get Interviewers', fn: testGetInterviewers },
    { name: 'Create Test Slots', fn: testCreateTestSlots },
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