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
import { authenticateToken, requireMembership, requirePermission } from '../middleware/auth'

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

// User routes (protected)
router.get('/users', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), userController.getUsers.bind(userController))
router.get('/users/count', authenticateToken, userController.getUserCount.bind(userController))
router.get('/users/:id', authenticateToken, userController.getUserById.bind(userController))
router.get('/users/email/:email', authenticateToken, userController.getUserByEmail.bind(userController))
router.get('/users/sync/:timestamp', authenticateToken, userController.getModifiedUsers.bind(userController))
router.post('/users', userController.createUser.bind(userController)) // Public for registration
router.post('/users/search', authenticateToken, requirePermission('viewParticipants'), userController.searchUsers.bind(userController))
router.put('/users/:id', authenticateToken, userController.updateUser.bind(userController))
router.put('/users/:id/membership', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), userController.updateMembership.bind(userController))
router.delete('/users/:id', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), userController.deleteUser.bind(userController))

// Event routes
router.get('/events', eventController.getEvents.bind(eventController)) // Public - anyone can see events
router.get('/events/count', authenticateToken, eventController.getEventCount.bind(eventController))
router.get('/events/upcoming', eventController.getUpcomingEvents.bind(eventController)) // Public
router.get('/events/:id', eventController.getEventById.bind(eventController)) // Public
router.get('/events/user/:userId', authenticateToken, eventController.getEventsByUser.bind(eventController))
router.get('/events/sync/:timestamp', authenticateToken, eventController.getModifiedEvents.bind(eventController))
router.post('/events', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), eventController.createEvent.bind(eventController))
router.post('/events/search', eventController.searchEvents.bind(eventController)) // Public
router.post('/events/:id/participants', authenticateToken, eventController.addParticipant.bind(eventController))
router.put('/events/:id', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), eventController.updateEvent.bind(eventController))
router.put('/events/:id/status', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), eventController.updateEventStatus.bind(eventController))
router.put('/events/:id/publish', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), eventController.publishEvent.bind(eventController))
router.put('/events/:id/cancel', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), eventController.cancelEvent.bind(eventController))
router.delete('/events/:id', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), eventController.deleteEvent.bind(eventController))
router.delete('/events/:id/participants/:userId', authenticateToken, eventController.removeParticipant.bind(eventController))

// Booking routes (all require authentication)
router.get('/bookings', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), bookingController.getBookings.bind(bookingController))
router.get('/bookings/count', authenticateToken, bookingController.getBookingCount.bind(bookingController))
router.get('/bookings/revenue', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), bookingController.getRevenueStats.bind(bookingController))
router.get('/bookings/:id', authenticateToken, bookingController.getBookingById.bind(bookingController))
router.get('/bookings/user/:userId', authenticateToken, bookingController.getBookingsByUser.bind(bookingController))
router.get('/bookings/event/:eventId', authenticateToken, requirePermission('viewParticipants'), bookingController.getBookingsByEvent.bind(bookingController))
router.get('/bookings/user/:userId/event/:eventId', authenticateToken, bookingController.getBookingByUserAndEvent.bind(bookingController))
router.get('/bookings/status/:status', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), bookingController.getBookingsByStatus.bind(bookingController))
router.get('/bookings/payment-status/:paymentStatus', authenticateToken, requireMembership('vip', 'premium_1300', 'premium_2500'), bookingController.getBookingsByPaymentStatus.bind(bookingController))
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