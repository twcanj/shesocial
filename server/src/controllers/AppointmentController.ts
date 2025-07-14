// Appointment Controller - 預約系統控制器
// InfinityMatch 天造地設人成對 - 1+1=∞ 台灣頂級配對平台

import { Request, Response } from 'express'
import { AppointmentSlotModel } from '../models/AppointmentSlot'
import { AppointmentBookingModel } from '../models/AppointmentBooking'
import { InterviewerModel } from '../models/Interviewer'
import { UserModel } from '../models/User'
import { AppointmentSlot, AppointmentBooking, AppointmentType, AppointmentStatus } from '../types/appointments'

export class AppointmentController {
  private slotModel: AppointmentSlotModel
  private bookingModel: AppointmentBookingModel
  private interviewerModel: InterviewerModel
  private userModel: UserModel

  constructor(db: any) {
    this.slotModel = new AppointmentSlotModel(db)
    this.bookingModel = new AppointmentBookingModel(db)
    this.interviewerModel = new InterviewerModel(db)
    this.userModel = new UserModel(db)
  }

  // ===== APPOINTMENT SLOTS MANAGEMENT =====

  // 創建預約時段
  createSlot = async (req: Request, res: Response) => {
    try {
      const slotData = req.body
      
      // 驗證必要字段
      if (!slotData.type || !slotData.date || !slotData.startTime || !slotData.endTime || !slotData.interviewerId) {
        return res.status(400).json({
          error: '缺少必要字段',
          required: ['type', 'date', 'startTime', 'endTime', 'interviewerId']
        })
      }

      // 檢查面試官是否存在
      const interviewer = await this.interviewerModel.getById(slotData.interviewerId)
      if (!interviewer) {
        return res.status(404).json({ error: '面試官不存在' })
      }

      // 檢查時段衝突
      const hasConflict = await this.slotModel.checkConflict(
        slotData.interviewerId,
        slotData.date,
        slotData.startTime,
        slotData.endTime
      )

      if (hasConflict) {
        return res.status(409).json({ error: '時段衝突，該面試官在此時間已有其他安排' })
      }

      // 檢查面試官可用性
      const isAvailable = await this.interviewerModel.checkAvailability(
        slotData.interviewerId,
        slotData.date,
        slotData.startTime,
        slotData.endTime
      )

      if (!isAvailable) {
        return res.status(400).json({ error: '面試官在此時間不可用' })
      }

      // 設置默認值
      const slotToCreate = {
        ...slotData,
        interviewerName: interviewer.name,
        isAvailable: true,
        capacity: slotData.capacity || 1,
        timezone: 'Asia/Taipei',
        duration: slotData.duration || 30,
        requiresPreApproval: slotData.requiresPreApproval || false,
        cancellationDeadlineHours: slotData.cancellationDeadlineHours || 24,
        createdBy: (req as any).user.userId
      }

      let createdSlots: AppointmentSlot[]

      // 處理重複預約
      if (slotData.isRecurring && slotData.recurringPattern) {
        createdSlots = await this.slotModel.createRecurringSlots(slotToCreate, slotData.recurringPattern)
      } else {
        const slot = await this.slotModel.create(slotToCreate)
        createdSlots = [slot]
      }

      res.status(201).json({
        message: `成功創建 ${createdSlots.length} 個預約時段`,
        slots: createdSlots
      })
    } catch (error) {
      console.error('創建預約時段錯誤:', error)
      res.status(500).json({ error: '創建預約時段失敗' })
    }
  }

  // 獲取可用時段
  getAvailableSlots = async (req: Request, res: Response) => {
    try {
      const { 
        type, 
        startDate, 
        endDate, 
        interviewerId 
      } = req.query

      if (!type || !startDate) {
        return res.status(400).json({ error: '缺少必要參數: type, startDate' })
      }

      const slots = await this.slotModel.getAvailableSlots(
        type as AppointmentType,
        startDate as string,
        endDate as string,
        interviewerId as string
      )

      // 獲取每個時段的預約信息
      const slotsWithBookings = await Promise.all(
        slots.map(async (slot) => {
          const bookings = await this.bookingModel.getBySlot(slot._id, ['booked', 'confirmed'])
          return {
            ...slot,
            bookings,
            availableCapacity: slot.capacity - slot.bookedCount
          }
        })
      )

      res.json({
        slots: slotsWithBookings,
        total: slotsWithBookings.length
      })
    } catch (error) {
      console.error('獲取可用時段錯誤:', error)
      res.status(500).json({ error: '獲取可用時段失敗' })
    }
  }

