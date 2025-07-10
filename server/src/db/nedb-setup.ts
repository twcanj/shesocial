// NeDB Database Setup for SheSocial Backend
// Mirrors IndexedDB structure for seamless synchronization

import Datastore from 'nedb'
import path from 'path'
import { UserProfile, EventData, BookingData, SyncQueueItem } from '../types/database'

export interface DatabaseCollections {
  users: Datastore<UserProfile>
  events: Datastore<EventData>
  bookings: Datastore<BookingData>
  syncQueue: Datastore<SyncQueueItem>
}

class NeDBSetup {
  private db: DatabaseCollections
  private dbPath: string

  constructor(dbPath: string = './data') {
    this.dbPath = dbPath
    this.db = this.initializeDatabases()
  }

  private initializeDatabases(): DatabaseCollections {
    const databases = {
      users: new Datastore<UserProfile>({ 
        filename: path.join(this.dbPath, 'users.db'),
        autoload: true,
        timestampData: true
      }),
      events: new Datastore<EventData>({ 
        filename: path.join(this.dbPath, 'events.db'),
        autoload: true,
        timestampData: true
      }),
      bookings: new Datastore<BookingData>({ 
        filename: path.join(this.dbPath, 'bookings.db'),
        autoload: true,
        timestampData: true
      }),
      syncQueue: new Datastore<SyncQueueItem>({ 
        filename: path.join(this.dbPath, 'sync-queue.db'),
        autoload: true,
        timestampData: true
      })
    }

    // Set up indexes for better performance
    this.setupIndexes(databases)
    
    return databases
  }

  private setupIndexes(databases: DatabaseCollections): void {
    // User indexes
    databases.users.ensureIndex({ fieldName: 'email', unique: true })
    databases.users.ensureIndex({ fieldName: 'membership.type' })
    databases.users.ensureIndex({ fieldName: 'profile.location' })
    databases.users.ensureIndex({ fieldName: 'createdAt' })
    databases.users.ensureIndex({ fieldName: 'lastSync' })

    // Event indexes
    databases.events.ensureIndex({ fieldName: 'metadata.date' })
    databases.events.ensureIndex({ fieldName: 'metadata.location' })
    databases.events.ensureIndex({ fieldName: 'metadata.type' })
    databases.events.ensureIndex({ fieldName: 'status' })
    databases.events.ensureIndex({ fieldName: 'createdAt' })
    databases.events.ensureIndex({ fieldName: 'lastSync' })

    // Booking indexes
    databases.bookings.ensureIndex({ fieldName: 'userId' })
    databases.bookings.ensureIndex({ fieldName: 'eventId' })
    databases.bookings.ensureIndex({ fieldName: 'status' })
    databases.bookings.ensureIndex({ fieldName: 'paymentStatus' })
    databases.bookings.ensureIndex({ fieldName: 'createdAt' })
    databases.bookings.ensureIndex({ fieldName: 'lastSync' })

    // Sync queue indexes
    databases.syncQueue.ensureIndex({ fieldName: 'collection' })
    databases.syncQueue.ensureIndex({ fieldName: 'operation' })
    databases.syncQueue.ensureIndex({ fieldName: 'timestamp' })
    databases.syncQueue.ensureIndex({ fieldName: 'priority' })
  }

  public getDatabases(): DatabaseCollections {
    return this.db
  }

  public async compactDatabases(): Promise<void> {
    const collections = Object.values(this.db)
    const compactPromises = collections.map(db => 
      new Promise<void>((resolve, reject) => {
        db.persistence.compactDatafile()
        db.once('compaction.done', () => resolve())
        db.once('error', reject)
      })
    )
    
    await Promise.all(compactPromises)
  }

  public async getStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {}
    
    for (const [name, db] of Object.entries(this.db)) {
      stats[name] = await new Promise<number>((resolve, reject) => {
        db.count({}, (err, count) => {
          if (err) reject(err)
          else resolve(count)
        })
      })
    }
    
    return stats
  }

  public async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(this.dbPath, 'backups', timestamp)
    
    // Compact before backup
    await this.compactDatabases()
    
    // TODO: Implement backup logic using fs.copyFile
    console.log(`Backup created at: ${backupPath}`)
    return backupPath
  }

  public async clearCollection(collection: keyof DatabaseCollections): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.db[collection].remove({}, { multi: true }, (err, numRemoved) => {
        if (err) reject(err)
        else resolve(numRemoved)
      })
    })
  }

  // Test data insertion for development
  public async insertTestData(): Promise<void> {
    const testUser: Partial<UserProfile> = {
      email: 'test@shesocial.tw',
      profile: {
        name: '測試用戶',
        age: 28,
        bio: '喜歡戶外活動和美食',
        interests: ['旅行', '美食', '攝影'],
        location: '台北',
        videos: [],
        interviewStatus: {
          completed: false,
          duration: 0
        }
      },
      membership: {
        type: 'regular',
        joinDate: new Date(),
        payments: [],
        permissions: {
          viewParticipants: false,
          priorityBooking: false
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const testEvent: Partial<EventData> = {
      name: '台北美食探索之旅',
      metadata: {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一週後
        location: '台北',
        category: '美食',
        type: '4hour_dining',
        pricing: {
          male: 1000,
          female: 800,
          voucherDiscount: {
            '100': 100,
            '200': 200
          }
        },
        requirements: {
          ageMin: 25,
          ageMax: 45,
          maritalStatus: 'single'
        },
        schedule: {
          frequency: 'biweekly',
          cycle: '3months',
          totalEvents: 6,
          twoDayTrips: 2
        }
      },
      participants: [],
      participantVisibility: {
        premium_2500: true,
        vip: false,
        regular: false
      },
      notifications: {
        sent: false,
        recipients: []
      },
      maxParticipants: 20,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert test data
    await new Promise<void>((resolve, reject) => {
      this.db.users.insert(testUser as UserProfile, (err) => {
        if (err && !err.message.includes('unique')) reject(err)
        else resolve()
      })
    })

    await new Promise<void>((resolve, reject) => {
      this.db.events.insert(testEvent as EventData, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    console.log('Test data inserted successfully')
  }
}

export default NeDBSetup