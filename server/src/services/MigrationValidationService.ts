// Migration Validation Service
// Comprehensive validation for rolling deployment safety

import NeDBSetup, { DatabaseCollections, TwoDatabaseCollections } from '../db/nedb-setup'

export interface ValidationResult {
  valid: boolean
  category: 'critical' | 'warning' | 'info'
  message: string
  details?: any
}

export interface ValidationReport {
  overall: boolean
  criticalIssues: ValidationResult[]
  warnings: ValidationResult[]
  info: ValidationResult[]
  timestamp: Date
  recommendations: string[]
}

export class MigrationValidationService {
  private dbSetup: NeDBSetup
  private legacyDb: DatabaseCollections
  private newDb: TwoDatabaseCollections

  constructor() {
    this.dbSetup = NeDBSetup.getInstance()
    this.legacyDb = this.dbSetup.getDatabases()
    this.newDb = this.dbSetup.getTwoDatabases()
  }

  // Main validation orchestration
  async performFullValidation(): Promise<ValidationReport> {
    console.log('🔍 Starting comprehensive migration validation...')

    const validations: ValidationResult[] = []

    // Data integrity validations
    validations.push(...await this.validateDataIntegrity())
    
    // Schema consistency validations
    validations.push(...await this.validateSchemaConsistency())
    
    // Performance validations
    validations.push(...await this.validatePerformance())
    
    // Security validations
    validations.push(...await this.validateSecurity())
    
    // Business logic validations
    validations.push(...await this.validateBusinessLogic())

    // Categorize results
    const criticalIssues = validations.filter(v => !v.valid && v.category === 'critical')
    const warnings = validations.filter(v => !v.valid && v.category === 'warning')
    const info = validations.filter(v => v.category === 'info')

    // Generate recommendations
    const recommendations = this.generateRecommendations(criticalIssues, warnings)

    const report: ValidationReport = {
      overall: criticalIssues.length === 0,
      criticalIssues,
      warnings,
      info,
      timestamp: new Date(),
      recommendations
    }

    console.log(`📊 Validation complete: ${criticalIssues.length} critical, ${warnings.length} warnings`)
    return report
  }

  // Data integrity validations
  private async validateDataIntegrity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    try {
      // Check admin users integrity
      const adminValidation = await this.validateAdminUsersIntegrity()
      results.push(adminValidation)

      // Check application data integrity
      const appValidation = await this.validateApplicationDataIntegrity()
      results.push(appValidation)

      // Check for data corruption
      const corruptionValidation = await this.validateDataCorruption()
      results.push(corruptionValidation)

      // Check referential integrity
      const refValidation = await this.validateReferentialIntegrity()
      results.push(refValidation)

    } catch (error) {
      results.push({
        valid: false,
        category: 'critical',
        message: 'Data integrity validation failed',
        details: error
      })
    }

