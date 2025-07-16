// API Routes Configuration
import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { EventController } from '../controllers/EventController'
import { BookingController } from '../controllers/BookingController'
import NeDBSetup from '../db/nedb-setup'
import { UserModel } from '../models/User'
import { EventModel } from '../models/Event'
import { BookingModel } from '../models/Booking'
import authRoutes from './auth'
import { createAppointmentRoutes } from './appointments'
import { authenticateToken, requireMembership, requirePermission, AuthenticatedRequest } from '../middleware/auth'
import { UserProfile, SalesLead } from '../types/database'

// Initialize database and models (singleton)
const dbSetup = NeDBSetup.getInstance()
const databases = dbSetup.getDatabases()

const userModel = new UserModel(databases.users)
const eventModel = new EventModel(databases.events)
const bookingModel = new BookingModel(databases.bookings)

// Initialize controllers
const userController = new UserController(userModel)
const eventController = new EventController(eventModel)
const bookingController = new BookingController(bookingModel)

const router = Router()

// Authentication routes
router.use('/auth', authRoutes)

// Appointment system routes
router.use('/appointments', createAppointmentRoutes(databases))

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SheSocial API is running',
    timestamp: Date.now(),
    version: '1.0.0'
  })
})

// Database stats endpoint
router.get('/stats', async (req, res) => {
  try {
    const stats = await dbSetup.getStats()
    res.json({
      success: true,
      data: stats,
      timestamp: Date.now()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get database stats',
      timestamp: Date.now()
    })
  }
})

// Complete user registration with profile data (sales-optimized flow)
router.post('/users/complete-registration', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { profile, salesLead } = req.body
    const userId = req.userId!

    // Update user profile
    const profileUpdate = {
      profile: {
        ...profile,
        phone: profile.phone || '',
        occupation: profile.occupation || ''
      },
      'membership.leadSource': salesLead?.leadSource || 'website',
      'membership.salesNotes': `Registration completed - Interest: ${salesLead?.membershipInterest || 'unknown'} - Expectations: ${salesLead?.expectations || 'none'}`,
      'membership.status': 'profile_completed',
      updatedAt: new Date()
    }

    const result = await userModel.update(userId, profileUpdate)

    if (result.success) {
      // Create sales lead record for tracking
      const leadData: Partial<SalesLead> = {
        userId,
        userEmail: (await userModel.findById(userId)).data?.email || '',
        userName: profile.name,
        leadSource: salesLead?.leadSource || 'website',
        leadStatus: 'new',
        membershipInterest: salesLead?.membershipInterest || 'regular',
        profileCompleteness: salesLead?.profileCompleteness || 85,
        lastActivity: new Date(),
        salesNotes: [
          `Profile completed on ${new Date().toLocaleDateString('zh-TW')}`,
          `Membership interest: ${salesLead?.membershipInterest || 'unknown'}`,
          `Expectations: ${salesLead?.expectations || 'none'}`,
          `Lead source: ${salesLead?.leadSource || 'website'}`
        ],
        estimatedValue: salesLead?.membershipInterest === 'vvip' ? 2500 :
          salesLead?.membershipInterest === 'vip' ? 1300 :
            salesLead?.membershipInterest === 'registered' ? 0 : 0,
        conversionProbability: 75, // High since they completed profile
        contactHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save sales lead (in production, this would go to a sales CRM)
      console.log('Sales Lead Created:', leadData)

      res.json({
        success: true,
        message: '個人資料完成，準備進入付費流程',
        data: result.data,
        timestamp: Date.now()
      })
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Complete registration error:', error)
    res.status(500).json({
      success: false,
      error: '完成註冊失敗',
      timestamp: Date.now()
    })
  }
})

// Get personalized membership recommendation
router.get('/users/recommendation', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!
    const userResult = await userModel.findById(userId)

    if (!userResult.success || !userResult.data) {
      res.status(404).json({
        success: false,
        error: '用戶不存在',
        timestamp: Date.now()
      })
      return
    }

    const user = userResult.data

    // Generate recommendation based on user data
    const recommendation = generatePersonalizedRecommendation(user)

    res.json({
      success: true,
      data: recommendation,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Recommendation error:', error)
    res.status(500).json({
      success: false,
      error: '生成推薦失敗',
      timestamp: Date.now()
    })
  }
})

