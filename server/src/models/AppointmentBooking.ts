// AppointmentBooking Model - 預約紀錄管理
// InfinityMatch 天造地設人成對 - 1+1=∞ 台灣頂級配對平台

import { AppointmentBooking, AppointmentStatus, AppointmentType } from '../types/appointments'

export class AppointmentBookingModel {
  private db: any
  
  constructor(db: any) {
    this.db = db
  }

  // 創建預約
  async create(bookingData: Omit<AppointmentBooking, '_id' | 'createdAt' | 'updatedAt' | 'bookedAt'>): Promise<AppointmentBooking> {
    const booking = {
      ...bookingData,
      // Don't set _id - let NeDB generate it automatically
      confirmationSent: false,
      remindersSent: 0,
      completed: false,
      rescheduleCount: 0,
      bookedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.insert(booking, (err: any, doc: AppointmentBooking) => {
        if (err) {
          reject(new Error(`創建預約失敗: ${err.message}`))
          return
        }
        resolve(doc)
      })
    })
  }

  // 根據ID獲取預約
  async getById(bookingId: string): Promise<AppointmentBooking | null> {
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.findOne({ _id: bookingId }, (err: any, doc: AppointmentBooking) => {
        if (err) {
          reject(new Error(`查詢預約失敗: ${err.message}`))
          return
        }
        resolve(doc)
      })
    })
  }

  // 獲取用戶的預約
  async getByUser(userId: string, status?: AppointmentStatus[]): Promise<AppointmentBooking[]> {
    const query: any = { userId }
    
    if (status && status.length > 0) {
      query.status = { $in: status }
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.find(query)
        .sort({ scheduledDate: -1, scheduledTime: -1 })
        .exec((err: any, docs: AppointmentBooking[]) => {
          if (err) {
            reject(new Error(`查詢用戶預約失敗: ${err.message}`))
            return
          }
          resolve(docs)
        })
    })
  }

  // 獲取訪客預約（通過email）
  async getByGuestEmail(email: string, status?: AppointmentStatus[]): Promise<AppointmentBooking[]> {
    const query: any = { 'guestInfo.email': email }
    
    if (status && status.length > 0) {
      query.status = { $in: status }
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.find(query)
        .sort({ scheduledDate: -1, scheduledTime: -1 })
        .exec((err: any, docs: AppointmentBooking[]) => {
          if (err) {
            reject(new Error(`查詢訪客預約失敗: ${err.message}`))
            return
          }
          resolve(docs)
        })
    })
  }

  // 獲取時段的所有預約
  async getBySlot(slotId: string, status?: AppointmentStatus[]): Promise<AppointmentBooking[]> {
    const query: any = { slotId }
    
    if (status && status.length > 0) {
      query.status = { $in: status }
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.find(query)
        .sort({ bookedAt: 1 })
        .exec((err: any, docs: AppointmentBooking[]) => {
          if (err) {
            reject(new Error(`查詢時段預約失敗: ${err.message}`))
            return
          }
          resolve(docs)
        })
    })
  }

  // 檢查衝突預約
  async checkConflict(
    userId: string | undefined,
    guestEmail: string | undefined,
    scheduledDate: string,
    scheduledTime: string,
    duration: number,
    excludeBookingId?: string
  ): Promise<boolean> {
    if (!userId && !guestEmail) {
      return false
    }
    
    const endTime = this.calculateEndTime(scheduledTime, duration)
    
    const query: any = {
      scheduledDate,
      status: { $in: ['booked', 'confirmed'] },
      $or: [
        {
          $and: [
            { scheduledTime: { $lt: endTime } },
            { 
              $expr: {
                $lt: [
                  { $dateFromString: { dateString: { $concat: ['1970-01-01T', '$scheduledTime', ':00Z'] } } },
                  { $dateFromString: { dateString: '1970-01-01T15:00:00Z' } } // Simplified for NeDB compatibility
                ]
              }
            }
          ]
        }
      ]
    }
    
    // 添加用戶或訪客條件
    if (userId) {
      query.$and = query.$and || []
      query.$and.push({ userId })
    }
    
    if (guestEmail) {
      query.$and = query.$and || []
      query.$and.push({ 'guestInfo.email': guestEmail })
    }
    
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId }
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.findOne(query, (err: any, doc: AppointmentBooking) => {
        if (err) {
          reject(new Error(`檢查預約衝突失敗: ${err.message}`))
          return
        }
        resolve(!!doc)
      })
    })
  }

  // 更新預約狀態
  async updateStatus(
    bookingId: string, 
    status: AppointmentStatus,
    additionalUpdates?: Partial<AppointmentBooking>
  ): Promise<AppointmentBooking | null> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
      ...additionalUpdates
    }
    
    // 根據狀態設置特定時間戳
    switch (status) {
      case 'confirmed':
        updateData.confirmedAt = new Date()
        break
      case 'completed':
        updateData.completed = true
        updateData.completedAt = new Date()
        break
      case 'cancelled':
        updateData.cancelledAt = new Date()
        break
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.update(
        { _id: bookingId },
        { $set: updateData },
        {},
        (err: any, numReplaced: number) => {
          if (err) {
            reject(new Error(`更新預約狀態失敗: ${err.message}`))
            return
          }
          
          if (numReplaced === 0) {
            resolve(null)
            return
          }
          
          this.getById(bookingId).then(resolve).catch(reject)
        }
      )
    })
  }

  // 更新預約
  async update(bookingId: string, updates: Partial<AppointmentBooking>): Promise<AppointmentBooking | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.update(
        { _id: bookingId },
        { $set: updateData },
        {},
        (err: any, numReplaced: number) => {
          if (err) {
            reject(new Error(`更新預約失敗: ${err.message}`))
            return
          }
          
          if (numReplaced === 0) {
            resolve(null)
            return
          }
          
          this.getById(bookingId).then(resolve).catch(reject)
        }
      )
    })
  }

  // 重新安排預約
  async reschedule(
    bookingId: string,
    newSlotId: string,
    newScheduledDate: string,
    newScheduledTime: string,
    reason?: string
  ): Promise<AppointmentBooking | null> {
    const updateData = {
      slotId: newSlotId,
      scheduledDate: newScheduledDate,
      scheduledTime: newScheduledTime,
      status: 'booked' as AppointmentStatus,
      rescheduleCount: 1, // 會在更新時通過 $inc 增加
      cancellationReason: reason,
      updatedAt: new Date()
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.update(
        { _id: bookingId },
        { 
          $set: updateData,
          $inc: { rescheduleCount: 1 }
        },
        {},
        (err: any, numReplaced: number) => {
          if (err) {
            reject(new Error(`重新安排預約失敗: ${err.message}`))
            return
          }
          
          if (numReplaced === 0) {
            resolve(null)
            return
          }
          
          this.getById(bookingId).then(resolve).catch(reject)
        }
      )
    })
  }

  // 取消預約
  async cancel(bookingId: string, reason?: string): Promise<AppointmentBooking | null> {
    return this.updateStatus(bookingId, 'cancelled', {
      cancellationReason: reason,
      cancelledAt: new Date()
    })
  }

  // 獲取統計數據
  async getStats(
    startDate?: string,
    endDate?: string,
    type?: AppointmentType
  ): Promise<any> {
    const query: any = {}
    
    if (startDate) {
      query.scheduledDate = { $gte: startDate }
    }
    
    if (endDate) {
      query.scheduledDate = query.scheduledDate || {}
      query.scheduledDate.$lte = endDate
    }
    
    if (type) {
      query.type = type
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.find(query, (err: any, docs: AppointmentBooking[]) => {
        if (err) {
          reject(new Error(`獲取統計數據失敗: ${err.message}`))
          return
        }
        
        const stats = {
          total: docs.length,
          byStatus: {
            booked: docs.filter(b => b.status === 'booked').length,
            confirmed: docs.filter(b => b.status === 'confirmed').length,
            completed: docs.filter(b => b.status === 'completed').length,
            cancelled: docs.filter(b => b.status === 'cancelled').length,
            no_show: docs.filter(b => b.status === 'no_show').length
          },
          byType: {
            consultation: docs.filter(b => b.type === 'consultation').length,
            member_interview: docs.filter(b => b.type === 'member_interview').length
          },
          completionRate: docs.length > 0 ? 
            docs.filter(b => b.status === 'completed').length / docs.length : 0,
          noShowRate: docs.length > 0 ? 
            docs.filter(b => b.status === 'no_show').length / docs.length : 0,
          averageRating: this.calculateAverageRating(docs),
          rescheduleRate: docs.length > 0 ? 
            docs.filter(b => b.rescheduleCount > 0).length / docs.length : 0
        }
        
        resolve(stats)
      })
    })
  }

  // 獲取今日預約
  async getTodaysBookings(): Promise<AppointmentBooking[]> {
    const today = new Date().toISOString().split('T')[0]
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.find({ 
        scheduledDate: today,
        status: { $in: ['booked', 'confirmed'] }
      })
        .sort({ scheduledTime: 1 })
        .exec((err: any, docs: AppointmentBooking[]) => {
          if (err) {
            reject(new Error(`獲取今日預約失敗: ${err.message}`))
            return
          }
          resolve(docs)
        })
    })
  }

  // 獲取需要提醒的預約
  async getBookingsNeedingReminder(hoursBeforeAppointment: number = 24): Promise<AppointmentBooking[]> {
    const now = new Date()
    const reminderTime = new Date(now.getTime() + (hoursBeforeAppointment * 60 * 60 * 1000))
    const reminderDate = reminderTime.toISOString().split('T')[0]
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.find({
        scheduledDate: reminderDate,
        status: { $in: ['booked', 'confirmed'] },
        remindersSent: { $lt: 3 } // 最多發送3次提醒
      })
        .sort({ scheduledTime: 1 })
        .exec((err: any, docs: AppointmentBooking[]) => {
          if (err) {
            reject(new Error(`獲取需要提醒的預約失敗: ${err.message}`))
            return
          }
          resolve(docs)
        })
    })
  }

  // 私有輔助函數：計算結束時間
  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  // 私有輔助函數：計算平均評分
  private calculateAverageRating(bookings: AppointmentBooking[]): number {
    const ratingsBookings = bookings.filter(b => b.rating && b.rating > 0)
    if (ratingsBookings.length === 0) return 0
    
    const totalRating = ratingsBookings.reduce((sum, b) => sum + (b.rating || 0), 0)
    return totalRating / ratingsBookings.length
  }
}