// NeDB Database Setup for SheSocial Backend
// Mirrors IndexedDB structure for seamless synchronization

import Datastore from '@seald-io/nedb'
import path from 'path'
import fs from 'fs'
import { UserProfile, EventData, BookingData, SyncQueueItem, StartupRecord, HealthLog } from '../types/database'
import { AdminUser, AdminRole, PermissionAtom, PermissionAuditLog } from '../models/AdminPermission'
import { EventType } from '../models/EventType'
import { MarketingCampaign, MarketingTemplate, MarketingAudience, MarketingAnalytics, MarketingEvent } from '../models/Marketing'

// Legacy interface - will be phased out incrementally
export interface DatabaseCollections {
  users: Datastore<UserProfile>
  events: Datastore<EventData>
  bookings: Datastore<BookingData>
  syncQueue: Datastore<SyncQueueItem>
  // Event management collections
  event_types: Datastore<EventType>
  // New appointment system collections
  appointments_slots: Datastore<any>
  appointment_bookings: Datastore<any>
  interviewers: Datastore<any>
  availability_overrides: Datastore<any>
  appointment_notifications: Datastore<any>
  // Health monitoring collections
  startup_records: Datastore<StartupRecord>
  health_logs: Datastore<HealthLog>
  // Admin system collections
  admin_users: Datastore<AdminUser>
  admin_roles: Datastore<AdminRole>
  permission_atoms: Datastore<PermissionAtom>
  permission_audit_logs: Datastore<PermissionAuditLog>
  // Marketing CTA system collections
  marketing_campaigns: Datastore<MarketingCampaign>
  marketing_templates: Datastore<MarketingTemplate>
  marketing_audiences: Datastore<MarketingAudience>
  marketing_analytics: Datastore<MarketingAnalytics>
  marketing_events: Datastore<MarketingEvent>
}

// New two-database interface
export interface TwoDatabaseCollections {
  admin: Datastore<any>      // All admin-related data
  application: Datastore<any> // All user/business data
}

class NeDBSetup {
  private static instance: NeDBSetup
  private db: DatabaseCollections
  private twoDB: TwoDatabaseCollections | null = null
  private dbPath: string

  private constructor(dbPath?: string) {
    // Use absolute path relative to project root
    this.dbPath = dbPath || path.join(__dirname, '../../data')

    // Ensure data directory exists
    this.ensureDataDirectory()

    this.db = this.initializeDatabases()
    // Initialize two-database structure alongside legacy
    this.initializeTwoDatabases()
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
      // Event management collections
      event_types: new Datastore<EventType>({
        filename: path.join(this.dbPath, 'event-types.db'),
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
      }),
      // Admin system collections
      admin_users: new Datastore<AdminUser>({
        filename: path.join(this.dbPath, 'admin-users.db'),
        autoload: true,
        timestampData: true
      }),
      admin_roles: new Datastore<AdminRole>({
        filename: path.join(this.dbPath, 'admin-roles.db'),
        autoload: true,
        timestampData: true
      }),
      permission_atoms: new Datastore<PermissionAtom>({
        filename: path.join(this.dbPath, 'permission-atoms.db'),
        autoload: true,
        timestampData: true
      }),
      permission_audit_logs: new Datastore<PermissionAuditLog>({
        filename: path.join(this.dbPath, 'permission-audit-logs.db'),
        autoload: true,
        timestampData: true
      }),
      // Marketing CTA system collections
      marketing_campaigns: new Datastore<MarketingCampaign>({
        filename: path.join(this.dbPath, 'marketing-campaigns.db'),
        autoload: true,
        timestampData: true
      }),
      marketing_templates: new Datastore<MarketingTemplate>({
        filename: path.join(this.dbPath, 'marketing-templates.db'),
        autoload: true,
        timestampData: true
      }),
      marketing_audiences: new Datastore<MarketingAudience>({
        filename: path.join(this.dbPath, 'marketing-audiences.db'),
        autoload: true,
        timestampData: true
      }),
      marketing_analytics: new Datastore<MarketingAnalytics>({
        filename: path.join(this.dbPath, 'marketing-analytics.db'),
        autoload: true,
        timestampData: true
      }),
      marketing_events: new Datastore<MarketingEvent>({
        filename: path.join(this.dbPath, 'marketing-events.db'),
        autoload: true,
        timestampData: true
      })
    }