    return results
  }

  // Admin users integrity validation
  private async validateAdminUsersIntegrity(): Promise<ValidationResult> {
    try {
      const adminRecords = await this.getAllRecords(this.newDb.admin)
      const adminUsers = adminRecords.filter(r => r._collection === 'admin_users')

      if (adminUsers.length === 0) {
        return {
          valid: false,
          category: 'critical',
          message: 'No admin users found in migrated data'
        }
      }

      // Check for essential admin fields
      const requiredFields = ['adminId', 'email', 'passwordHash', 'level', 'status']
      const invalidUsers = adminUsers.filter(user => 
        !requiredFields.every(field => user[field] !== undefined)
      )

      if (invalidUsers.length > 0) {
        return {
          valid: false,
          category: 'critical',
          message: 'Admin users missing required fields',
          details: { invalidCount: invalidUsers.length, requiredFields }
        }
      }

      // Check for at least one Level 1 admin
      const level1Admins = adminUsers.filter(user => user.level === 1)
      if (level1Admins.length === 0) {
        return {
          valid: false,
          category: 'critical',
          message: 'No Level 1 admin users found'
        }
      }

      return {
        valid: true,
        category: 'info',
        message: `Admin users validation passed: ${adminUsers.length} users, ${level1Admins.length} Level 1 admins`
      }
    } catch (error) {
      return {
        valid: false,
        category: 'critical',
        message: 'Admin users validation failed',
        details: error
      }
    }
  }

  // Application data integrity validation
  private async validateApplicationDataIntegrity(): Promise<ValidationResult> {
    try {
      const appRecords = await this.getAllRecords(this.newDb.application)
      const collectionCounts: { [key: string]: number } = {}

      // Count records by collection
      appRecords.forEach(record => {
        const collection = record._collection || 'unknown'
        collectionCounts[collection] = (collectionCounts[collection] || 0) + 1
      })

      const criticalCollections = ['users', 'events']
      const missingCritical = criticalCollections.filter(col => !collectionCounts[col])

      if (missingCritical.length > 0) {
        return {
          valid: false,
          category: 'warning',
          message: 'Some critical collections are empty',
          details: { missingCollections: missingCritical, allCounts: collectionCounts }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'Application data integrity validation passed',
        details: { collectionCounts }
      }
    } catch (error) {
      return {
        valid: false,
        category: 'critical',
        message: 'Application data validation failed',
        details: error
      }
    }
  }

  // Data corruption validation
  private async validateDataCorruption(): Promise<ValidationResult> {
    try {
      const issues: string[] = []

      // Check admin database
      const adminRecords = await this.getAllRecords(this.newDb.admin)
      const adminCorrupted = adminRecords.filter(record => 
        !record._id || !record._collection || typeof record !== 'object'
      )

      if (adminCorrupted.length > 0) {
        issues.push(`${adminCorrupted.length} corrupted records in admin database`)
      }

      // Check application database
      const appRecords = await this.getAllRecords(this.newDb.application)
      const appCorrupted = appRecords.filter(record => 
        !record._id || !record._collection || typeof record !== 'object'
      )

      if (appCorrupted.length > 0) {
        issues.push(`${appCorrupted.length} corrupted records in application database`)
      }

      if (issues.length > 0) {
        return {
          valid: false,
          category: 'critical',
          message: 'Data corruption detected',
          details: { issues }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'No data corruption detected'
      }
    } catch (error) {
      return {
        valid: false,
        category: 'critical',
        message: 'Corruption validation failed',
        details: error
      }
    }
  }

  // Referential integrity validation
  private async validateReferentialIntegrity(): Promise<ValidationResult> {
    try {
      const issues: string[] = []
      const appRecords = await this.getAllRecords(this.newDb.application)

      // Check user-event relationships
      const users = appRecords.filter(r => r._collection === 'users')
      const events = appRecords.filter(r => r._collection === 'events')
      const bookings = appRecords.filter(r => r._collection === 'bookings')

      // Validate booking references
      const invalidBookings = bookings.filter(booking => {
        const userExists = users.some(user => user.userId === booking.userId)
        const eventExists = events.some(event => event.eventId === booking.eventId)
        return !userExists || !eventExists
      })

      if (invalidBookings.length > 0) {
        issues.push(`${invalidBookings.length} bookings with invalid user/event references`)
      }

      if (issues.length > 0) {
        return {
          valid: false,
          category: 'warning',
          message: 'Referential integrity issues detected',
          details: { issues }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'Referential integrity validation passed'
      }
    } catch (error) {
      return {
        valid: false,
        category: 'warning',
        message: 'Referential integrity validation failed',
        details: error
      }
    }
  }

  // Schema consistency validations
  private async validateSchemaConsistency(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    try {
      // Validate collection tagging
      const tagValidation = await this.validateCollectionTagging()
      results.push(tagValidation)

      // Validate timestamp fields
      const timestampValidation = await this.validateTimestamps()
      results.push(timestampValidation)

    } catch (error) {
      results.push({
        valid: false,
        category: 'warning',
        message: 'Schema consistency validation failed',
        details: error
      })
    }

    return results
  }

  // Collection tagging validation
  private async validateCollectionTagging(): Promise<ValidationResult> {
    try {
      const adminRecords = await this.getAllRecords(this.newDb.admin)
      const appRecords = await this.getAllRecords(this.newDb.application)

      const adminUntagged = adminRecords.filter(r => !r._collection)
      const appUntagged = appRecords.filter(r => !r._collection)

      if (adminUntagged.length > 0 || appUntagged.length > 0) {
        return {
          valid: false,
          category: 'warning',
          message: 'Records missing collection tags',
          details: { 
            adminUntagged: adminUntagged.length, 
            appUntagged: appUntagged.length 
          }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'Collection tagging validation passed'
      }
    } catch (error) {
      return {
        valid: false,
        category: 'warning',
        message: 'Collection tagging validation failed',
        details: error
      }
    }
  }

  // Timestamp validation
  private async validateTimestamps(): Promise<ValidationResult> {
    try {
      const adminRecords = await this.getAllRecords(this.newDb.admin)
      const appRecords = await this.getAllRecords(this.newDb.application)

      const allRecords = [...adminRecords, ...appRecords]
      const missingMigrationTimestamp = allRecords.filter(r => !r._migrated)

      if (missingMigrationTimestamp.length > 0) {
        return {
          valid: false,
          category: 'info',
          message: 'Some records missing migration timestamp',
          details: { count: missingMigrationTimestamp.length }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'Timestamp validation passed'
      }
    } catch (error) {
      return {
        valid: false,
        category: 'warning',
        message: 'Timestamp validation failed',
        details: error
      }
    }
  }

  // Performance validations
  private async validatePerformance(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    try {
      // Database size validation
      const sizeValidation = await this.validateDatabaseSize()
      results.push(sizeValidation)

      // Query performance validation
      const queryValidation = await this.validateQueryPerformance()
      results.push(queryValidation)

    } catch (error) {
      results.push({
        valid: false,
        category: 'warning',
        message: 'Performance validation failed',
        details: error
      })
    }

    return results
  }

  // Database size validation
  private async validateDatabaseSize(): Promise<ValidationResult> {
    try {
      const adminCount = await this.countRecords(this.newDb.admin)
      const appCount = await this.countRecords(this.newDb.application)
      const totalRecords = adminCount + appCount

      if (totalRecords > 100000) {
        return {
          valid: true,
          category: 'warning',
          message: 'Large dataset detected - monitor performance',
          details: { totalRecords, adminCount, appCount }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'Database size validation passed',
        details: { totalRecords, adminCount, appCount }
      }
    } catch (error) {
      return {
        valid: false,
        category: 'warning',
        message: 'Database size validation failed',
        details: error
      }
    }
  }

  // Query performance validation
  private async validateQueryPerformance(): Promise<ValidationResult> {
    try {
      const startTime = Date.now()
      
      // Test basic queries
      await this.countRecords(this.newDb.admin)
      await this.countRecords(this.newDb.application)
      
      const queryTime = Date.now() - startTime

      if (queryTime > 5000) {
        return {
          valid: false,
          category: 'warning',
          message: 'Slow query performance detected',
          details: { queryTimeMs: queryTime }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'Query performance validation passed',
        details: { queryTimeMs: queryTime }
      }
    } catch (error) {
      return {
        valid: false,
        category: 'warning',
        message: 'Query performance validation failed',
        details: error
      }
    }
  }

  // Security validations
  private async validateSecurity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    try {
      // Password security validation
      const passwordValidation = await this.validatePasswordSecurity()
      results.push(passwordValidation)

    } catch (error) {
      results.push({
        valid: false,
        category: 'critical',
        message: 'Security validation failed',
        details: error
      })
    }

    return results
  }

  // Password security validation
  private async validatePasswordSecurity(): Promise<ValidationResult> {
    try {
      const adminRecords = await this.getAllRecords(this.newDb.admin)
      const adminUsers = adminRecords.filter(r => r._collection === 'admin_users')

      const insecurePasswords = adminUsers.filter(user => 
        !user.passwordHash || 
        user.passwordHash.length < 50 || // Bcrypt hashes should be ~60 chars
        !user.passwordHash.startsWith('$2')
      )

      if (insecurePasswords.length > 0) {
        return {
          valid: false,
          category: 'critical',
          message: 'Insecure password hashes detected',
          details: { count: insecurePasswords.length }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'Password security validation passed'
      }
    } catch (error) {
      return {
        valid: false,
        category: 'critical',
        message: 'Password security validation failed',
        details: error
      }
    }
  }

  // Business logic validations
  private async validateBusinessLogic(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    try {
      // Admin level validation
      const levelValidation = await this.validateAdminLevels()
      results.push(levelValidation)

    } catch (error) {
      results.push({
        valid: false,
        category: 'warning',
        message: 'Business logic validation failed',
        details: error
      })
    }

    return results
  }

  // Admin level validation
  private async validateAdminLevels(): Promise<ValidationResult> {
    try {
      const adminRecords = await this.getAllRecords(this.newDb.admin)
      const adminUsers = adminRecords.filter(r => r._collection === 'admin_users')

      const invalidLevels = adminUsers.filter(user => 
        user.level !== 1 && user.level !== 2
      )

      if (invalidLevels.length > 0) {
        return {
          valid: false,
          category: 'warning',
          message: 'Invalid admin levels detected',
          details: { count: invalidLevels.length }
        }
      }

      return {
        valid: true,
        category: 'info',
        message: 'Admin level validation passed'
      }
    } catch (error) {
      return {
        valid: false,
        category: 'warning',
        message: 'Admin level validation failed',
        details: error
      }
    }
  }

  // Generate recommendations based on validation results
  private generateRecommendations(critical: ValidationResult[], warnings: ValidationResult[]): string[] {
    const recommendations: string[] = []

    if (critical.length > 0) {
      recommendations.push('🚨 CRITICAL: Do not proceed with deployment until critical issues are resolved')
      recommendations.push('Consider rolling back to previous state')
    }

    if (warnings.length > 0) {
      recommendations.push('⚠️  Review warnings before proceeding')
      recommendations.push('Monitor system closely after deployment')
    }

    if (critical.length === 0 && warnings.length === 0) {
      recommendations.push('✅ Validation passed - safe to proceed with deployment')
      recommendations.push('Consider updating query adapters to use new database')
    }

    return recommendations
  }

  // Helper methods
  private async getAllRecords(collection: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      collection.find({}, (err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  private async countRecords(collection: any): Promise<number> {
    return new Promise((resolve, reject) => {
      collection.count({}, (err: any, count: number) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
  }
}

export default MigrationValidationService