// User Model - Business Logic for User Operations
import Datastore from '@seald-io/nedb'
import { UserProfile, ApiResponse, UserSearchFilters } from '../types/database'

export class UserModel {
  private db: Datastore<UserProfile>

  constructor(database: Datastore<UserProfile>) {
    this.db = database
  }

  // Create new user
  async create(userData: Omit<UserProfile, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<UserProfile>> {
    try {
      const now = new Date().toISOString()
      const newUser: UserProfile = {
        ...userData,
        createdAt: now,
        updatedAt: now,
        lastSync: now
      }

      return new Promise((resolve) => {
        this.db.insert(newUser, (err, doc) => {
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

  // Find user by ID
  async findById(id: string): Promise<ApiResponse<UserProfile>> {
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
            error: 'User not found',
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

  // Find user by email
  async findByEmail(email: string): Promise<ApiResponse<UserProfile>> {
    return new Promise((resolve) => {
      this.db.findOne({ email }, (err, doc) => {
        if (err) {
          resolve({
            success: false,
            error: err.message,
            timestamp: Date.now()
          })
        } else if (!doc) {
          resolve({
            success: false,
            error: 'User not found',
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

  // Update user
  async update(id: string, updateData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
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
                error: 'User not found',
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

  // Delete user
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
            error: 'User not found',
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

  // Find all users with pagination
  async findAll(page: number = 1, limit: number = 10): Promise<ApiResponse<UserProfile[]>> {
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

  // Search users with filters
  async search(filters: UserSearchFilters, page: number = 1, limit: number = 10): Promise<ApiResponse<UserProfile[]>> {
    const query: any = {}

    if (filters.location) {
      query['profile.location'] = new RegExp(filters.location, 'i')
    }

    if (filters.ageRange) {
      query['profile.age'] = {
        $gte: filters.ageRange.min,
        $lte: filters.ageRange.max
      }
    }

    if (filters.interests && filters.interests.length > 0) {
      query['profile.interests'] = { $in: filters.interests }
    }

    if (filters.membershipType) {
      query['membership.type'] = filters.membershipType
    }

    const skip = (page - 1) * limit

    return new Promise((resolve) => {
      this.db.find(query)
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

  // Get user count
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

  // Update membership
  async updateMembership(id: string, membershipData: Partial<UserProfile['membership']>): Promise<ApiResponse<UserProfile>> {
    const updateData = {
      'membership.type': membershipData.type,
      'membership.payments': membershipData.payments,
      'membership.vouchers': membershipData.vouchers,
      'membership.permissions': membershipData.permissions,
      updatedAt: new Date(),
      lastSync: new Date()
    }

    return new Promise((resolve) => {
      this.db.update(
        { _id: id },
        { $set: updateData },
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
              error: 'User not found',
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
  }

  // Get users modified since timestamp (for sync)
  async getModifiedSince(timestamp: number): Promise<ApiResponse<UserProfile[]>> {
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
}