    // Set up indexes for better performance (with error handling)
    this.setupIndexes(databases)

    console.log(`💾 NeDB databases initialized with persistent storage at: ${this.dbPath}`)
    return databases
  }

  private initializeTwoDatabases(): void {
    // Initialize the new two-database structure
    this.twoDB = {
      admin: new Datastore<any>({
        filename: path.join(this.dbPath, 'admin.db'),
        autoload: true,
        timestampData: true
      }),
      application: new Datastore<any>({
        filename: path.join(this.dbPath, 'application.db'), 
        autoload: true,
        timestampData: true
      })
    }

    // Set up indexes for the two-database structure
    this.setupTwoDBIndexes()
    
    console.log(`🔄 Two-database structure initialized alongside legacy collections`)
  }

  private setupTwoDBIndexes(): void {
    if (!this.twoDB) return

    try {
      // Admin database indexes
      this.twoDB.admin.ensureIndex({ fieldName: 'collection' }) // To distinguish data types
      this.twoDB.admin.ensureIndex({ fieldName: 'adminId', unique: true, sparse: true })
      this.twoDB.admin.ensureIndex({ fieldName: 'email', unique: true, sparse: true })
      this.twoDB.admin.ensureIndex({ fieldName: 'type' })
      this.twoDB.admin.ensureIndex({ fieldName: 'level' })

      // Application database indexes  
      this.twoDB.application.ensureIndex({ fieldName: 'collection' }) // To distinguish data types
      this.twoDB.application.ensureIndex({ fieldName: 'userId', sparse: true })
      this.twoDB.application.ensureIndex({ fieldName: 'eventId', sparse: true })
      this.twoDB.application.ensureIndex({ fieldName: 'status', sparse: true })
      this.twoDB.application.ensureIndex({ fieldName: 'createdAt' })

      console.log(`📊 Two-database indexes created successfully`)
    } catch (error) {
      console.error('Error setting up two-database indexes:', error)
    }
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

      // Event types indexes
      databases.event_types.ensureIndex({ fieldName: 'typeId', unique: true })
      databases.event_types.ensureIndex({ fieldName: 'isActive' })
      databases.event_types.ensureIndex({ fieldName: 'sortOrder' })
      databases.event_types.ensureIndex({ fieldName: 'name' })
      databases.event_types.ensureIndex({ fieldName: 'createdAt' })

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

      // Admin system indexes
      databases.admin_users.ensureIndex({ fieldName: 'adminId', unique: true })
      databases.admin_users.ensureIndex({ fieldName: 'username', unique: true })
      databases.admin_users.ensureIndex({ fieldName: 'email', unique: true })
      databases.admin_users.ensureIndex({ fieldName: 'roleId' })
      databases.admin_users.ensureIndex({ fieldName: 'profile.department' })
      databases.admin_users.ensureIndex({ fieldName: 'status' })
      databases.admin_users.ensureIndex({ fieldName: 'createdAt' })

      databases.admin_roles.ensureIndex({ fieldName: 'roleId', unique: true })
      databases.admin_roles.ensureIndex({ fieldName: 'department' })
      databases.admin_roles.ensureIndex({ fieldName: 'isActive' })
      databases.admin_roles.ensureIndex({ fieldName: 'isCustom' })
      databases.admin_roles.ensureIndex({ fieldName: 'createdAt' })

      databases.permission_atoms.ensureIndex({ fieldName: 'atomId', unique: true })
      databases.permission_atoms.ensureIndex({ fieldName: 'group' })
      databases.permission_atoms.ensureIndex({ fieldName: 'action' })
      databases.permission_atoms.ensureIndex({ fieldName: 'riskLevel' })
      databases.permission_atoms.ensureIndex({ fieldName: 'createdAt' })

      databases.permission_audit_logs.ensureIndex({ fieldName: 'adminId' })
      databases.permission_audit_logs.ensureIndex({ fieldName: 'targetType' })
      databases.permission_audit_logs.ensureIndex({ fieldName: 'targetId' })
      databases.permission_audit_logs.ensureIndex({ fieldName: 'action' })
      databases.permission_audit_logs.ensureIndex({ fieldName: 'timestamp' })
      databases.permission_audit_logs.ensureIndex({ fieldName: 'success' })

      // Marketing CTA system indexes
      databases.marketing_campaigns.ensureIndex({ fieldName: 'campaignId', unique: true })
      databases.marketing_campaigns.ensureIndex({ fieldName: 'status' })
      databases.marketing_campaigns.ensureIndex({ fieldName: 'type' })
      databases.marketing_campaigns.ensureIndex({ fieldName: 'createdBy' })
      databases.marketing_campaigns.ensureIndex({ fieldName: 'schedule.startDate' })
      databases.marketing_campaigns.ensureIndex({ fieldName: 'schedule.endDate' })
      databases.marketing_campaigns.ensureIndex({ fieldName: 'targeting.membershipTypes' })
      databases.marketing_campaigns.ensureIndex({ fieldName: 'createdAt' })

      databases.marketing_templates.ensureIndex({ fieldName: 'templateId', unique: true })
      databases.marketing_templates.ensureIndex({ fieldName: 'category' })
      databases.marketing_templates.ensureIndex({ fieldName: 'type' })
      databases.marketing_templates.ensureIndex({ fieldName: 'settings.isActive' })
      databases.marketing_templates.ensureIndex({ fieldName: 'settings.isSystem' })
      databases.marketing_templates.ensureIndex({ fieldName: 'createdBy' })
      databases.marketing_templates.ensureIndex({ fieldName: 'createdAt' })

      databases.marketing_audiences.ensureIndex({ fieldName: 'audienceId', unique: true })
      databases.marketing_audiences.ensureIndex({ fieldName: 'type' })
      databases.marketing_audiences.ensureIndex({ fieldName: 'criteria.membershipTypes' })
      databases.marketing_audiences.ensureIndex({ fieldName: 'createdBy' })
      databases.marketing_audiences.ensureIndex({ fieldName: 'stats.totalMembers' })
      databases.marketing_audiences.ensureIndex({ fieldName: 'createdAt' })

      databases.marketing_analytics.ensureIndex({ fieldName: 'analyticsId', unique: true })
      databases.marketing_analytics.ensureIndex({ fieldName: 'campaignId' })
      databases.marketing_analytics.ensureIndex({ fieldName: 'dateRange.from' })
      databases.marketing_analytics.ensureIndex({ fieldName: 'dateRange.to' })
      databases.marketing_analytics.ensureIndex({ fieldName: 'metrics.conversionRate' })
      databases.marketing_analytics.ensureIndex({ fieldName: 'generatedAt' })

      databases.marketing_events.ensureIndex({ fieldName: 'eventId', unique: true })
      databases.marketing_events.ensureIndex({ fieldName: 'campaignId' })
      databases.marketing_events.ensureIndex({ fieldName: 'userId' })
      databases.marketing_events.ensureIndex({ fieldName: 'sessionId' })
      databases.marketing_events.ensureIndex({ fieldName: 'eventType' })
      databases.marketing_events.ensureIndex({ fieldName: 'timestamp' })
      databases.marketing_events.ensureIndex({ fieldName: 'userContext.membershipType' })
      databases.marketing_events.ensureIndex({ fieldName: 'eventData.conversionType' })

      console.log('📊 Database indexes created successfully (including appointment system + health monitoring + admin system + marketing CTA system)')
    } catch (error) {
      console.warn('⚠️ Warning: Some database indexes could not be created:', error)
    }
  }

  public getDatabases(): DatabaseCollections {
    return this.db
  }

  public getTwoDatabases(): TwoDatabaseCollections {
    if (!this.twoDB) {
      throw new Error('Two-database structure not initialized')
    }
    return this.twoDB
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
        type: 'registered',
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
        vvip: true,
        vip: false,
        registered: false
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