// Helper function to generate personalized recommendation
function generatePersonalizedRecommendation(user: UserProfile) {
  const score = {
    registered: 0,
    vip: 0,
    vvip: 0
  }

  const reasons: string[] = []
  const alternatives: { plan: string; reason: string }[] = []

  // Age-based recommendations
  const age = user.profile?.age || 25
  if (age >= 25 && age <= 35) {
    score.vip += 30
    score.vvip += 20
    reasons.push('您的年齡層通常偏好靈活的券包方案')
  } else if (age > 35) {
    score.vvip += 40
    score.vip += 30
    reasons.push('成熟族群重視查看參與者和優質服務')
  } else {
    score.registered += 30
    score.vip += 20
    reasons.push('年輕族群可從基本方案開始體驗')
  }

  // Location-based recommendations
  const location = user.profile?.location || ''
  if (['台北市', '新北市'].includes(location)) {
    score.vvip += 25
    score.vip += 20
    reasons.push('都會區會員重視查看參與者功能')
  }

  // Find the highest scoring plan
  const topPlan = Object.entries(score).reduce((a, b) =>
    score[a[0] as keyof typeof score] > score[b[0] as keyof typeof score] ? a : b
  )[0] as keyof typeof score

  // Calculate confidence
  const maxScore = Math.max(...Object.values(score))
  const confidence = Math.min(95, Math.max(60, (maxScore / 100) * 100))

  // Generate discount if applicable
  let discount
  const leadSource = user.membership?.leadSource
  if (leadSource === 'referral' || new Date().getDay() === 0) { // Sunday special
    discount = {
      amount: 10,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      reason: leadSource === 'referral' ? '朋友推薦優惠' : '週日限時優惠'
    }
  }

  return {
    recommendedPlan: topPlan,
    confidence,
    reasons: reasons.slice(0, 3),
    alternatives: alternatives.slice(0, 2),
    discount
  }
}

// User routes (protected)
router.get('/users', authenticateToken, requireMembership('vip', 'vvip'), userController.getUsers.bind(userController))
router.get('/users/count', authenticateToken, userController.getUserCount.bind(userController))
router.get('/users/:id', authenticateToken, userController.getUserById.bind(userController))
router.get('/users/email/:email', authenticateToken, userController.getUserByEmail.bind(userController))
router.get('/users/sync/:timestamp', authenticateToken, userController.getModifiedUsers.bind(userController))
router.post('/users', userController.createUser.bind(userController)) // Public for registration
router.post('/users/search', authenticateToken, requirePermission('viewParticipants'), userController.searchUsers.bind(userController))
router.put('/users/:id', authenticateToken, userController.updateUser.bind(userController))
router.put('/users/:id/membership', authenticateToken, requireMembership('vip', 'vvip'), userController.updateMembership.bind(userController))
router.delete('/users/:id', authenticateToken, requireMembership('vip', 'vvip'), userController.deleteUser.bind(userController))

// Event routes
router.get('/events', eventController.getEvents.bind(eventController)) // Public - anyone can see events
router.get('/events/count', authenticateToken, eventController.getEventCount.bind(eventController))
router.get('/events/upcoming', eventController.getUpcomingEvents.bind(eventController)) // Public
router.get('/events/:id', eventController.getEventById.bind(eventController)) // Public
router.get('/events/user/:userId', authenticateToken, eventController.getEventsByUser.bind(eventController))
router.get('/events/sync/:timestamp', authenticateToken, eventController.getModifiedEvents.bind(eventController))
router.post('/events', authenticateToken, requireMembership('vip', 'vvip'), eventController.createEvent.bind(eventController))
router.post('/events/search', eventController.searchEvents.bind(eventController)) // Public
router.post('/events/:id/participants', authenticateToken, eventController.addParticipant.bind(eventController))
router.put('/events/:id', authenticateToken, requireMembership('vip', 'vvip'), eventController.updateEvent.bind(eventController))
router.put('/events/:id/status', authenticateToken, requireMembership('vip', 'vvip'), eventController.updateEventStatus.bind(eventController))
router.put('/events/:id/publish', authenticateToken, requireMembership('vip', 'vvip'), eventController.publishEvent.bind(eventController))
router.put('/events/:id/cancel', authenticateToken, requireMembership('vip', 'vvip'), eventController.cancelEvent.bind(eventController))
router.delete('/events/:id', authenticateToken, requireMembership('vip', 'vvip'), eventController.deleteEvent.bind(eventController))
router.delete('/events/:id/participants/:userId', authenticateToken, eventController.removeParticipant.bind(eventController))

