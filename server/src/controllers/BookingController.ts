// Booking Controller - API endpoints for booking operations
import { Request, Response } from 'express'
import { BookingModel } from '../models/Booking'

export class BookingController {
  private bookingModel: BookingModel

  constructor(bookingModel: BookingModel) {
    this.bookingModel = bookingModel
  }

  // GET /api/bookings
  async getBookings(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.bookingModel.findAll(page, limit)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/:id
  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const result = await this.bookingModel.findById(id)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // POST /api/bookings
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingData = req.body
      
      // Basic validation
      if (!bookingData.userId || !bookingData.eventId) {
        res.status(400).json({
          success: false,
          error: 'User ID and Event ID are required',
          timestamp: Date.now()
        })
        return
      }

      // Check if booking already exists
      const existingBooking = await this.bookingModel.findByUserAndEvent(
        bookingData.userId, 
        bookingData.eventId
      )

      if (existingBooking.success) {
        res.status(400).json({
          success: false,
          error: 'Booking already exists for this user and event',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.bookingModel.create(bookingData)
      
      if (result.success) {
        res.status(201).json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/bookings/:id
  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData = req.body

      const result = await this.bookingModel.update(id, updateData)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // DELETE /api/bookings/:id
  async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const result = await this.bookingModel.delete(id)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/user/:userId
  async getBookingsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.bookingModel.findByUserId(userId, page, limit)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/event/:eventId
  async getBookingsByEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.bookingModel.findByEventId(eventId, page, limit)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/user/:userId/event/:eventId
  async getBookingByUserAndEvent(req: Request, res: Response): Promise<void> {
    try {
      const { userId, eventId } = req.params

      const result = await this.bookingModel.findByUserAndEvent(userId, eventId)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/bookings/:id/status
  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.bookingModel.updateStatus(id, status)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/bookings/:id/payment
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { paymentStatus, paymentMethod } = req.body

      if (!paymentStatus) {
        res.status(400).json({
          success: false,
          error: 'Payment status is required',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.bookingModel.updatePaymentStatus(id, paymentStatus, paymentMethod)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/bookings/:id/confirm
  async confirmBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.bookingModel.confirm(id)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/bookings/:id/cancel
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.bookingModel.cancel(id)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/bookings/:id/complete
  async completeBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.bookingModel.complete(id)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/bookings/:id/paid
  async markBookingPaid(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { paymentMethod } = req.body

      if (!paymentMethod) {
        res.status(400).json({
          success: false,
          error: 'Payment method is required',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.bookingModel.markPaid(id, paymentMethod)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/status/:status
  async getBookingsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.bookingModel.findByStatus(status as any, page, limit)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/payment-status/:paymentStatus
  async getBookingsByPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentStatus } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.bookingModel.findByPaymentStatus(paymentStatus as any, page, limit)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/bookings/:id/voucher
  async applyVoucher(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const voucherData = req.body

      if (!voucherData.type || !voucherData.amount) {
        res.status(400).json({
          success: false,
          error: 'Voucher type and amount are required',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.bookingModel.applyVoucher(id, voucherData)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/count
  async getBookingCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.bookingModel.count()
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/count/status/:status
  async getBookingCountByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params

      const result = await this.bookingModel.countByStatus(status as any)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/revenue
  async getRevenueStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.bookingModel.getRevenueStats()
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/bookings/sync/:timestamp
  async getModifiedBookings(req: Request, res: Response): Promise<void> {
    try {
      const timestamp = parseInt(req.params.timestamp)
      
      if (isNaN(timestamp)) {
        res.status(400).json({
          success: false,
          error: 'Invalid timestamp',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.bookingModel.getModifiedSince(timestamp)
      
      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }
}