// Event Model - Business Logic for Event Operations
import Datastore from '@seald-io/nedb'
import { EventData, ApiResponse, EventFilters } from '../types/database'

export class EventModel {
  private db: Datastore<EventData>

  constructor(database: Datastore<EventData>) {
    this.db = database
  }

  // Create new event
  async create(eventData: Omit<EventData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EventData>> {
    try {
      const now = new Date()
      const newEvent: EventData = {
        ...eventData,
        createdAt: now,
        updatedAt: now,
        lastSync: now
      }

      return new Promise((resolve) => {
        this.db.insert(newEvent, (err, doc) => {
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

  // Find event by ID
  async findById(id: string): Promise<ApiResponse<EventData>> {
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
            error: 'Event not found',
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

  // Update event
  async update(id: string, updateData: Partial<EventData>): Promise<ApiResponse<EventData>> {
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
                error: 'Event not found',
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

  // Delete event
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
            error: 'Event not found',
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

  // Find all events with pagination
  async findAll(page: number = 1, limit: number = 10): Promise<ApiResponse<EventData[]>> {
    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find({})
        .sort({ 'metadata.date': 1 })
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

  // Search events with filters
  async search(filters: EventFilters, page: number = 1, limit: number = 10): Promise<ApiResponse<EventData[]>> {
    const query: any = {}

    if (filters.location) {
      query['metadata.location'] = new RegExp(filters.location, 'i')
    }

    if (filters.dateRange) {
      query['metadata.date'] = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      }
    }

    if (filters.type) {
      query['metadata.type'] = filters.type
    }

    if (filters.priceRange) {
      query.$or = [
        {
          'metadata.pricing.male': {
            $gte: filters.priceRange.min,
            $lte: filters.priceRange.max
          }
        },
        {
          'metadata.pricing.female': {
            $gte: filters.priceRange.min,
            $lte: filters.priceRange.max
          }
        }
      ]
    }

    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find(query)
        .sort({ 'metadata.date': 1 })
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

  // Get upcoming events
  async getUpcoming(page: number = 1, limit: number = 10): Promise<ApiResponse<EventData[]>> {
    const now = new Date()
    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find({
        'metadata.date': { $gte: now },
        status: { $in: ['published', 'draft'] }
      })
        .sort({ 'metadata.date': 1 })
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

  // Add participant to event
  async addParticipant(eventId: string, userId: string): Promise<ApiResponse<EventData>> {
    return new Promise((resolve) => {
      this.db.findOne({ _id: eventId }, (err, event) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
          return
        }

        if (!event) {
          resolve({
            success: false,
            error: 'Event not found',
            timestamp: Date.now()
          })
          return
        }

        // Check if user already registered
        const existingParticipant = event.participants.find(p => p.userId === userId)
        if (existingParticipant) {
          resolve({
            success: false,
            error: 'User already registered for this event',
            timestamp: Date.now()
          })
          return
        }

        // Check if event is full
        if (event.participants.length >= event.maxParticipants) {
          resolve({
            success: false,
            error: 'Event is full',
            timestamp: Date.now()
          })
          return
        }

        // Add participant
        const newParticipant = {
          userId,
          status: 'pending' as const,
          paid: false,
          joinedAt: new Date()
        }

        this.db.update(
          { _id: eventId },
          {
            $push: { participants: newParticipant },
            $set: { updatedAt: new Date(), lastSync: new Date() }
          },
          { returnUpdatedDocs: true },
          (updateErr, numReplaced, updatedDoc) => {
            if (updateErr) {
              resolve({
                success: false,
                error: updateErr.message,
                timestamp: Date.now()
              })
            } else {
              resolve({
                success: true,
                data: updatedDoc as any,
                timestamp: Date.now()
              })
            }
          }
        )
      })
    })
  }

  // Remove participant from event
  async removeParticipant(eventId: string, userId: string): Promise<ApiResponse<EventData>> {
    return new Promise((resolve) => {
      this.db.update(
        { _id: eventId },
        {
          $pull: { participants: { userId } },
          $set: { updatedAt: new Date(), lastSync: new Date() }
        },
        { returnUpdatedDocs: true },
        (err, numReplaced, updatedDoc) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
              timestamp: Date.now()
            })
          } else if (numReplaced === 0) {
            resolve({
              success: false,
              error: 'Event not found',
              timestamp: Date.now()
            })
          } else {
            resolve({
              success: true,
              data: updatedDoc as any,
              timestamp: Date.now()
            })
          }
        }
      )
    })
  }

  // Get events by user participation
  async getByUser(userId: string): Promise<ApiResponse<EventData[]>> {
    return new Promise((resolve) => {
      this.db.find({
        'participants.userId': userId
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

  // Get event count
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

  // Get events modified since timestamp (for sync)
  async getModifiedSince(timestamp: number): Promise<ApiResponse<EventData[]>> {
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

  // Update event status
  async updateStatus(id: string, status: EventData['status']): Promise<ApiResponse<EventData>> {
    return this.update(id, { status })
  }

  // Publish event
  async publish(id: string): Promise<ApiResponse<EventData>> {
    return this.updateStatus(id, 'published')
  }

  // Cancel event
  async cancel(id: string): Promise<ApiResponse<EventData>> {
    return this.updateStatus(id, 'cancelled')
  }
}