// Booking routes (all require authentication)
router.get('/bookings', authenticateToken, requireMembership('vip', 'vvip'), bookingController.getBookings.bind(bookingController))
router.get('/bookings/count', authenticateToken, bookingController.getBookingCount.bind(bookingController))
router.get('/bookings/revenue', authenticateToken, requireMembership('vip', 'vvip'), bookingController.getRevenueStats.bind(bookingController))
router.get('/bookings/:id', authenticateToken, bookingController.getBookingById.bind(bookingController))
router.get('/bookings/user/:userId', authenticateToken, bookingController.getBookingsByUser.bind(bookingController))
router.get('/bookings/event/:eventId', authenticateToken, requirePermission('viewParticipants'), bookingController.getBookingsByEvent.bind(bookingController))
router.get('/bookings/user/:userId/event/:eventId', authenticateToken, bookingController.getBookingByUserAndEvent.bind(bookingController))
router.get('/bookings/status/:status', authenticateToken, requireMembership('vip', 'vvip'), bookingController.getBookingsByStatus.bind(bookingController))
router.get('/bookings/payment-status/:paymentStatus', authenticateToken, requireMembership('vip', 'vvip'), bookingController.getBookingsByPaymentStatus.bind(bookingController))
router.get('/bookings/count/status/:status', authenticateToken, bookingController.getBookingCountByStatus.bind(bookingController))
router.get('/bookings/sync/:timestamp', authenticateToken, bookingController.getModifiedBookings.bind(bookingController))
router.post('/bookings', authenticateToken, bookingController.createBooking.bind(bookingController))
router.put('/bookings/:id', authenticateToken, bookingController.updateBooking.bind(bookingController))
router.put('/bookings/:id/status', authenticateToken, bookingController.updateBookingStatus.bind(bookingController))
router.put('/bookings/:id/payment', authenticateToken, bookingController.updatePaymentStatus.bind(bookingController))
router.put('/bookings/:id/confirm', authenticateToken, bookingController.confirmBooking.bind(bookingController))
router.put('/bookings/:id/cancel', authenticateToken, bookingController.cancelBooking.bind(bookingController))
router.put('/bookings/:id/complete', authenticateToken, bookingController.completeBooking.bind(bookingController))
router.put('/bookings/:id/paid', authenticateToken, bookingController.markBookingPaid.bind(bookingController))
router.put('/bookings/:id/voucher', authenticateToken, bookingController.applyVoucher.bind(bookingController))
router.delete('/bookings/:id', authenticateToken, bookingController.deleteBooking.bind(bookingController))

// Sync endpoint for bulk operations
router.post('/sync', async (req, res) => {
  try {
    const { collection, timestamp } = req.body

    if (!collection || !timestamp) {
      res.status(400).json({
        success: false,
        error: 'Collection and timestamp are required',
        timestamp: Date.now()
      })
      return
    }

    let result
    switch (collection) {
    case 'users':
      result = await userModel.getModifiedSince(timestamp)
      break
    case 'events':
      result = await eventModel.getModifiedSince(timestamp)
      break
    case 'bookings':
      result = await bookingModel.getModifiedSince(timestamp)
      break
    default:
      res.status(400).json({
        success: false,
        error: 'Invalid collection name',
        timestamp: Date.now()
      })
      return
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Sync operation failed',
      timestamp: Date.now()
    })
  }
})

// Bulk data insertion for testing
router.post('/seed', async (req, res) => {
  try {
    await dbSetup.insertTestData()

    res.json({
      success: true,
      message: 'Test data inserted successfully',
      timestamp: Date.now()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to insert test data',
      timestamp: Date.now()
    })
  }
})

// Database maintenance endpoints
router.post('/compact', async (req, res) => {
  try {
    await dbSetup.compactDatabases()

    res.json({
      success: true,
      message: 'Database compaction completed',
      timestamp: Date.now()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database compaction failed',
      timestamp: Date.now()
    })
  }
})

router.post('/backup', async (req, res) => {
  try {
    const backupPath = await dbSetup.createBackup()

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: { backupPath },
      timestamp: Date.now()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Backup creation failed',
      timestamp: Date.now()
    })
  }
})

export default router
