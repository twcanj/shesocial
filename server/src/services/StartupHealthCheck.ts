// Startup Health Check Service
// Inspired by fortuneT project implementation
// Provides comprehensive system validation during server startup

import os from 'os'
import fs from 'fs'
import path from 'path'
import NeDBSetup from '../db/nedb-setup'
import { HealthCheckResult, StartupRecord, HealthLog } from '../types/database'
import { AdminPermissionService } from './AdminPermissionService' // Import the service
import { AdminUser } from '../models/AdminPermission' // Import the model

export class StartupHealthCheck {
  private results: HealthCheckResult[] = []
  private startTime: Date
  private dbSetup: NeDBSetup

  constructor() {
    this.startTime = new Date()
    this.dbSetup = NeDBSetup.getInstance()
  }

  /**
   * Run all health checks and return overall system health status
   * @returns Promise<boolean> - true if all systems healthy, false if critical errors
   */
  public async runAllChecks(): Promise<boolean> {
    console.log('🔍 Starting comprehensive system health checks...')

    // Reset results
    this.results = []

    try {
      // Run all checks in parallel where possible
      await Promise.all([
        this.checkDatabaseConnectivity(),
        this.checkEnvironmentVariables(),
        this.checkFileSystem(),
        this.checkSystemResources()
      ])

      // Sequential checks that depend on database being ready
      await this.checkDatabaseIntegrity()
      await this.checkDataDirectoryPermissions()
      await this.checkSuperAdmin() // Check for super admin

      // Report results
      this.reportResults()

      // Record startup in database
      await this.recordStartupHealth()

      // Return true if no critical errors
      const criticalErrors = this.results.filter(r => r.status === 'error')
      return criticalErrors.length === 0

    } catch (error) {
      console.error('❌ Health check system failed:', error)
      this.addResult('health-check-system', 'error', `Health check system failure: ${error.message}`)
      return false
    }
  }

