// Event Type Model - Lookup table for event categories
// Provides structured event categorization with metadata

export interface EventType {
  typeId: string
  name: string // 中文名稱
  displayName: string // 顯示名稱
  description?: string
  color?: string // Hex color for UI display
  icon?: string // Icon identifier
  isActive: boolean
  sortOrder: number
  metadata?: {
    defaultDuration?: number // minutes
    suggestedPricing?: {
      male?: number
      female?: number
    }
    commonRequirements?: {
      ageMin?: number
      ageMax?: number
    }
  }
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  lastModifiedBy?: string
}

export class EventTypeModel {
  private db: any

  constructor(database: any) {
    this.db = database
  }

  // Create new event type
  async create(eventTypeData: Omit<EventType, 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: EventType; error?: string }> {
    try {
      // Check if typeId already exists
      const existing = await this.findByTypeId(eventTypeData.typeId)
      if (existing.data) {
        return { success: false, error: '事件類型ID已存在' }
      }

      const eventType: EventType = {
        ...eventTypeData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return new Promise((resolve) => {
        this.db.insert(eventType, (err: any, doc: EventType) => {
          if (err) {
            resolve({ success: false, error: err.message })
          } else {
            resolve({ success: true, data: doc })
          }
        })
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Find event type by typeId
  async findByTypeId(typeId: string): Promise<{ success: boolean; data?: EventType; error?: string }> {
    return new Promise((resolve) => {
      this.db.findOne({ typeId }, (err: any, doc: EventType) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true, data: doc })
        }
      })
    })
  }

  // Get all active event types (sorted by sortOrder)
  async findAllActive(): Promise<{ success: boolean; data?: EventType[]; error?: string }> {
    return new Promise((resolve) => {
      this.db.find({ isActive: true }).sort({ sortOrder: 1 }).exec((err: any, docs: EventType[]) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true, data: docs })
        }
      })
    })
  }

  // Get all event types (for admin management)
  async findAll(): Promise<{ success: boolean; data?: EventType[]; error?: string }> {
    return new Promise((resolve) => {
      this.db.find({}).sort({ sortOrder: 1 }).exec((err: any, docs: EventType[]) => {
        if (err) {
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true, data: docs })
        }
      })
    })
  }

  // Update event type
  async update(typeId: string, updates: Partial<EventType>): Promise<{ success: boolean; data?: EventType; error?: string }> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }

      return new Promise((resolve) => {
        this.db.update({ typeId }, { $set: updateData }, { returnUpdatedDocs: true }, (err: any, numReplaced: number, doc: EventType) => {
          if (err) {
            resolve({ success: false, error: err.message })
          } else if (numReplaced === 0) {
            resolve({ success: false, error: '事件類型不存在' })
          } else {
            resolve({ success: true, data: doc })
          }
        })
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Delete event type (soft delete by setting isActive to false)
  async delete(typeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return new Promise((resolve) => {
        this.db.update({ typeId }, { $set: { isActive: false, updatedAt: new Date() } }, {}, (err: any, numReplaced: number) => {
          if (err) {
            resolve({ success: false, error: err.message })
          } else if (numReplaced === 0) {
            resolve({ success: false, error: '事件類型不存在' })
          } else {
            resolve({ success: true })
          }
        })
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Permanently delete event type (use with caution)
  async hardDelete(typeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return new Promise((resolve) => {
        this.db.remove({ typeId }, {}, (err: any, numRemoved: number) => {
          if (err) {
            resolve({ success: false, error: err.message })
          } else if (numRemoved === 0) {
            resolve({ success: false, error: '事件類型不存在' })
          } else {
            resolve({ success: true })
          }
        })
      })
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Reorder event types
  async reorder(typeOrders: { typeId: string; sortOrder: number }[]): Promise<{ success: boolean; error?: string }> {
    try {
      const updatePromises = typeOrders.map(({ typeId, sortOrder }) => 
        new Promise<void>((resolve, reject) => {
          this.db.update({ typeId }, { $set: { sortOrder, updatedAt: new Date() } }, {}, (err: any) => {
            if (err) reject(err)
            else resolve()
          })
        })
      )

      await Promise.all(updatePromises)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Initialize default event types for the platform
  async initializeDefaultTypes(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if any event types already exist
      const existing = await this.findAll()
      if (existing.data && existing.data.length > 0) {
        return { success: true } // Already initialized
      }

      const defaultTypes: Omit<EventType, 'createdAt' | 'updatedAt'>[] = [
        {
          typeId: 'outdoor_adventure',
          name: '戶外活動',
          displayName: '戶外冒險',
          description: '登山、健行、水上活動等戶外體驗',
          color: '#22C55E',
          icon: 'mountain',
          isActive: true,
          sortOrder: 1,
          metadata: {
            defaultDuration: 480, // 8 hours
            suggestedPricing: { male: 1500, female: 1200 },
            commonRequirements: { ageMin: 20, ageMax: 50 }
          },
          createdBy: 'system'
        },
        {
          typeId: 'gourmet_dining',
          name: '美食體驗',
          displayName: '美食饗宴',
          description: '精緻餐廳、特色料理、品酒活動',
          color: '#F59E0B',
          icon: 'utensils',
          isActive: true,
          sortOrder: 2,
          metadata: {
            defaultDuration: 240, // 4 hours
            suggestedPricing: { male: 1200, female: 1000 },
            commonRequirements: { ageMin: 25, ageMax: 55 }
          },
          createdBy: 'system'
        },
        {
          typeId: 'cultural_arts',
          name: '文化藝術',
          displayName: '文化探索',
          description: '博物館、音樂會、藝術展覽、手作體驗',
          color: '#8B5CF6',
          icon: 'palette',
          isActive: true,
          sortOrder: 3,
          metadata: {
            defaultDuration: 180, // 3 hours
            suggestedPricing: { male: 800, female: 800 },
            commonRequirements: { ageMin: 22, ageMax: 60 }
          },
          createdBy: 'system'
        },
        {
          typeId: 'wellness_spa',
          name: '健康養生',
          displayName: '身心療癒',
          description: 'SPA、瑜伽、冥想、溫泉體驗',
          color: '#06B6D4',
          icon: 'heart',
          isActive: true,
          sortOrder: 4,
          metadata: {
            defaultDuration: 300, // 5 hours
            suggestedPricing: { male: 1800, female: 1500 },
            commonRequirements: { ageMin: 25, ageMax: 65 }
          },
          createdBy: 'system'
        },
        {
          typeId: 'travel_exploration',
          name: '旅遊探索',
          displayName: '深度旅遊',
          description: '在地文化體驗、秘境探索、主題旅行',
          color: '#DC2626',
          icon: 'map',
          isActive: true,
          sortOrder: 5,
          metadata: {
            defaultDuration: 720, // 12 hours (full day)
            suggestedPricing: { male: 2500, female: 2200 },
            commonRequirements: { ageMin: 20, ageMax: 55 }
          },
          createdBy: 'system'
        },
        {
          typeId: 'social_networking',
          name: '社交聚會',
          displayName: '社交聯誼',
          description: '交友聚會、主題派對、興趣分享',
          color: '#EC4899',
          icon: 'users',
          isActive: true,
          sortOrder: 6,
          metadata: {
            defaultDuration: 180, // 3 hours
            suggestedPricing: { male: 600, female: 500 },
            commonRequirements: { ageMin: 20, ageMax: 50 }
          },
          createdBy: 'system'
        },
        {
          typeId: 'learning_workshop',
          name: '學習工作坊',
          displayName: '技能學習',
          description: '專業課程、技能培養、興趣班',
          color: '#7C3AED',
          icon: 'academic-cap',
          isActive: true,
          sortOrder: 7,
          metadata: {
            defaultDuration: 240, // 4 hours
            suggestedPricing: { male: 1000, female: 1000 },
            commonRequirements: { ageMin: 18, ageMax: 65 }
          },
          createdBy: 'system'
        }
      ]

      // Create all default types
      for (const typeData of defaultTypes) {
        await this.create(typeData)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}