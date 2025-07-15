// Interviewer Model - 面試官管理
// InfinityMatch 天造地設人成對 - 1+1=∞ 台灣頂級配對平台

import { Interviewer, AppointmentType, InterviewType } from '../types/appointments'

export class InterviewerModel {
  private db: any
  
  constructor(db: any) {
    this.db = db
  }

  // 創建面試官
  async create(interviewerData: Omit<Interviewer, '_id' | 'createdAt' | 'updatedAt'>): Promise<Interviewer> {
    const interviewer = {
      ...interviewerData,
      // Don't set _id - let NeDB generate it automatically
      totalAppointments: 0,
      completedAppointments: 0,
      averageRating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      this.db.interviewers.insert(interviewer, (err: any, doc: Interviewer) => {
        if (err) {
          reject(new Error(`創建面試官失敗: ${err.message}`))
          return
        }
        resolve(doc)
      })
    })
  }

  // 根據ID獲取面試官
  async getById(interviewerId: string): Promise<Interviewer | null> {
    return new Promise((resolve, reject) => {
      this.db.interviewers.findOne({ _id: interviewerId }, (err: any, doc: Interviewer) => {
        if (err) {
          reject(new Error(`查詢面試官失敗: ${err.message}`))
          return
        }
        resolve(doc)
      })
    })
  }

  // 根據姓名獲取面試官
  async getByName(name: string): Promise<Interviewer | null> {
    return new Promise((resolve, reject) => {
      this.db.interviewers.findOne({ name }, (err: any, doc: Interviewer) => {
        if (err) {
          reject(new Error(`查詢面試官失敗: ${err.message}`))
          return
        }
        resolve(doc)
      })
    })
  }

  // 根據聯絡信箱獲取面試官
  async getByEmail(email: string): Promise<Interviewer | null> {
    return new Promise((resolve, reject) => {
      this.db.interviewers.findOne({ email }, (err: any, doc: Interviewer) => {
        if (err) {
          reject(new Error(`查詢面試官失敗: ${err.message}`))
          return
        }
        resolve(doc)
      })
    })
  }

  // 獲取所有活躍面試官
  async getActiveInterviewers(
    appointmentType?: AppointmentType,
    interviewType?: InterviewType
  ): Promise<Interviewer[]> {
    const query: any = { isActive: true }
    
    if (appointmentType) {
      query.appointmentTypes = appointmentType
    }
    
    if (interviewType) {
      query.interviewTypes = interviewType
    }
    
    return new Promise((resolve, reject) => {
      this.db.interviewers.find(query)
        .sort({ averageRating: -1, totalAppointments: -1 })
        .exec((err: any, docs: Interviewer[]) => {
          if (err) {
            reject(new Error(`查詢活躍面試官失敗: ${err.message}`))
            return
          }
          resolve(docs)
        })
    })
  }

  // 檢查面試官可用性
  async checkAvailability(
    interviewerId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const interviewer = await this.getById(interviewerId)
    if (!interviewer || !interviewer.isActive) {
      return false
    }
    
    // 檢查基本可用性設置
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const dayAvailability = interviewer.defaultAvailability[dayOfWeek]
    
    if (!dayAvailability || !dayAvailability.enabled) {
      return false
    }
    
    // 檢查時間範圍
    if (startTime < dayAvailability.startTime || endTime > dayAvailability.endTime) {
      return false
    }
    
    // 檢查休息時間
    if (dayAvailability.breakTimes) {
      for (const breakTime of dayAvailability.breakTimes) {
        if (
          (startTime >= breakTime.startTime && startTime < breakTime.endTime) ||
          (endTime > breakTime.startTime && endTime <= breakTime.endTime) ||
          (startTime <= breakTime.startTime && endTime >= breakTime.endTime)
        ) {
          return false
        }
      }
    }
    
    return true
  }

  // 獲取面試官當日預約數量
  async getDailyAppointmentCount(interviewerId: string, date: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.count(
        { 
          interviewerId,
          date,
          bookedCount: { $gt: 0 }
        },
        (err: any, count: number) => {
          if (err) {
            reject(new Error(`查詢當日預約數量失敗: ${err.message}`))
            return
          }
          resolve(count)
        }
      )
    })
  }

  // 更新面試官信息
  async update(interviewerId: string, updates: Partial<Interviewer>): Promise<Interviewer | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    }
    
    return new Promise((resolve, reject) => {
      this.db.interviewers.update(
        { _id: interviewerId },
        { $set: updateData },
        {},
        (err: any, numReplaced: number) => {
          if (err) {
            reject(new Error(`更新面試官失敗: ${err.message}`))
            return
          }
          
          if (numReplaced === 0) {
            resolve(null)
            return
          }
          
          this.getById(interviewerId).then(resolve).catch(reject)
        }
      )
    })
  }

  // 更新統計數據
  async updateStats(
    interviewerId: string,
    incrementAppointments: number = 0,
    incrementCompleted: number = 0,
    newRating?: number
  ): Promise<Interviewer | null> {
    const interviewer = await this.getById(interviewerId)
    if (!interviewer) {
      return null
    }
    
    const newTotalAppointments = interviewer.totalAppointments + incrementAppointments
    const newCompletedAppointments = interviewer.completedAppointments + incrementCompleted
    
    let newAverageRating = interviewer.averageRating
    if (newRating && newRating > 0) {
      // 計算新的平均評分
      const totalRatings = interviewer.completedAppointments * interviewer.averageRating
      const newTotalRatings = totalRatings + newRating
      newAverageRating = newTotalRatings / newCompletedAppointments
    }
    
    return this.update(interviewerId, {
      totalAppointments: newTotalAppointments,
      completedAppointments: newCompletedAppointments,
      averageRating: newAverageRating
    })
  }

  // 設置面試官可用性
  async setAvailability(
    interviewerId: string,
    dayOfWeek: string,
    availability: {
      enabled: boolean
      startTime: string
      endTime: string
      breakTimes?: Array<{
        startTime: string
        endTime: string
      }>
    }
  ): Promise<Interviewer | null> {
    const updateData = {
      [`defaultAvailability.${dayOfWeek}`]: availability,
      updatedAt: new Date()
    }
    
    return new Promise((resolve, reject) => {
      this.db.interviewers.update(
        { _id: interviewerId },
        { $set: updateData },
        {},
        (err: any, numReplaced: number) => {
          if (err) {
            reject(new Error(`設置面試官可用性失敗: ${err.message}`))
            return
          }
          
          if (numReplaced === 0) {
            resolve(null)
            return
          }
          
          this.getById(interviewerId).then(resolve).catch(reject)
        }
      )
    })
  }

  // 停用面試官
  async deactivate(interviewerId: string): Promise<Interviewer | null> {
    return this.update(interviewerId, { isActive: false })
  }

  // 啟用面試官
  async activate(interviewerId: string): Promise<Interviewer | null> {
    return this.update(interviewerId, { isActive: true })
  }

  // 刪除面試官
  async delete(interviewerId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.interviewers.remove({ _id: interviewerId }, {}, (err: any, numRemoved: number) => {
        if (err) {
          reject(new Error(`刪除面試官失敗: ${err.message}`))
          return
        }
        resolve(numRemoved > 0)
      })
    })
  }

  // 獲取面試官績效統計
  async getPerformanceStats(interviewerId: string, startDate?: string, endDate?: string): Promise<any> {
    const interviewer = await this.getById(interviewerId)
    if (!interviewer) {
      throw new Error('面試官不存在')
    }
    
    // 獲取該面試官的預約統計
    const query: any = { interviewerId }
    
    if (startDate) {
      query.scheduledDate = { $gte: startDate }
    }
    
    if (endDate) {
      query.scheduledDate = query.scheduledDate || {}
      query.scheduledDate.$lte = endDate
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointment_bookings.find(query, (err: any, bookings: any[]) => {
        if (err) {
          reject(new Error(`獲取面試官績效統計失敗: ${err.message}`))
          return
        }
        
        const stats = {
          totalBookings: bookings.length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
          noShowBookings: bookings.filter(b => b.status === 'no_show').length,
          completionRate: bookings.length > 0 ? 
            bookings.filter(b => b.status === 'completed').length / bookings.length : 0,
          averageRating: this.calculateAverageRating(bookings),
          ratingCount: bookings.filter(b => b.rating && b.rating > 0).length,
          consultationBookings: bookings.filter(b => b.type === 'consultation').length,
          interviewBookings: bookings.filter(b => b.type === 'member_interview').length
        }
        
        resolve(stats)
      })
    })
  }

  // 獲取最佳面試官（基於評分和完成率）
  async getTopPerformers(limit: number = 5): Promise<Interviewer[]> {
    return new Promise((resolve, reject) => {
      this.db.interviewers.find({ 
        isActive: true,
        completedAppointments: { $gt: 0 }
      })
        .sort({ 
          averageRating: -1, 
          completedAppointments: -1 
        })
        .limit(limit)
        .exec((err: any, docs: Interviewer[]) => {
          if (err) {
            reject(new Error(`獲取最佳面試官失敗: ${err.message}`))
            return
          }
          resolve(docs)
        })
    })
  }

  // 私有輔助函數：計算平均評分
  private calculateAverageRating(bookings: any[]): number {
    const ratingsBookings = bookings.filter(b => b.rating && b.rating > 0)
    if (ratingsBookings.length === 0) return 0
    
    const totalRating = ratingsBookings.reduce((sum, b) => sum + (b.rating || 0), 0)
    return totalRating / ratingsBookings.length
  }
}