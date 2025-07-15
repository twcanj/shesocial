// AppointmentSlot Model - 預約時段管理
// InfinityMatch 天造地設人成對 - 1+1=∞ 台灣頂級配對平台

import { AppointmentSlot, AppointmentType, InterviewType, RecurringPattern } from '../types/appointments'

export class AppointmentSlotModel {
  private db: any
  
  constructor(db: any) {
    this.db = db
  }

  // 創建預約時段
  async create(slotData: Omit<AppointmentSlot, '_id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentSlot> {
    const slot = {
      ...slotData,
      // Don't set _id - let NeDB generate it automatically
      bookedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      this.db.appointments_slots.insert(slot, (err: any, doc: AppointmentSlot) => {
        if (err) {
          reject(new Error(`創建預約時段失敗: ${err.message}`))
          return
        }
        resolve(doc)
      })
    })
  }

  // 批量創建重複時段
  async createRecurringSlots(
    baseSlot: Omit<AppointmentSlot, '_id' | 'createdAt' | 'updatedAt'>,
    pattern: RecurringPattern
  ): Promise<AppointmentSlot[]> {
    const slots: AppointmentSlot[] = []
    const startDate = new Date(baseSlot.date)
    
    const maxSlots = pattern.maxOccurrences || 52 // 默認一年
    let currentDate = new Date(startDate)
    
    for (let i = 0; i < maxSlots; i++) {
      // 檢查結束日期
      if (pattern.endDate && currentDate > new Date(pattern.endDate)) {
        break
      }
      
      // 檢查星期幾 (如果是週重複)
      if (pattern.type === 'weekly' && pattern.daysOfWeek) {
        if (!pattern.daysOfWeek.includes(currentDate.getDay())) {
          currentDate = this.getNextDate(currentDate, pattern)
          continue
        }
      }
      
      const slotForDate = {
        ...baseSlot,
        // Don't set _id - let NeDB generate it automatically
        date: currentDate.toISOString().split('T')[0],
        parentSlotId: i === 0 ? undefined : slots[0]?._id,
        bookedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      try {
        const createdSlot = await this.create(slotForDate)
        slots.push(createdSlot)
      } catch (error) {
        console.error(`創建重複時段失敗 ${currentDate.toISOString()}:`, error)
      }
      
      currentDate = this.getNextDate(currentDate, pattern)
    }
    
    return slots
  }

  // 獲取可用時段
  async getAvailableSlots(
    type: AppointmentType,
    startDate: string,
    endDate?: string,
    interviewerId?: string
  ): Promise<AppointmentSlot[]> {
    const query: any = {
      type,
      isAvailable: true,
      date: { $gte: startDate }
    }
    
    if (endDate) {
      query.date.$lte = endDate
    }
    
    if (interviewerId) {
      query.interviewerId = interviewerId
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.find(query)
        .sort({ date: 1, startTime: 1 })
        .exec((err: any, docs: AppointmentSlot[]) => {
          if (err) {
            reject(new Error(`查詢可用時段失敗: ${err.message}`))
            return
          }
          
          // 過濾掉已滿的時段
          const availableSlots = docs.filter(slot => slot.bookedCount < slot.capacity)
          resolve(availableSlots)
        })
    })
  }

  // 根據ID獲取時段
  async getById(slotId: string): Promise<AppointmentSlot | null> {
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.findOne({ _id: slotId }, (err: any, doc: AppointmentSlot) => {
        if (err) {
          reject(new Error(`查詢預約時段失敗: ${err.message}`))
          return
        }
        resolve(doc)
      })
    })
  }

  // 更新預約數量
  async updateBookedCount(slotId: string, increment: number): Promise<AppointmentSlot | null> {
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.update(
        { _id: slotId },
        { 
          $inc: { bookedCount: increment },
          $set: { updatedAt: new Date() }
        },
        {},
        (err: any, numReplaced: number) => {
          if (err) {
            reject(new Error(`更新預約數量失敗: ${err.message}`))
            return
          }
          
          if (numReplaced === 0) {
            resolve(null)
            return
          }
          
          // 返回更新後的文檔
          this.getById(slotId).then(resolve).catch(reject)
        }
      )
    })
  }

  // 檢查時段衝突
  async checkConflict(
    interviewerId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeSlotId?: string
  ): Promise<boolean> {
    const query: any = {
      interviewerId,
      date,
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
          ]
        }
      ]
    }
    
    if (excludeSlotId) {
      query._id = { $ne: excludeSlotId }
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.findOne(query, (err: any, doc: AppointmentSlot) => {
        if (err) {
          reject(new Error(`檢查時段衝突失敗: ${err.message}`))
          return
        }
        resolve(!!doc) // 有文檔表示有衝突
      })
    })
  }

  // 更新時段
  async update(slotId: string, updates: Partial<AppointmentSlot>): Promise<AppointmentSlot | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.update(
        { _id: slotId },
        { $set: updateData },
        {},
        (err: any, numReplaced: number) => {
          if (err) {
            reject(new Error(`更新預約時段失敗: ${err.message}`))
            return
          }
          
          if (numReplaced === 0) {
            resolve(null)
            return
          }
          
          this.getById(slotId).then(resolve).catch(reject)
        }
      )
    })
  }

  // 刪除時段
  async delete(slotId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.remove({ _id: slotId }, {}, (err: any, numRemoved: number) => {
        if (err) {
          reject(new Error(`刪除預約時段失敗: ${err.message}`))
          return
        }
        resolve(numRemoved > 0)
      })
    })
  }

  // 獲取面試官的所有時段
  async getByInterviewer(
    interviewerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AppointmentSlot[]> {
    const query: any = { interviewerId }
    
    if (startDate) {
      query.date = { $gte: startDate }
    }
    
    if (endDate) {
      query.date = query.date || {}
      query.date.$lte = endDate
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.find(query)
        .sort({ date: 1, startTime: 1 })
        .exec((err: any, docs: AppointmentSlot[]) => {
          if (err) {
            reject(new Error(`查詢面試官時段失敗: ${err.message}`))
            return
          }
          resolve(docs)
        })
    })
  }

  // 獲取統計數據
  async getStats(startDate?: string, endDate?: string): Promise<any> {
    const query: any = {}
    
    if (startDate) {
      query.date = { $gte: startDate }
    }
    
    if (endDate) {
      query.date = query.date || {}
      query.date.$lte = endDate
    }
    
    return new Promise((resolve, reject) => {
      this.db.appointments_slots.find(query, (err: any, docs: AppointmentSlot[]) => {
        if (err) {
          reject(new Error(`獲取統計數據失敗: ${err.message}`))
          return
        }
        
        const stats = {
          totalSlots: docs.length,
          availableSlots: docs.filter(slot => slot.isAvailable && slot.bookedCount < slot.capacity).length,
          fullyBookedSlots: docs.filter(slot => slot.bookedCount >= slot.capacity).length,
          consultationSlots: docs.filter(slot => slot.type === 'consultation').length,
          interviewSlots: docs.filter(slot => slot.type === 'member_interview').length,
          totalCapacity: docs.reduce((sum, slot) => sum + slot.capacity, 0),
          totalBooked: docs.reduce((sum, slot) => sum + slot.bookedCount, 0)
        }
        
        resolve(stats)
      })
    })
  }

  // 輔助函數：根據重複模式計算下一個日期
  private getNextDate(currentDate: Date, pattern: RecurringPattern): Date {
    const nextDate = new Date(currentDate)
    
    switch (pattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval)
        break
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * pattern.interval))
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + pattern.interval)
        break
    }
    
    return nextDate
  }
}