  // 獲取時段詳情
  getSlotById = async (req: Request, res: Response) => {
    try {
      const { slotId } = req.params
      
      const slot = await this.slotModel.getById(slotId)
      if (!slot) {
        return res.status(404).json({ error: '預約時段不存在' })
      }

      const bookings = await this.bookingModel.getBySlot(slotId)
      const interviewer = await this.interviewerModel.getById(slot.interviewerId)

      res.json({
        slot,
        bookings,
        interviewer,
        availableCapacity: slot.capacity - slot.bookedCount
      })
    } catch (error) {
      console.error('獲取時段詳情錯誤:', error)
      res.status(500).json({ error: '獲取時段詳情失敗' })
    }
  }

  // 更新時段
  updateSlot = async (req: Request, res: Response) => {
    try {
      const { slotId } = req.params
      const updates = req.body

      // 檢查權限：只有創建者或管理員可以修改
      const slot = await this.slotModel.getById(slotId)
      if (!slot) {
        return res.status(404).json({ error: '預約時段不存在' })
      }

      // 如果修改時間，檢查衝突
      if (updates.startTime || updates.endTime || updates.date) {
        const startTime = updates.startTime || slot.startTime
        const endTime = updates.endTime || slot.endTime
        const date = updates.date || slot.date

        const hasConflict = await this.slotModel.checkConflict(
          slot.interviewerId,
          date,
          startTime,
          endTime,
          slotId
        )

        if (hasConflict) {
          return res.status(409).json({ error: '時段衝突' })
        }
      }

      const updatedSlot = await this.slotModel.update(slotId, updates)
      if (!updatedSlot) {
        return res.status(404).json({ error: '更新失敗' })
      }

      res.json({
        message: '預約時段更新成功',
        slot: updatedSlot
      })
    } catch (error) {
      console.error('更新時段錯誤:', error)
      res.status(500).json({ error: '更新時段失敗' })
    }
  }

  // 刪除時段
  deleteSlot = async (req: Request, res: Response) => {
    try {
      const { slotId } = req.params

      // 檢查是否有未完成的預約
      const activeBookings = await this.bookingModel.getBySlot(slotId, ['booked', 'confirmed'])
      if (activeBookings.length > 0) {
        return res.status(400).json({ 
          error: '無法刪除時段，存在未完成的預約',
          activeBookings: activeBookings.length
        })
      }

      const deleted = await this.slotModel.delete(slotId)
      if (!deleted) {
        return res.status(404).json({ error: '預約時段不存在' })
      }

      res.json({ message: '預約時段刪除成功' })
    } catch (error) {
      console.error('刪除時段錯誤:', error)
      res.status(500).json({ error: '刪除時段失敗' })
    }
  }

  // ===== APPOINTMENT BOOKING MANAGEMENT =====

