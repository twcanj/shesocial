// Appointments Routes - 預約系統路由
// InfinityMatch 天造地設人成對 - 1+1=∞ 台灣頂級配對平台

import { Router } from 'express'
import { AppointmentController } from '../controllers/AppointmentController'
import { authenticateToken as authMiddleware, requireMembership } from '../middleware/auth'

// Optional auth middleware
const optionalAuthMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization
  if (authHeader) {
    // If auth header exists, use full auth
    authMiddleware(req, res, next)
  } else {
    // If no auth header, continue without user
    req.user = null
    next()
  }
}

// Validate membership helper
const validateMembership = (allowedTypes: string[]) => {
  return (req: any, res: any, next: any) => {
    const user = req.user
    if (!user || !allowedTypes.includes(user.membership?.type)) {
      return res.status(403).json({ error: '權限不足' })
    }
    next()
  }
}

export const createAppointmentRoutes = (db: any) => {
  const router = Router()
  const appointmentController = new AppointmentController(db)

  // ===== APPOINTMENT SLOTS ROUTES =====
  
  // 創建預約時段 (需要 VIP+ 權限)
  router.post('/slots', 
    authMiddleware,
    validateMembership(['vip', 'vvip']),
    appointmentController.createSlot
  )

  // 獲取可用時段 (公開或需要登入)
  router.get('/slots/available', 
    optionalAuthMiddleware,
    appointmentController.getAvailableSlots
  )

  // 獲取時段詳情
  router.get('/slots/:slotId', 
    optionalAuthMiddleware,
    appointmentController.getSlotById
  )

  // 更新時段 (需要 VIP+ 權限)
  router.put('/slots/:slotId', 
    authMiddleware,
    validateMembership(['vip', 'vvip']),
    appointmentController.updateSlot
  )

  // 刪除時段 (需要 VIP+ 權限)
  router.delete('/slots/:slotId', 
    authMiddleware,
    validateMembership(['vip', 'vvip']),
    appointmentController.deleteSlot
  )

  // ===== APPOINTMENT BOOKING ROUTES =====
  
  // 創建預約 (訪客也可以預約資詢)
  router.post('/bookings', 
    optionalAuthMiddleware,
    appointmentController.createBooking
  )

  // 獲取用戶預約
  router.get('/bookings', 
    optionalAuthMiddleware,
    appointmentController.getUserBookings
  )

  // 獲取預約詳情
  router.get('/bookings/:bookingId', 
    optionalAuthMiddleware,
    async (req, res, next) => {
      // 檢查用戶是否有權限查看此預約
      const bookingId = req.params.bookingId
      const user = (req as any).user
      
      try {
        const appointmentController = new AppointmentController(db)
        const booking = await (appointmentController as any).bookingModel.getById(bookingId)
        
        if (!booking) {
          return res.status(404).json({ error: '預約不存在' })
        }

        // 檢查權限：預約者本人、VIP+會員、或訪客通過email驗證
        const isOwner = booking.userId && user?.userId === booking.userId
        const isVipOrAbove = user?.membership?.type === 'vip' || user?.membership?.type === 'vvip'
        const isGuestWithEmail = booking.guestInfo?.email && req.query.email === booking.guestInfo.email

        if (!isOwner && !isVipOrAbove && !isGuestWithEmail) {
          return res.status(403).json({ error: '無權限查看此預約' })
        }

        next()
      } catch (error) {
        return res.status(500).json({ error: '驗證預約權限失敗' })
      }
    },
    async (req, res) => {
      const bookingId = req.params.bookingId
      const appointmentController = new AppointmentController(db)
      const booking = await (appointmentController as any).getBookingWithDetails(bookingId)
      res.json({ booking })
    }
  )

  // 更新預約狀態 (需要 VIP+ 權限)
  router.put('/bookings/:bookingId/status', 
    authMiddleware,
    validateMembership(['vip', 'vvip']),
    appointmentController.updateBookingStatus
  )

  // 重新安排預約 (預約者本人或 VIP+)
  router.put('/bookings/:bookingId/reschedule', 
    optionalAuthMiddleware,
    async (req, res, next) => {
      // 檢查重新安排權限
      const bookingId = req.params.bookingId
      const user = (req as any).user
      
      try {
        const appointmentController = new AppointmentController(db)
        const booking = await (appointmentController as any).bookingModel.getById(bookingId)
        
        if (!booking) {
          return res.status(404).json({ error: '預約不存在' })
        }

        const isOwner = booking.userId && user?.userId === booking.userId
        const isVipOrAbove = user?.membership?.type === 'vip' || user?.membership?.type === 'vvip'
        const isGuestWithEmail = booking.guestInfo?.email && req.body.guestEmail === booking.guestInfo.email

        if (!isOwner && !isVipOrAbove && !isGuestWithEmail) {
          return res.status(403).json({ error: '無權限重新安排此預約' })
        }

        next()
      } catch (error) {
        return res.status(500).json({ error: '驗證預約權限失敗' })
      }
    },
    appointmentController.rescheduleBooking
  )

  // 取消預約 (預約者本人或 VIP+)
  router.put('/bookings/:bookingId/cancel', 
    optionalAuthMiddleware,
    async (req, res, next) => {
      // 檢查取消權限
      const bookingId = req.params.bookingId
      const user = (req as any).user
      
      try {
        const appointmentController = new AppointmentController(db)
        const booking = await (appointmentController as any).bookingModel.getById(bookingId)
        
        if (!booking) {
          return res.status(404).json({ error: '預約不存在' })
        }

        const isOwner = booking.userId && user?.userId === booking.userId
        const isVipOrAbove = user?.membership?.type === 'vip' || user?.membership?.type === 'vvip'
        const isGuestWithEmail = booking.guestInfo?.email && req.body.guestEmail === booking.guestInfo.email

        if (!isOwner && !isVipOrAbove && !isGuestWithEmail) {
          return res.status(403).json({ error: '無權限取消此預約' })
        }

        next()
      } catch (error) {
        return res.status(500).json({ error: '驗證預約權限失敗' })
      }
    },
    appointmentController.cancelBooking
  )

  // ===== INTERVIEWER ROUTES =====
  
  // 創建面試官 (需要 VVIP 權限)
  router.post('/interviewers', 
    authMiddleware,
    validateMembership(['vvip']),
    async (req, res) => {
      try {
        const appointmentController = new AppointmentController(db)
        const interviewerData = req.body
        
        // 驗證必要字段
        if (!interviewerData.name || !interviewerData.email || !interviewerData.appointmentTypes) {
          return res.status(400).json({ error: '缺少必要字段' })
        }

        const interviewer = await (appointmentController as any).interviewerModel.create({
          ...interviewerData,
          userId: interviewerData.userId || (req as any).user.userId
        })

        res.status(201).json({
          message: '面試官創建成功',
          interviewer
        })
      } catch (error) {
        console.error('創建面試官錯誤:', error)
        res.status(500).json({ error: '創建面試官失敗' })
      }
    }
  )

  // 獲取活躍面試官列表
  router.get('/interviewers', 
    optionalAuthMiddleware,
    async (req, res) => {
      try {
        const appointmentController = new AppointmentController(db)
        const { appointmentType, interviewType } = req.query
        
        const interviewers = await (appointmentController as any).interviewerModel.getActiveInterviewers(
          appointmentType as any,
          interviewType as any
        )

        res.json({
          interviewers,
          total: interviewers.length
        })
      } catch (error) {
        console.error('獲取面試官列表錯誤:', error)
        res.status(500).json({ error: '獲取面試官列表失敗' })
      }
    }
  )

  // 獲取面試官詳情
  router.get('/interviewers/:interviewerId', 
    optionalAuthMiddleware,
    async (req, res) => {
      try {
        const appointmentController = new AppointmentController(db)
        const { interviewerId } = req.params
        
        const interviewer = await (appointmentController as any).interviewerModel.getById(interviewerId)
        if (!interviewer) {
          return res.status(404).json({ error: '面試官不存在' })
        }

        // 獲取績效統計
        const stats = await (appointmentController as any).interviewerModel.getPerformanceStats(interviewerId)

        res.json({
          interviewer,
          stats
        })
      } catch (error) {
        console.error('獲取面試官詳情錯誤:', error)
        res.status(500).json({ error: '獲取面試官詳情失敗' })
      }
    }
  )

  // 更新面試官資料 (需要 VVIP 權限或本人)
  router.put('/interviewers/:interviewerId', 
    authMiddleware,
    async (req, res) => {
      try {
        const appointmentController = new AppointmentController(db)
        const { interviewerId } = req.params
        const user = (req as any).user
        
        const interviewer = await (appointmentController as any).interviewerModel.getById(interviewerId)
        if (!interviewer) {
          return res.status(404).json({ error: '面試官不存在' })
        }

        // 檢查權限：本人或 VVIP
        const isOwner = interviewer.userId === user.userId
        const isVVIP = user.membership?.type === 'vvip'

        if (!isOwner && !isVVIP) {
          return res.status(403).json({ error: '無權限修改面試官資料' })
        }

        const updatedInterviewer = await (appointmentController as any).interviewerModel.update(
          interviewerId, 
          req.body
        )

        res.json({
          message: '面試官資料更新成功',
          interviewer: updatedInterviewer
        })
      } catch (error) {
        console.error('更新面試官錯誤:', error)
        res.status(500).json({ error: '更新面試官失敗' })
      }
    }
  )

  // 設置面試官可用性
  router.put('/interviewers/:interviewerId/availability', 
    authMiddleware,
    async (req, res) => {
      try {
        const appointmentController = new AppointmentController(db)
        const { interviewerId } = req.params
        const { dayOfWeek, availability } = req.body
        const user = (req as any).user
        
        const interviewer = await (appointmentController as any).interviewerModel.getById(interviewerId)
        if (!interviewer) {
          return res.status(404).json({ error: '面試官不存在' })
        }

        // 檢查權限：本人或 VVIP
        const isOwner = interviewer.userId === user.userId
        const isVVIP = user.membership?.type === 'vvip'

        if (!isOwner && !isVVIP) {
          return res.status(403).json({ error: '無權限設置面試官可用性' })
        }

        const updatedInterviewer = await (appointmentController as any).interviewerModel.setAvailability(
          interviewerId, 
          dayOfWeek,
          availability
        )

        res.json({
          message: '面試官可用性設置成功',
          interviewer: updatedInterviewer
        })
      } catch (error) {
        console.error('設置面試官可用性錯誤:', error)
        res.status(500).json({ error: '設置面試官可用性失敗' })
      }
    }
  )

  // ===== STATISTICS AND ADMIN ROUTES =====
  
  // 獲取統計數據 (需要 VIP+ 權限)
  router.get('/stats', 
    authMiddleware,
    validateMembership(['vip', 'vvip']),
    appointmentController.getStats
  )

  // 獲取今日預約 (需要 VIP+ 權限)
  router.get('/today', 
    authMiddleware,
    validateMembership(['vip', 'vvip']),
    appointmentController.getTodaysBookings
  )

  // 獲取需要提醒的預約 (系統內部使用)
  router.get('/reminders', 
    authMiddleware,
    validateMembership(['vvip']),
    async (req, res) => {
      try {
        const appointmentController = new AppointmentController(db)
        const { hours = 24 } = req.query
        
        const bookings = await (appointmentController as any).bookingModel.getBookingsNeedingReminder(
          parseInt(hours as string)
        )

        const bookingsWithDetails = await Promise.all(
          bookings.map((booking: any) => 
            (appointmentController as any).getBookingWithDetails(booking._id)
          )
        )

        res.json({
          bookings: bookingsWithDetails,
          total: bookingsWithDetails.length
        })
      } catch (error) {
        console.error('獲取需要提醒的預約錯誤:', error)
        res.status(500).json({ error: '獲取需要提醒的預約失敗' })
      }
    }
  )

  // 獲取最佳面試官 (需要 VIP+ 權限)
  router.get('/interviewers/top-performers', 
    authMiddleware,
    validateMembership(['vip', 'vvip']),
    async (req, res) => {
      try {
        const appointmentController = new AppointmentController(db)
        const { limit = 5 } = req.query
        
        const topPerformers = await (appointmentController as any).interviewerModel.getTopPerformers(
          parseInt(limit as string)
        )

        res.json({
          topPerformers,
          total: topPerformers.length
        })
      } catch (error) {
        console.error('獲取最佳面試官錯誤:', error)
        res.status(500).json({ error: '獲取最佳面試官失敗' })
      }
    }
  )

  return router
}