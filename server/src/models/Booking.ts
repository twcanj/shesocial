// Booking Model - Business Logic for Booking Operations
import Datastore from '@seald-io/nedb'
import { BookingData, ApiResponse } from '../types/database'

export class BookingModel {
  private db: Datastore<BookingData>

  constructor(database: Datastore<BookingData>) {
    this.db = database
  }

  // Create new booking
  async create(bookingData: Omit<BookingData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<BookingData>> {
    try {
      const now = new Date()
      const newBooking: BookingData = {
        ...bookingData,
        createdAt: now,
        updatedAt: now,
        lastSync: now
      }

      return new Promise((resolve) => {
        this.db.insert(newBooking, (err, doc) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
              timestamp: Date.now()
            })
          } else {
            resolve({
              success: true,
              data: doc,
              timestamp: Date.now()
            })
          }
        })
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  // Find booking by ID
  async findById(id: string): Promise<ApiResponse<BookingData>> {
    return new Promise((resolve) => {
      this.db.findOne({ _id: id }, (err, doc) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
        } else if (!doc) {
          resolve({
            success: false,
            error: 'Booking not found',
            timestamp: Date.now()
          })
        } else {
          resolve({
            success: true,
            data: doc,
            timestamp: Date.now()
          })
        }
      })
    })
  }

  // Update booking
  async update(id: string, updateData: Partial<BookingData>): Promise<ApiResponse<BookingData>> {
    try {
      const updateWithTimestamp = {
        ...updateData,
        updatedAt: new Date(),
        lastSync: new Date()
      }

      return new Promise((resolve) => {
        this.db.update(
          { _id: id },
          { $set: updateWithTimestamp },
          { returnUpdatedDocs: true },
          (err, numReplaced, doc) => {
            if (err) {
              resolve({
                success: false,
                error: err.message,
                timestamp: Date.now()
              })
            } else if (numReplaced === 0) {
              resolve({
                success: false,
                error: 'Booking not found',
                timestamp: Date.now()
              })
            } else {
              resolve({
                success: true,
                data: doc as any,
                timestamp: Date.now()
              })
            }
          }
        )
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  // Delete booking
  async delete(id: string): Promise<ApiResponse<boolean>> {
    return new Promise((resolve) => {
      this.db.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
        } else if (numRemoved === 0) {
          resolve({
            success: false,
            error: 'Booking not found',
            timestamp: Date.now()
          })
        } else {
          resolve({
            success: true,
            data: true,
            timestamp: Date.now()
          })
        }
      })
    })
  }

  // Find bookings by user ID
  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<BookingData[]>> {
    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
              timestamp: Date.now()
            })
          } else {
            resolve({
              success: true,
              data: docs,
              timestamp: Date.now()
            })
          }
        })
    })
  }

  // Find bookings by event ID
  async findByEventId(eventId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<BookingData[]>> {
    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find({ eventId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
              timestamp: Date.now()
            })
          } else {
            resolve({
              success: true,
              data: docs,
              timestamp: Date.now()
            })
          }
        })
    })
  }

  // Find booking by user and event
  async findByUserAndEvent(userId: string, eventId: string): Promise<ApiResponse<BookingData>> {
    return new Promise((resolve) => {
      this.db.findOne({ userId, eventId }, (err, doc) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
        } else if (!doc) {
          resolve({
            success: false,
            error: 'Booking not found',
            timestamp: Date.now()
          })
        } else {
          resolve({
            success: true,
            data: doc,
            timestamp: Date.now()
          })
        }
      })
    })
  }

  // Find all bookings with pagination
  async findAll(page: number = 1, limit: number = 10): Promise<ApiResponse<BookingData[]>> {
    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
              timestamp: Date.now()
            })
          } else {
            resolve({
              success: true,
              data: docs,
              timestamp: Date.now()
            })
          }
        })
    })
  }

  // Update booking status
  async updateStatus(id: string, status: BookingData['status']): Promise<ApiResponse<BookingData>> {
    return this.update(id, { status })
  }

  // Update payment status
  async updatePaymentStatus(id: string, paymentStatus: BookingData['paymentStatus'], paymentMethod?: string): Promise<ApiResponse<BookingData>> {
    const updateData: Partial<BookingData> = { paymentStatus }
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod
    }
    return this.update(id, updateData)
  }

  // Confirm booking
  async confirm(id: string): Promise<ApiResponse<BookingData>> {
    return this.updateStatus(id, 'confirmed')
  }

  // Cancel booking
  async cancel(id: string): Promise<ApiResponse<BookingData>> {
    return this.updateStatus(id, 'cancelled')
  }

  // Mark booking as completed
  async complete(id: string): Promise<ApiResponse<BookingData>> {
    return this.updateStatus(id, 'completed')
  }

  // Mark payment as paid
  async markPaid(id: string, paymentMethod: string): Promise<ApiResponse<BookingData>> {
    return this.updatePaymentStatus(id, 'paid', paymentMethod)
  }

  // Get bookings by status
  async findByStatus(status: BookingData['status'], page: number = 1, limit: number = 10): Promise<ApiResponse<BookingData[]>> {
    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find({ status })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
              timestamp: Date.now()
            })
          } else {
            resolve({
              success: true,
              data: docs,
              timestamp: Date.now()
            })
          }
        })
    })
  }

  // Get bookings by payment status
  async findByPaymentStatus(paymentStatus: BookingData['paymentStatus'], page: number = 1, limit: number = 10): Promise<ApiResponse<BookingData[]>> {
    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find({ paymentStatus })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
              timestamp: Date.now()
            })
          } else {
            resolve({
              success: true,
              data: docs,
              timestamp: Date.now()
            })
          }
        })
    })
  }

  // Apply voucher to booking
  async applyVoucher(id: string, voucherData: BookingData['voucherApplied']): Promise<ApiResponse<BookingData>> {
    return this.update(id, { voucherApplied: voucherData })
  }

  // Get booking count
  async count(): Promise<ApiResponse<number>> {
    return new Promise((resolve) => {
      this.db.count({}, (err, count) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
        } else {
          resolve({
            success: true,
            data: count,
            timestamp: Date.now()
          })
        }
      })
    })
  }

  // Get booking count by status
  async countByStatus(status: BookingData['status']): Promise<ApiResponse<number>> {
    return new Promise((resolve) => {
      this.db.count({ status }, (err, count) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
        } else {
          resolve({
            success: true,
            data: count,
            timestamp: Date.now()
          })
        }
      })
    })
  }

  // Get bookings modified since timestamp (for sync)
  async getModifiedSince(timestamp: number): Promise<ApiResponse<BookingData[]>> {
    return new Promise((resolve) => {
      this.db.find({
        $or: [
          { lastSync: { $gt: new Date(timestamp) } },
          { lastSync: null }
        ]
      }, (err, docs) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
        } else {
          resolve({
            success: true,
            data: docs,
            timestamp: Date.now()
          })
        }
      })
    })
  }

  // Get revenue statistics
  async getRevenueStats(): Promise<ApiResponse<{
    totalRevenue: number
    paidBookings: number
    pendingPayments: number
    refundedAmount: number
  }>> {
    return new Promise((resolve) => {
      this.db.find({}, (err, docs) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
        } else {
          const stats = docs.reduce((acc, booking) => {
            // Note: This is a simplified calculation
            // In a real implementation, you'd need to fetch event pricing
            // and calculate based on actual payment amounts
            if (booking.paymentStatus === 'paid') {
              acc.paidBookings++
              acc.totalRevenue += 1000 // Placeholder amount
            } else if (booking.paymentStatus === 'pending') {
              acc.pendingPayments++
            } else if (booking.paymentStatus === 'refunded') {
              acc.refundedAmount += 1000 // Placeholder amount
            }
            return acc
          }, {
            totalRevenue: 0,
            paidBookings: 0,
            pendingPayments: 0,
            refundedAmount: 0
          })

          resolve({
            success: true,
            data: stats,
            timestamp: Date.now()
          })
        }
      })
    })
  }
}