  // 創建預約
  createBooking = async (req: Request, res: Response) => {
    try {
      const bookingData = req.body
      const user = (req as any).user

      // 驗證必要字段
      if (!bookingData.slotId || !bookingData.type) {
        return res.status(400).json({ error: '缺少必要字段: slotId, type' })
      }

      // 獲取時段信息
      const slot = await this.slotModel.getById(bookingData.slotId)
      if (!slot) {
        return res.status(404).json({ error: '預約時段不存在' })
      }

      if (!slot.isAvailable) {
        return res.status(400).json({ error: '該時段不可預約' })
      }

      if (slot.bookedCount >= slot.capacity) {
        return res.status(400).json({ error: '該時段已滿' })
      }

      // 檢查預約衝突
      const hasConflict = await this.bookingModel.checkConflict(
        user?.userId,
        bookingData.guestInfo?.email,
        slot.date,
        slot.startTime,
        slot.duration
      )

      if (hasConflict) {
        return res.status(409).json({ error: '該時間段您已有其他預約' })
      }

      // 準備預約數據
      const bookingToCreate = {
        ...bookingData,
        slotId: slot._id,
        scheduledDate: slot.date,
        scheduledTime: slot.startTime,
        duration: slot.duration,
        timezone: slot.timezone,
        status: 'booked' as AppointmentStatus,
        meetingUrl: slot.meetingUrl,
        meetingId: slot.meetingId,
        location: slot.location,
        userId: user?.userId
      }

      // 創建預約
      const booking = await this.bookingModel.create(bookingToCreate)

      // 更新時段預約數量
      await this.slotModel.updateBookedCount(slot._id, 1)

      // 更新面試官統計
      await this.interviewerModel.updateStats(slot.interviewerId, 1, 0)

      // 獲取完整預約信息
      const fullBooking = await this.getBookingWithDetails(booking._id)

      res.status(201).json({
        message: '預約創建成功',
        booking: fullBooking
      })
    } catch (error) {
      console.error('創建預約錯誤:', error)
      res.status(500).json({ error: '創建預約失敗' })
    }
  }

  // 獲取用戶預約
  getUserBookings = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user
      const { status, type } = req.query

      let bookings: AppointmentBooking[]

      if (user?.userId) {
        // 已登入用戶
        const statusFilter = status ? (status as string).split(',') as AppointmentStatus[] : undefined
        bookings = await this.bookingModel.getByUser(user.userId, statusFilter)
      } else if (req.query.email) {
        // 訪客查詢
        const statusFilter = status ? (status as string).split(',') as AppointmentStatus[] : undefined
        bookings = await this.bookingModel.getByGuestEmail(req.query.email as string, statusFilter)
      } else {
        return res.status(400).json({ error: '需要提供用戶ID或email' })
      }

      // 獲取詳細信息
      const bookingsWithDetails = await Promise.all(
        bookings.map(booking => this.getBookingWithDetails(booking._id))
      )