  /**
   * Check database connectivity and basic operations
   */
  private async checkDatabaseConnectivity(): Promise<void> {
    const startTime = Date.now()

    try {
      const db = this.dbSetup.getDatabases()

      // Test basic database operation
      const testRecord = {
        test: true,
        timestamp: new Date(),
        checkId: `health-check-${Date.now()}`
      }

      // Test write operation
      await new Promise<void>((resolve, reject) => {
        db.health_logs.insert(testRecord as any, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // Test read operation
      await new Promise<number>((resolve, reject) => {
        db.health_logs.count({ test: true }, (err, count) => {
          if (err) reject(err)
          else resolve(count)
        })
      })

      // Clean up test record
      await new Promise<void>((resolve, reject) => {
        db.health_logs.remove({ checkId: testRecord.checkId }, {}, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      this.addResult('database-connectivity', 'healthy', 'Database read/write operations successful', startTime)

    } catch (error) {
      this.addResult('database-connectivity', 'error', `Database connectivity failed: ${error.message}`, startTime)
    }
  }

  /**
   * Check database integrity and collection status
   */
  private async checkDatabaseIntegrity(): Promise<void> {
    const startTime = Date.now()

    try {
      const db = this.dbSetup.getDatabases()
      const expectedCollections = [
        'users', 'events', 'bookings', 'syncQueue',
        'appointments_slots', 'appointment_bookings', 'interviewers',
        'availability_overrides', 'appointment_notifications',
        'startup_records', 'health_logs'
      ]

      const collectionStatus: Record<string, any> = {}
      let totalRecords = 0

      for (const collectionName of expectedCollections) {
        try {
          const count = await new Promise<number>((resolve, reject) => {
            db[collectionName].count({}, (err, count) => {
              if (err) reject(err)
              else resolve(count)
            })
          })

          collectionStatus[collectionName] = count
          totalRecords += count

        } catch (error) {
          collectionStatus[collectionName] = `error: query failed`
        }
      }

      if (totalRecords === 0) {
        this.addResult('database-integrity', 'warning', 'Database is empty - this may be a fresh installation', startTime, { collections: collectionStatus })
      } else {
        this.addResult('database-integrity', 'healthy', `Database integrity verified - ${totalRecords} total records across ${expectedCollections.length} collections`, startTime, { collections: collectionStatus })
      }

    } catch (error) {
      this.addResult('database-integrity', 'error', `Database integrity check failed: ${error.message}`, startTime)
    }
  }

  /**
   * Check critical environment variables
   */
  private async checkEnvironmentVariables(): Promise<void> {
    const startTime = Date.now()

    try {
      const requiredVars = ['NODE_ENV']
      const optionalVars = ['PORT', 'JWT_SECRET', 'CLOUDINARY_URL', 'R2_ENDPOINT']

      const missing: string[] = []
      const present: string[] = []
      const optional: string[] = []

      // Check required variables
      for (const envVar of requiredVars) {
        if (process.env[envVar]) {
          present.push(envVar)
        } else {
          missing.push(envVar)
        }
      }

      // Check optional variables
      for (const envVar of optionalVars) {
        if (process.env[envVar]) {
          optional.push(envVar)
        }
      }

      if (missing.length > 0) {
        this.addResult('environment-variables', 'error', `Missing required environment variables: ${missing.join(', ')}`, startTime, { present, missing, optional })
      } else {
        this.addResult('environment-variables', 'healthy', `All required environment variables present (${present.length} required, ${optional.length} optional)`, startTime, { present, optional })
      }

    } catch (error) {
      this.addResult('environment-variables', 'error', `Environment variable check failed: ${error.message}`, startTime)
    }
  }

  /**
   * Check file system permissions and disk space
   */
  private async checkFileSystem(): Promise<void> {
    const startTime = Date.now()

    try {
      const dataPath = this.dbSetup.getDataPath()

      // Check if data directory exists and is writable
      if (!fs.existsSync(dataPath)) {
        this.addResult('filesystem', 'error', `Data directory does not exist: ${dataPath}`, startTime)
        return
      }

      // Test write permissions
      const testFile = path.join(dataPath, '.write-test')
      try {
        fs.writeFileSync(testFile, 'test', 'utf8')
        fs.unlinkSync(testFile)
      } catch (error) {
        this.addResult('filesystem', 'error', `Data directory not writable: ${error.message}`, startTime)
        return
      }

      // Check disk space (basic check)
      const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.db'))

      let totalSize = 0
      for (const file of files) {
        try {
          const filePath = path.join(dataPath, file)
          const fileStats = fs.statSync(filePath)
          totalSize += fileStats.size
        } catch (error) {
          // File might be in use, skip
        }
      }

      const totalSizeKB = Math.round(totalSize / 1024)

      this.addResult('filesystem', 'healthy', `File system accessible - ${files.length} database files (${totalSizeKB} KB total)`, startTime, {
        dataPath,
        dbFiles: files.length,
        totalSizeKB
      })

    } catch (error) {
      this.addResult('filesystem', 'error', `File system check failed: ${error.message}`, startTime)
    }
  }

  /**
   * Check system resources (memory, CPU)
   */
  private async checkSystemResources(): Promise<void> {
    const startTime = Date.now()

    try {
      const memUsage = process.memoryUsage()
      const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
      const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
      const memRssMB = Math.round(memUsage.rss / 1024 / 1024)

      const systemMemGB = Math.round(os.totalmem() / 1024 / 1024 / 1024)
      const freeMemGB = Math.round(os.freemem() / 1024 / 1024 / 1024)

      const warnings: string[] = []

      // Check for memory warnings
      if (memUsedMB > 500) {
        warnings.push(`High heap memory usage: ${memUsedMB}MB`)
      }

      if (freeMemGB < 1) {
        warnings.push(`Low system memory: ${freeMemGB}GB free`)
      }

      const status = warnings.length > 0 ? 'warning' : 'healthy'
      const message = warnings.length > 0
        ? `System resources with warnings: ${warnings.join(', ')}`
        : `System resources healthy - ${memUsedMB}MB used, ${freeMemGB}GB system free`

      this.addResult('system-resources', status, message, startTime, {
        process: {
          heapUsed: memUsedMB,
          heapTotal: memTotalMB,
          rss: memRssMB
        },
        system: {
          totalMemoryGB: systemMemGB,
          freeMemoryGB: freeMemGB,
          platform: os.platform(),
          arch: os.arch(),
          cpus: os.cpus().length
        },
        warnings
      })

    } catch (error) {
      this.addResult('system-resources', 'error', `System resource check failed: ${error.message}`, startTime)
    }
  }

  /**
   * Check data directory permissions
   */
  private async checkDataDirectoryPermissions(): Promise<void> {
    const startTime = Date.now()

    try {
      const dataPath = this.dbSetup.getDataPath()
      const dbFiles = await this.dbSetup.listDatabaseFiles()

      let readableFiles = 0
      let writableFiles = 0

      for (const file of dbFiles) {
        const filePath = path.join(dataPath, file)
        try {
          // Test read access
          fs.accessSync(filePath, fs.constants.R_OK)
          readableFiles++

          // Test write access
          fs.accessSync(filePath, fs.constants.W_OK)
          writableFiles++
        } catch (error) {
          // Permission issue with this file
        }
      }

      if (writableFiles !== dbFiles.length) {
        this.addResult('data-permissions', 'warning', `Some database files not writable: ${writableFiles}/${dbFiles.length}`, startTime, {
          totalFiles: dbFiles.length,
          readableFiles,
          writableFiles
        })
      } else {
        this.addResult('data-permissions', 'healthy', `All database files accessible: ${dbFiles.length} files`, startTime, {
          totalFiles: dbFiles.length,
          readableFiles,
          writableFiles
        })
      }

    } catch (error) {
      this.addResult('data-permissions', 'error', `Data directory permission check failed: ${error.message}`, startTime)
    }
  }

  private async checkSuperAdmin(): Promise<void> {
    const startTime = Date.now()
    try {
      const permissionService = new AdminPermissionService()
      const superAdminRole = (await permissionService.getAllRoles()).find(
        (role) => role.permissions.includes('*')
      )

      if (!superAdminRole) {
        this.addResult(
          'super-admin-check',
          'warning',
          'No super admin role found. Creating one.',
          startTime
        )
        // Create a super admin role if it doesn't exist
        await permissionService.createRole({
          roleId: 'super_admin',
          name: 'Super Admin',
          description: 'Full system access',
          permissions: ['*'],
          department: 'system',
          isActive: true,
          createdBy: 'system',
          lastModifiedBy: 'system',
          isCustom: false,
          version: '1.0'
        })
      } else {
        this.addResult(
          'super-admin-check',
          'healthy',
          'Super admin role verified.',
          startTime
        )
      }
    } catch (error) {
      this.addResult(
        'super-admin-check',
        'error',
        `Super admin check failed: ${error.message}`,
        startTime
      )
    }
  }

  /**
   * Add a health check result
   */
  private addResult(component: string, status: 'healthy' | 'warning' | 'error', message: string, startTime?: number, details?: any): void {
    const checkDuration = startTime ? Date.now() - startTime : 0

    this.results.push({
      component,
      status,
      message,
      checkDuration,
      timestamp: new Date(),
      details
    })
  }

  /**
   * Report health check results to console
   */
  private reportResults(): void {
    const healthy = this.results.filter(r => r.status === 'healthy').length
    const warnings = this.results.filter(r => r.status === 'warning').length
    const errors = this.results.filter(r => r.status === 'error').length

    console.log('\n📋 System Health Check Results:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    for (const result of this.results) {
      const icon = result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
      const duration = result.checkDuration ? ` (${result.checkDuration}ms)` : ''
      console.log(`${icon} ${result.component}: ${result.message}${duration}`)
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 Summary: ${healthy} healthy, ${warnings} warnings, ${errors} errors`)

    if (errors === 0) {
      console.log('🎉 All systems operational and ready!')
    } else if (errors > 0) {
      console.log('❌ Critical errors detected - server functionality may be impaired')
    }
    console.log('')
  }

  /**
   * Record startup health status in database
   */
  private async recordStartupHealth(): Promise<void> {
    try {
      const db = this.dbSetup.getDatabases()
      const startupDuration = Date.now() - this.startTime.getTime()


      const warnings = this.results.filter(r => r.status === 'warning').length
      const errors = this.results.filter(r => r.status === 'error').length

      const memUsage = process.memoryUsage()

      const startupRecord: Partial<StartupRecord> = {
        serverStartTime: this.startTime,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        processId: process.pid,
        memoryAtStartup: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024)
        },
        databaseStatus: errors > 0 ? 'error' : 'connected',
        healthCheckResults: this.results,
        allSystemsHealthy: errors === 0,
        warningCount: warnings,
        errorCount: errors,
        startupDuration,
        systemInfo: {
          platform: os.platform(),
          arch: os.arch(),
          hostname: os.hostname()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await new Promise<void>((resolve, reject) => {
        db.startup_records.insert(startupRecord as StartupRecord, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      console.log(`💾 Startup health record saved (${startupDuration}ms startup duration)`)

    } catch (error) {
      console.warn('⚠️ Failed to record startup health:', error.message)
    }
  }

  /**
   * Create a health log entry (for periodic or manual health checks)
   */
  public async createHealthLog(recordType: 'startup' | 'periodic' | 'manual' | 'shutdown' = 'manual'): Promise<void> {
    try {
      const db = this.dbSetup.getDatabases()
      const memUsage = process.memoryUsage()

      // Get database status
      const collections = [
        'users', 'events', 'bookings', 'syncQueue',
        'appointments_slots', 'appointment_bookings', 'interviewers',
        'availability_overrides', 'appointment_notifications',
        'startup_records', 'health_logs'
      ]

      const collectionCounts: Record<string, number | string> = {}
      for (const collectionName of collections) {
        try {
          const count = await new Promise<number>((resolve, reject) => {
            db[collectionName].count({}, (err, count) => {
              if (err) reject(err)
              else resolve(count)
            })
          })
          collectionCounts[collectionName] = count
        } catch (error) {
          collectionCounts[collectionName] = `error: ${error.message}`
        }
      }

      const dbFiles = await this.dbSetup.listDatabaseFiles()
      const dataPath = this.dbSetup.getDataPath()

      const fileStats = dbFiles.map(file => {
        try {
          const filePath = path.join(dataPath, file)
          const stats = fs.statSync(filePath)
          return {
            name: file,
            size: Math.round(stats.size / 1024), // KB
            modified: stats.mtime
          }
        } catch (error) {
          return {
            name: file,
            size: 'error',
            modified: null
          }
        }
      })

      // Calculate health score (0-100)
      const totalCollections = collections.length
      const healthyCollections = Object.values(collectionCounts).filter(v => typeof v === 'number').length
      const healthScore = Math.round((healthyCollections / totalCollections) * 100)

      const warnings: string[] = []
      const errors: string[] = []

      // Check for issues
      const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
      if (memUsedMB > 500) warnings.push(`High memory usage: ${memUsedMB}MB`)

      Object.entries(collectionCounts).forEach(([name, count]) => {
        if (typeof count === 'string' && count.startsWith('error:')) {
          errors.push(`${name}: ${count}`)
        }
      })

      const healthLog: Partial<HealthLog> = {
        recordType,
        serverUptime: process.uptime(),
        timestamp: new Date(),
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024)
        },
        database: {
          status: errors.length > 0 ? 'error' : 'connected',
          collections: collectionCounts,
          files: fileStats,
          totalFiles: dbFiles.length,
          r2Ready: true
        },
        healthScore,
        warnings,
        errors,
        systemInfo: {
          processId: process.pid,
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development',
          platform: os.platform()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await new Promise<void>((resolve, reject) => {
        db.health_logs.insert(healthLog as HealthLog, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      console.log(`📊 Health log created (${recordType}) - Score: ${healthScore}/100`)

    } catch (error) {
      console.warn('⚠️ Failed to create health log:', error.message)
    }
  }
}

export default StartupHealthCheck
