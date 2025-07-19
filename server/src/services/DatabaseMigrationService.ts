// Database Migration Service for Rolling Deployment
// Handles safe migration from 21-file structure to 2-database structure

import NeDBSetup, { DatabaseCollections, TwoDatabaseCollections } from '../db/nedb-setup'
import fs from 'fs'
import path from 'path'

export interface MigrationPlan {
  adminCollections: string[]
  applicationCollections: string[]
  estimatedRecords: number
  estimatedTimeMinutes: number
}

export interface MigrationProgress {
  step: string
  completed: number
  total: number
  percentage: number
  status: 'running' | 'completed' | 'error' | 'paused'
  errors: string[]
  startTime: Date
  estimatedEndTime?: Date
}

export interface MigrationResult {
  success: boolean
  recordsMigrated: number
  timeTaken: number
  errors: string[]
  rollbackAvailable: boolean
}

export class DatabaseMigrationService {
  private dbSetup: NeDBSetup
  private legacyDb: DatabaseCollections
  private newDb: TwoDatabaseCollections
  private rollbackPath: string
  private migrationLog: any[] = []

  constructor() {
    this.dbSetup = NeDBSetup.getInstance()
    this.legacyDb = this.dbSetup.getDatabases()
    this.newDb = this.dbSetup.getTwoDatabases()
    this.rollbackPath = path.join(__dirname, '../../data/rollback')
  }

  // Step 1: Analyze current data and create migration plan
  async analyzeMigrationPlan(): Promise<MigrationPlan> {
    console.log('🔍 Analyzing current database structure for migration...')

    // Admin-related collections
    const adminCollections = [
      'admin_users',
      'admin_roles', 
      'permission_atoms',
      'permission_audit_logs'
    ]

    // Application/business collections
    const applicationCollections = [
      'users',
      'events',
      'bookings',
      'event_types',
      'appointments_slots',
      'appointment_bookings', 
      'interviewers',
      'availability_overrides',
      'appointment_notifications',
      'startup_records',
      'health_logs',
      'syncQueue',
      'marketing_campaigns',
      'marketing_templates',
      'marketing_audiences', 
      'marketing_analytics',
      'marketing_events'
    ]

    let totalRecords = 0

    // Count records in each collection
    for (const collectionName of [...adminCollections, ...applicationCollections]) {
      try {
        const collection = (this.legacyDb as any)[collectionName]
        if (collection) {
          const count = await this.countRecords(collection)
          totalRecords += count
          console.log(`📊 ${collectionName}: ${count} records`)
        }
      } catch (error) {
        console.warn(`⚠️  Could not count records in ${collectionName}:`, error)
      }
    }

    // Estimate migration time (assuming 1000 records per minute)
    const estimatedTimeMinutes = Math.max(1, Math.ceil(totalRecords / 1000))

    const plan: MigrationPlan = {
      adminCollections,
      applicationCollections,
      estimatedRecords: totalRecords,
      estimatedTimeMinutes
    }

    console.log('📋 Migration Plan Created:', plan)
    return plan
  }

