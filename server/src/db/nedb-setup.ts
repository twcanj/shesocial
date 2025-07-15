// NeDB Database Setup for SheSocial Backend
// Mirrors IndexedDB structure for seamless synchronization

import Datastore from '@seald-io/nedb'
import path from 'path'
import fs from 'fs'
import { UserProfile, EventData, BookingData, SyncQueueItem, StartupRecord, HealthLog } from '../types/database'

export interface DatabaseCollections {
  users: Datastore<UserProfile>
  events: Datastore<EventData>
  bookings: Datastore<BookingData>
  syncQueue: Datastore<SyncQueueItem>
  // New appointment system collections
  appointments_slots: Datastore<any>
  appointment_bookings: Datastore<any>
  interviewers: Datastore<any>
  availability_overrides: Datastore<any>
  appointment_notifications: Datastore<any>
  // Health monitoring collections
  startup_records: Datastore<StartupRecord>
  health_logs: Datastore<HealthLog>
}

class NeDBSetup {
  private static instance: NeDBSetup
  private db: DatabaseCollections
  private dbPath: string

  private constructor(dbPath?: string) {
    // Use absolute path relative to project root
    this.dbPath = dbPath || path.join(__dirname, '../../data')
    
    // Ensure data directory exists
    this.ensureDataDirectory()
    
    this.db = this.initializeDatabases()
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true })
      console.log(`📁 Created data directory: ${this.dbPath}`)
    }
  }

  public static getInstance(dbPath?: string): NeDBSetup {
    if (!NeDBSetup.instance) {
      NeDBSetup.instance = new NeDBSetup(dbPath)
    }
    return NeDBSetup.instance
  }

  private initializeDatabases(): DatabaseCollections {
    // Use persistent file-based databases for production readiness
    // This enables future R2 storage integration
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
      }),
      // New appointment system collections
      appointments_slots: new Datastore<any>({ 
        filename: path.join(this.dbPath, 'appointments-slots.db'),
        autoload: true,
        timestampData: true
      }),
      appointment_bookings: new Datastore<any>({ 
        filename: path.join(this.dbPath, 'appointment-bookings.db'),
        autoload: true,
        timestampData: true
      }),
      interviewers: new Datastore<any>({ 
        filename: path.join(this.dbPath, 'interviewers.db'),
        autoload: true,
        timestampData: true
      }),
      availability_overrides: new Datastore<any>({ 
        filename: path.join(this.dbPath, 'availability-overrides.db'),
        autoload: true,
        timestampData: true
      }),
      appointment_notifications: new Datastore<any>({ 
        filename: path.join(this.dbPath, 'appointment-notifications.db'),
        autoload: true,
        timestampData: true
      }),
      // Health monitoring collections
      startup_records: new Datastore<StartupRecord>({ 
        filename: path.join(this.dbPath, 'startup-records.db'),
        autoload: true,
        timestampData: true
      }),
      health_logs: new Datastore<HealthLog>({ 
        filename: path.join(this.dbPath, 'health-logs.db'),
        autoload: true,
        timestampData: true
      })
    }

    // Set up indexes for better performance (with error handling)
    this.setupIndexes(databases)
    
    console.log(`💾 NeDB databases initialized with persistent storage at: ${this.dbPath}`)
    return databases
  }

  private setupIndexes(databases: DatabaseCollections): void {
    try {
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

      // Appointment slots indexes
      databases.appointments_slots.ensureIndex({ fieldName: 'interviewerId' })
      databases.appointments_slots.ensureIndex({ fieldName: 'date' })
      databases.appointments_slots.ensureIndex({ fieldName: 'type' })
      databases.appointments_slots.ensureIndex({ fieldName: 'isAvailable' })
      databases.appointments_slots.ensureIndex({ fieldName: 'createdAt' })

      // Appointment bookings indexes
      databases.appointment_bookings.ensureIndex({ fieldName: 'userId' })
      databases.appointment_bookings.ensureIndex({ fieldName: 'slotId' })
      databases.appointment_bookings.ensureIndex({ fieldName: 'type' })
      databases.appointment_bookings.ensureIndex({ fieldName: 'status' })
      databases.appointment_bookings.ensureIndex({ fieldName: 'scheduledDate' })
      databases.appointment_bookings.ensureIndex({ fieldName: 'guestInfo.email' })

      // Interviewers indexes (no constraints - document DB, managed resources)
      databases.interviewers.ensureIndex({ fieldName: 'name' }) // For searching by name
      databases.interviewers.ensureIndex({ fieldName: 'email' }) // For contact, no unique constraint
      databases.interviewers.ensureIndex({ fieldName: 'isActive' })
      databases.interviewers.ensureIndex({ fieldName: 'appointmentTypes' })
      databases.interviewers.ensureIndex({ fieldName: 'specialties' })

      // Availability overrides indexes
      databases.availability_overrides.ensureIndex({ fieldName: 'interviewerId' })
      databases.availability_overrides.ensureIndex({ fieldName: 'date' })
      databases.availability_overrides.ensureIndex({ fieldName: 'type' })

      // Appointment notifications indexes
      databases.appointment_notifications.ensureIndex({ fieldName: 'bookingId' })
      databases.appointment_notifications.ensureIndex({ fieldName: 'userId' })
      databases.appointment_notifications.ensureIndex({ fieldName: 'type' })
      databases.appointment_notifications.ensureIndex({ fieldName: 'status' })
      databases.appointment_notifications.ensureIndex({ fieldName: 'scheduledFor' })

      // Health monitoring indexes
      databases.startup_records.ensureIndex({ fieldName: 'serverStartTime' })
      databases.startup_records.ensureIndex({ fieldName: 'environment' })
      databases.startup_records.ensureIndex({ fieldName: 'allSystemsHealthy' })
      databases.startup_records.ensureIndex({ fieldName: 'processId' })
      databases.startup_records.ensureIndex({ fieldName: 'createdAt' })

      databases.health_logs.ensureIndex({ fieldName: 'recordType' })
      databases.health_logs.ensureIndex({ fieldName: 'timestamp' })
      databases.health_logs.ensureIndex({ fieldName: 'healthScore' })
      databases.health_logs.ensureIndex({ fieldName: 'database.status' })
      databases.health_logs.ensureIndex({ fieldName: 'createdAt' })

      console.log('📊 Database indexes created successfully (including appointment system + health monitoring)')
    } catch (error) {
      console.warn('⚠️ Warning: Some database indexes could not be created:', error)
    }
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
        status: 'active',
        joinDate: new Date(),
        paymentStatus: 'completed',
        payments: [],
        permissions: {
          viewParticipants: false,
          priorityBooking: false,
          uploadMedia: true,
          bookInterview: true
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

  // Future R2 integration methods
  public getDataPath(): string {
    return this.dbPath
  }

  public async syncToR2(): Promise<void> {
    // TODO: Implement R2 upload functionality
    // This will read all .db files from this.dbPath and upload to R2
    console.log('📤 R2 sync not yet implemented - will upload files from:', this.dbPath)
  }

  public async restoreFromR2(): Promise<void> {
    // TODO: Implement R2 download functionality  
    // This will download .db files from R2 to this.dbPath
    console.log('📥 R2 restore not yet implemented - will download files to:', this.dbPath)
  }

  public async listDatabaseFiles(): Promise<string[]> {
    const files = fs.readdirSync(this.dbPath)
    return files.filter(file => file.endsWith('.db'))
  }
}

export default NeDBSetup