      res.json({
        bookings: bookingsWithDetails,
        total: bookingsWithDetails.length
      })
    } catch (error) {
      console.error('獲取用戶預約錯誤:', error)
      res.status(500).json({ error: '獲取用戶預約失敗' })
    }
  }

  // 更新預約狀態
  updateBookingStatus = async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params
      const { status, notes, rating, outcome } = req.body

      if (!status) {
        return res.status(400).json({ error: '缺少狀態參數' })
      }

      const booking = await this.bookingModel.getById(bookingId)
      if (!booking) {
        return res.status(404).json({ error: '預約不存在' })
      }

      const additionalUpdates: any = {}
      
      if (notes) additionalUpdates.interviewNotes = notes
      if (rating) additionalUpdates.rating = rating
      if (outcome) additionalUpdates.outcome = outcome

      const updatedBooking = await this.bookingModel.updateStatus(
        bookingId, 
        status as AppointmentStatus, 
        additionalUpdates
      )

      // 如果完成預約，更新面試官統計
      if (status === 'completed') {
        const slot = await this.slotModel.getById(booking.slotId)
        if (slot) {
          await this.interviewerModel.updateStats(slot.interviewerId, 0, 1, rating)
        }

        // 如果是會員面試且通過，更新用戶面試狀態
        if (booking.type === 'member_interview' && outcome === 'approved' && booking.userId) {
          await this.userModel.updateInterviewStatus(booking.userId, {
            completed: true,
            completedBookingId: bookingId,
            outcome: 'approved',
            completedAt: new Date()
          })
        }
      }

      // 如果取消預約，減少時段預約數量
      if (status === 'cancelled' && booking.status !== 'cancelled') {
        await this.slotModel.updateBookedCount(booking.slotId, -1)
      }

      res.json({
        message: '預約狀態更新成功',
        booking: updatedBooking
      })
    } catch (error) {
      console.error('更新預約狀態錯誤:', error)
      res.status(500).json({ error: '更新預約狀態失敗' })
    }
  }

  // 重新安排預約
  rescheduleBooking = async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params
      const { newSlotId, reason } = req.body

      if (!newSlotId) {
        return res.status(400).json({ error: '缺少新時段ID' })
      }

      const booking = await this.bookingModel.getById(bookingId)
      if (!booking) {
        return res.status(404).json({ error: '預約不存在' })
      }

      const newSlot = await this.slotModel.getById(newSlotId)
      if (!newSlot) {
        return res.status(404).json({ error: '新時段不存在' })
      }

      if (!newSlot.isAvailable || newSlot.bookedCount >= newSlot.capacity) {
        return res.status(400).json({ error: '新時段不可用' })
      }

      // 檢查新時段是否有衝突
      const hasConflict = await this.bookingModel.checkConflict(
        booking.userId,
        booking.guestInfo?.email,
        newSlot.date,
        newSlot.startTime,
        newSlot.duration,
        bookingId
      )

      if (hasConflict) {
        return res.status(409).json({ error: '新時段與其他預約衝突' })
      }

      // 更新原時段預約數量
      await this.slotModel.updateBookedCount(booking.slotId, -1)

      // 重新安排預約
      const rescheduledBooking = await this.bookingModel.reschedule(
        bookingId,
        newSlotId,
        newSlot.date,
        newSlot.startTime,
        reason
      )

      // 更新新時段預約數量
      await this.slotModel.updateBookedCount(newSlotId, 1)

      res.json({
        message: '預約重新安排成功',
        booking: rescheduledBooking
      })
    } catch (error) {
      console.error('重新安排預約錯誤:', error)
      res.status(500).json({ error: '重新安排預約失敗' })
    }
  }

  // 取消預約
  cancelBooking = async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params
      const { reason } = req.body

      const booking = await this.bookingModel.getById(bookingId)
      if (!booking) {
        return res.status(404).json({ error: '預約不存在' })
      }

      if (booking.status === 'cancelled') {
        return res.status(400).json({ error: '預約已取消' })
      }

      // 檢查取消期限
      const slot = await this.slotModel.getById(booking.slotId)
      if (slot) {
        const appointmentTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`)
        const now = new Date()
        const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilAppointment < slot.cancellationDeadlineHours) {
          return res.status(400).json({ 
            error: `預約取消期限已過，需提前 ${slot.cancellationDeadlineHours} 小時取消` 
          })
        }
      }

      const cancelledBooking = await this.bookingModel.cancel(bookingId, reason)

      // 更新時段預約數量
      await this.slotModel.updateBookedCount(booking.slotId, -1)

      res.json({
        message: '預約取消成功',
        booking: cancelledBooking
      })
    } catch (error) {
      console.error('取消預約錯誤:', error)
      res.status(500).json({ error: '取消預約失敗' })
    }
  }

  // ===== STATISTICS AND REPORTING =====

  // 獲取統計數據
  getStats = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, type } = req.query

      const [slotStats, bookingStats] = await Promise.all([
        this.slotModel.getStats(startDate as string, endDate as string),
        this.bookingModel.getStats(startDate as string, endDate as string, type as AppointmentType)
      ])

      res.json({
        slots: slotStats,
        bookings: bookingStats,
        utilization: slotStats.totalCapacity > 0 ? slotStats.totalBooked / slotStats.totalCapacity : 0
      })
    } catch (error) {
      console.error('獲取統計錯誤:', error)
      res.status(500).json({ error: '獲取統計失敗' })
    }
  }

  // 獲取今日預約
  getTodaysBookings = async (req: Request, res: Response) => {
    try {
      const bookings = await this.bookingModel.getTodaysBookings()
      
      const bookingsWithDetails = await Promise.all(
        bookings.map(booking => this.getBookingWithDetails(booking._id))
      )

      res.json({
        bookings: bookingsWithDetails,
        total: bookingsWithDetails.length
      })
    } catch (error) {
      console.error('獲取今日預約錯誤:', error)
      res.status(500).json({ error: '獲取今日預約失敗' })
    }
  }

  // ===== HELPER METHODS =====

  // 獲取完整預約詳情
  private async getBookingWithDetails(bookingId: string): Promise<any> {
    const booking = await this.bookingModel.getById(bookingId)
    if (!booking) return null

    const slot = await this.slotModel.getById(booking.slotId)
    const interviewer = slot ? await this.interviewerModel.getById(slot.interviewerId) : null

    return {
      ...booking,
      slot,
      interviewer
    }
  }
}