  // Step 2: Create rollback snapshots before migration
  async createRollbackSnapshot(): Promise<boolean> {
    try {
      console.log('📸 Creating rollback snapshot...')

      // Ensure rollback directory exists
      if (!fs.existsSync(this.rollbackPath)) {
        fs.mkdirSync(this.rollbackPath, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const snapshotPath = path.join(this.rollbackPath, `snapshot-${timestamp}`)
      fs.mkdirSync(snapshotPath, { recursive: true })

      // Copy current database files
      const dataPath = path.join(__dirname, '../../data')
      const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.db'))

      for (const file of files) {
        const source = path.join(dataPath, file)
        const dest = path.join(snapshotPath, file)
        fs.copyFileSync(source, dest)
        console.log(`📁 Backed up: ${file}`)
      }

      // Create snapshot metadata
      const metadata = {
        timestamp: new Date(),
        fileCount: files.length,
        totalSize: files.reduce((size, file) => {
          const filePath = path.join(dataPath, file)
          return size + fs.statSync(filePath).size
        }, 0),
        rollbackPath: snapshotPath
      }

      fs.writeFileSync(
        path.join(snapshotPath, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      )

      console.log('✅ Rollback snapshot created successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to create rollback snapshot:', error)
      return false
    }
  }

  // Step 3: Migrate admin collections to admin.db
  async migrateAdminData(progress?: (progress: MigrationProgress) => void): Promise<MigrationResult> {
    const startTime = new Date()
    let recordsMigrated = 0
    const errors: string[] = []

    try {
      console.log('🔄 Starting admin data migration...')

      const adminCollections = [
        'admin_users',
        'admin_roles',
        'permission_atoms', 
        'permission_audit_logs'
      ]

      for (let i = 0; i < adminCollections.length; i++) {
        const collectionName = adminCollections[i]
        
        try {
          const sourceCollection = (this.legacyDb as any)[collectionName]
          if (!sourceCollection) {
            console.warn(`⚠️  Collection ${collectionName} not found, skipping`)
            continue
          }

          const records = await this.getAllRecords(sourceCollection)
          console.log(`📦 Migrating ${records.length} records from ${collectionName}`)

          // Insert records into admin.db with collection metadata
          for (const record of records) {
            const migratedRecord = {
              ...record,
              _collection: collectionName, // Tag for identification
              _migrated: new Date()
            }

            await this.insertRecord(this.newDb.admin, migratedRecord)
            recordsMigrated++
          }

          // Report progress
          if (progress) {
            progress({
              step: `Migrating ${collectionName}`,
              completed: i + 1,
              total: adminCollections.length,
              percentage: Math.round(((i + 1) / adminCollections.length) * 100),
              status: 'running',
              errors,
              startTime
            })
          }

          console.log(`✅ Completed migration of ${collectionName}`)
        } catch (error) {
          const errorMsg = `Failed to migrate ${collectionName}: ${error}`
          errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      }

      const timeTaken = Date.now() - startTime.getTime()
      
      return {
        success: errors.length === 0,
        recordsMigrated,
        timeTaken,
        errors,
        rollbackAvailable: true
      }
    } catch (error) {
      return {
        success: false,
        recordsMigrated,
        timeTaken: Date.now() - startTime.getTime(),
        errors: [...errors, `Migration failed: ${error}`],
        rollbackAvailable: true
      }
    }
  }

  // Step 4: Migrate application collections to application.db
  async migrateApplicationData(progress?: (progress: MigrationProgress) => void): Promise<MigrationResult> {
    const startTime = new Date()
    let recordsMigrated = 0
    const errors: string[] = []

    try {
      console.log('🔄 Starting application data migration...')

      const applicationCollections = [
        'users', 'events', 'bookings', 'event_types',
        'appointments_slots', 'appointment_bookings', 'interviewers',
        'availability_overrides', 'appointment_notifications',
        'startup_records', 'health_logs', 'syncQueue',
        'marketing_campaigns', 'marketing_templates', 'marketing_audiences',
        'marketing_analytics', 'marketing_events'
      ]

      for (let i = 0; i < applicationCollections.length; i++) {
        const collectionName = applicationCollections[i]
        
        try {
          const sourceCollection = (this.legacyDb as any)[collectionName]
          if (!sourceCollection) {
            console.warn(`⚠️  Collection ${collectionName} not found, skipping`)
            continue
          }

          const records = await this.getAllRecords(sourceCollection)
          console.log(`📦 Migrating ${records.length} records from ${collectionName}`)

          // Insert records into application.db with collection metadata
          for (const record of records) {
            const migratedRecord = {
              ...record,
              _collection: collectionName, // Tag for identification
              _migrated: new Date()
            }

            await this.insertRecord(this.newDb.application, migratedRecord)
            recordsMigrated++
          }

          // Report progress
          if (progress) {
            progress({
              step: `Migrating ${collectionName}`,
              completed: i + 1,
              total: applicationCollections.length,
              percentage: Math.round(((i + 1) / applicationCollections.length) * 100),
              status: 'running',
              errors,
              startTime
            })
          }

          console.log(`✅ Completed migration of ${collectionName}`)
        } catch (error) {
          const errorMsg = `Failed to migrate ${collectionName}: ${error}`
          errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      }

      const timeTaken = Date.now() - startTime.getTime()
      
      return {
        success: errors.length === 0,
        recordsMigrated,
        timeTaken,
        errors,
        rollbackAvailable: true
      }
    } catch (error) {
      return {
        success: false,
        recordsMigrated,
        timeTaken: Date.now() - startTime.getTime(),
        errors: [...errors, `Migration failed: ${error}`],
        rollbackAvailable: true
      }
    }
  }

  // Step 5: Validate migrated data integrity
  async validateMigration(): Promise<{ valid: boolean; issues: string[] }> {
    console.log('🔍 Validating migrated data...')
    const issues: string[] = []

    try {
      // Check admin.db structure
      const adminRecords = await this.getAllRecords(this.newDb.admin)
      const adminCollections = [...new Set(adminRecords.map(r => r._collection))]
      console.log(`📊 Admin collections found: ${adminCollections.join(', ')}`)

      // Check application.db structure  
      const appRecords = await this.getAllRecords(this.newDb.application)
      const appCollections = [...new Set(appRecords.map(r => r._collection))]
      console.log(`📊 Application collections found: ${appCollections.join(', ')}`)

      // Validate critical admin data exists
      const adminUsers = adminRecords.filter(r => r._collection === 'admin_users')
      if (adminUsers.length === 0) {
        issues.push('No admin users found in migrated data')
      }

      // Validate critical application data
      const users = appRecords.filter(r => r._collection === 'users')
      const events = appRecords.filter(r => r._collection === 'events')
      console.log(`📊 Users: ${users.length}, Events: ${events.length}`)

      // Check for duplicate records
      const adminIds = adminRecords.map(r => r._id)
      if (adminIds.length !== new Set(adminIds).size) {
        issues.push('Duplicate records found in admin database')
      }

      const appIds = appRecords.map(r => r._id)
      if (appIds.length !== new Set(appIds).size) {
        issues.push('Duplicate records found in application database')
      }

      console.log(issues.length === 0 ? '✅ Migration validation passed' : `⚠️  ${issues.length} issues found`)
      return { valid: issues.length === 0, issues }
    } catch (error) {
      const issue = `Validation failed: ${error}`
      issues.push(issue)
      console.error(`❌ ${issue}`)
      return { valid: false, issues }
    }
  }

  // Step 6: Rollback to previous state if needed
  async rollback(snapshotPath?: string): Promise<boolean> {
    try {
      console.log('🔄 Starting rollback operation...')

      let rollbackDir = snapshotPath
      if (!rollbackDir) {
        // Find most recent snapshot
        const snapshots = fs.readdirSync(this.rollbackPath)
          .filter(dir => dir.startsWith('snapshot-'))
          .sort()
          .reverse()
        
        if (snapshots.length === 0) {
          console.error('❌ No rollback snapshots available')
          return false
        }

        rollbackDir = path.join(this.rollbackPath, snapshots[0])
      }

      // Restore database files
      const dataPath = path.join(__dirname, '../../data')
      const backupFiles = fs.readdirSync(rollbackDir).filter(f => f.endsWith('.db'))

      for (const file of backupFiles) {
        const source = path.join(rollbackDir, file)
        const dest = path.join(dataPath, file)
        fs.copyFileSync(source, dest)
        console.log(`📁 Restored: ${file}`)
      }

      console.log('✅ Rollback completed successfully')
      return true
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      return false
    }
  }

  // Helper methods
  private async countRecords(collection: any): Promise<number> {
    return new Promise((resolve, reject) => {
      collection.count({}, (err: any, count: number) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
  }

  private async getAllRecords(collection: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      collection.find({}, (err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  private async insertRecord(collection: any, record: any): Promise<any> {
    return new Promise((resolve, reject) => {
      collection.insert(record, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  // Get migration status and logs
  getMigrationLogs(): any[] {
    return this.migrationLog
  }

  // Complete migration orchestration
  async executeFullMigration(
    progressCallback?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    console.log('🚀 Starting full database migration...')

    try {
      // Step 1: Create rollback snapshot
      const snapshotCreated = await this.createRollbackSnapshot()
      if (!snapshotCreated) {
        return {
          success: false,
          recordsMigrated: 0,
          timeTaken: 0,
          errors: ['Failed to create rollback snapshot'],
          rollbackAvailable: false
        }
      }

      // Step 2: Migrate admin data
      const adminResult = await this.migrateAdminData(progressCallback)
      if (!adminResult.success) {
        console.error('❌ Admin migration failed, aborting')
        return adminResult
      }

      // Step 3: Migrate application data  
      const appResult = await this.migrateApplicationData(progressCallback)
      if (!appResult.success) {
        console.error('❌ Application migration failed, considering rollback')
        return appResult
      }

      // Step 4: Validate migration
      const validation = await this.validateMigration()
      if (!validation.valid) {
        return {
          success: false,
          recordsMigrated: adminResult.recordsMigrated + appResult.recordsMigrated,
          timeTaken: adminResult.timeTaken + appResult.timeTaken,
          errors: validation.issues,
          rollbackAvailable: true
        }
      }

      console.log('🎉 Migration completed successfully!')
      return {
        success: true,
        recordsMigrated: adminResult.recordsMigrated + appResult.recordsMigrated,
        timeTaken: adminResult.timeTaken + appResult.timeTaken,
        errors: [],
        rollbackAvailable: true
      }
    } catch (error) {
      console.error('❌ Migration failed:', error)
      return {
        success: false,
        recordsMigrated: 0,
        timeTaken: 0,
        errors: [`Migration failed: ${error}`],
        rollbackAvailable: true
      }
    }
  }
}

export default DatabaseMigrationService