// API Routes Configuration
import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { EventController } from '../controllers/EventController'
import { BookingController } from '../controllers/BookingController'
import NeDBSetup from '../db/nedb-setup'
import { UserModel } from '../models/User'
import { EventModel } from '../models/Event'
import { BookingModel } from '../models/Booking'

// Initialize database and models
const dbSetup = new NeDBSetup()
const databases = dbSetup.getDatabases()

const userModel = new UserModel(databases.users)
const eventModel = new EventModel(databases.events)
const bookingModel = new BookingModel(databases.bookings)

// Initialize controllers
const userController = new UserController(userModel)
const eventController = new EventController(eventModel)
const bookingController = new BookingController(bookingModel)

const router = Router()

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

// User routes
router.get('/users', userController.getUsers.bind(userController))
router.get('/users/count', userController.getUserCount.bind(userController))
router.get('/users/:id', userController.getUserById.bind(userController))
router.get('/users/email/:email', userController.getUserByEmail.bind(userController))
router.get('/users/sync/:timestamp', userController.getModifiedUsers.bind(userController))
router.post('/users', userController.createUser.bind(userController))
router.post('/users/search', userController.searchUsers.bind(userController))
router.put('/users/:id', userController.updateUser.bind(userController))
router.put('/users/:id/membership', userController.updateMembership.bind(userController))
router.delete('/users/:id', userController.deleteUser.bind(userController))

// Event routes
router.get('/events', eventController.getEvents.bind(eventController))
router.get('/events/count', eventController.getEventCount.bind(eventController))
router.get('/events/upcoming', eventController.getUpcomingEvents.bind(eventController))
router.get('/events/:id', eventController.getEventById.bind(eventController))
router.get('/events/user/:userId', eventController.getEventsByUser.bind(eventController))
router.get('/events/sync/:timestamp', eventController.getModifiedEvents.bind(eventController))
router.post('/events', eventController.createEvent.bind(eventController))
router.post('/events/search', eventController.searchEvents.bind(eventController))
router.post('/events/:id/participants', eventController.addParticipant.bind(eventController))
router.put('/events/:id', eventController.updateEvent.bind(eventController))
router.put('/events/:id/status', eventController.updateEventStatus.bind(eventController))
router.put('/events/:id/publish', eventController.publishEvent.bind(eventController))
router.put('/events/:id/cancel', eventController.cancelEvent.bind(eventController))
router.delete('/events/:id', eventController.deleteEvent.bind(eventController))
router.delete('/events/:id/participants/:userId', eventController.removeParticipant.bind(eventController))

// Booking routes
router.get('/bookings', bookingController.getBookings.bind(bookingController))
router.get('/bookings/count', bookingController.getBookingCount.bind(bookingController))
router.get('/bookings/revenue', bookingController.getRevenueStats.bind(bookingController))
router.get('/bookings/:id', bookingController.getBookingById.bind(bookingController))
router.get('/bookings/user/:userId', bookingController.getBookingsByUser.bind(bookingController))
router.get('/bookings/event/:eventId', bookingController.getBookingsByEvent.bind(bookingController))
router.get('/bookings/user/:userId/event/:eventId', bookingController.getBookingByUserAndEvent.bind(bookingController))
router.get('/bookings/status/:status', bookingController.getBookingsByStatus.bind(bookingController))
router.get('/bookings/payment-status/:paymentStatus', bookingController.getBookingsByPaymentStatus.bind(bookingController))
router.get('/bookings/count/status/:status', bookingController.getBookingCountByStatus.bind(bookingController))
router.get('/bookings/sync/:timestamp', bookingController.getModifiedBookings.bind(bookingController))
router.post('/bookings', bookingController.createBooking.bind(bookingController))
router.put('/bookings/:id', bookingController.updateBooking.bind(bookingController))
router.put('/bookings/:id/status', bookingController.updateBookingStatus.bind(bookingController))
router.put('/bookings/:id/payment', bookingController.updatePaymentStatus.bind(bookingController))
router.put('/bookings/:id/confirm', bookingController.confirmBooking.bind(bookingController))
router.put('/bookings/:id/cancel', bookingController.cancelBooking.bind(bookingController))
router.put('/bookings/:id/complete', bookingController.completeBooking.bind(bookingController))
router.put('/bookings/:id/paid', bookingController.markBookingPaid.bind(bookingController))
router.put('/bookings/:id/voucher', bookingController.applyVoucher.bind(bookingController))
router.delete('/bookings/:id', bookingController.deleteBooking.bind(bookingController))

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