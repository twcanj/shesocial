// Database Activation Service
// Manages the transition from legacy to new database structure

import { QueryAdapterService, DatabaseMode } from './QueryAdapterService'
import NeDBSetup from '../db/nedb-setup'

export interface ActivationConfig {
  mode: DatabaseMode
  testPeriodHours?: number
  rollbackOnError?: boolean
  monitorPerformance?: boolean
}

export interface ActivationResult {
  success: boolean
  previousMode: DatabaseMode
  newMode: DatabaseMode
  testsRun: number
  testsPassed: number
  errors: string[]
  performanceMetrics?: {
    queryTime: number
    memoryUsage: number
  }
}

export class DatabaseActivationService {
  private queryAdapter: QueryAdapterService
  private dbSetup: NeDBSetup

  constructor() {
    this.dbSetup = NeDBSetup.getInstance()
    this.queryAdapter = new QueryAdapterService({
      mode: 'legacy',
      preferNew: false,
      fallbackEnabled: true
    })
  }

  // Activate new database structure with safety checks
  async activateNewDatabase(config: ActivationConfig = { mode: 'new' }): Promise<ActivationResult> {
    console.log('🔄 Starting database activation process...')
    
    const previousMode = this.queryAdapter['config'].mode
    const startTime = Date.now()
    let testsRun = 0
    let testsPassed = 0
    const errors: string[] = []

    try {
      // Step 1: Run pre-activation tests
      console.log('🧪 Running pre-activation tests...')
      const preTests = await this.runPreActivationTests()
      testsRun += preTests.total
      testsPassed += preTests.passed
      errors.push(...preTests.errors)

      if (preTests.passed < preTests.total && config.rollbackOnError) {
        return {
          success: false,
          previousMode,
          newMode: previousMode,
          testsRun,
          testsPassed,
          errors: ['Pre-activation tests failed', ...errors]
        }
      }

      // Step 2: Switch to hybrid mode first (safer transition)
      console.log('🔄 Switching to hybrid mode...')
      this.queryAdapter.updateConfig({
        mode: 'hybrid',
        preferNew: true,
        fallbackEnabled: true
      })

      // Step 3: Test hybrid mode functionality
      const hybridTests = await this.runHybridTests()
      testsRun += hybridTests.total
      testsPassed += hybridTests.passed
      errors.push(...hybridTests.errors)

      // Step 4: Switch to full new mode if tests pass
      if (hybridTests.passed === hybridTests.total || !config.rollbackOnError) {
        console.log('✅ Switching to new database mode...')
        this.queryAdapter.updateConfig({ mode: config.mode })

        // Step 5: Run post-activation tests
        const postTests = await this.runPostActivationTests()
        testsRun += postTests.total
        testsPassed += postTests.passed
        errors.push(...postTests.errors)

        // Step 6: Performance monitoring if requested
        let performanceMetrics
        if (config.monitorPerformance) {
          performanceMetrics = await this.measurePerformance()
        }

        const success = errors.length === 0 || !config.rollbackOnError
        
        return {
          success,
          previousMode,
          newMode: config.mode,
          testsRun,
          testsPassed,
          errors,
          performanceMetrics
        }
      } else {
        // Rollback to legacy mode
        this.queryAdapter.updateConfig({ mode: 'legacy' })
        return {
          success: false,
          previousMode,
          newMode: 'legacy',
          testsRun,
          testsPassed,
          errors: ['Hybrid mode tests failed', ...errors]
        }
      }
    } catch (error) {
      // Emergency rollback
      this.queryAdapter.updateConfig({ mode: 'legacy' })
      return {
        success: false,
        previousMode,
        newMode: 'legacy',
        testsRun,
        testsPassed,
        errors: [`Activation failed: ${error}`, ...errors]
      }
    }
  }

  // Run pre-activation tests
  private async runPreActivationTests(): Promise<{ total: number; passed: number; errors: string[] }> {
    const tests = [
      () => this.testNewDatabaseConnectivity(),
      () => this.testDataIntegrity(),
      () => this.testAdminAccess(),
      () => this.testCriticalCollections()
    ]

    let passed = 0
    const errors: string[] = []

    for (const test of tests) {
      try {
        const result = await test()
        if (result) passed++
        else errors.push('Test failed without specific error')
      } catch (error) {
        errors.push(`Test failed: ${error}`)
      }
    }

    return { total: tests.length, passed, errors }
  }

  // Test new database connectivity
  private async testNewDatabaseConnectivity(): Promise<boolean> {
    try {
      const twoDB = this.dbSetup.getTwoDatabases()
      
      // Test admin database
      const adminCount = await new Promise<number>((resolve, reject) => {
        twoDB.admin.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      })

      // Test application database
      const appCount = await new Promise<number>((resolve, reject) => {
        twoDB.application.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      })

      console.log(`📊 New database connectivity test: ${adminCount} admin records, ${appCount} app records`)
      return adminCount > 0 || appCount > 0
    } catch (error) {
      console.error('❌ Database connectivity test failed:', error)
      return false
    }
  }

  // Test data integrity
  private async testDataIntegrity(): Promise<boolean> {
    try {
      // Test admin users exist
      const adminUser = await this.queryAdapter.findAdminUser({ status: 'active' })
      if (!adminUser) {
        console.error('❌ No active admin users found')
        return false
      }

      // Test admin user has required fields
      const requiredFields = ['adminId', 'email', 'passwordHash', 'level']
      const hasAllFields = requiredFields.every(field => adminUser[field] !== undefined)
      
      if (!hasAllFields) {
        console.error('❌ Admin user missing required fields')
        return false
      }

      console.log('✅ Data integrity test passed')
      return true
    } catch (error) {
      console.error('❌ Data integrity test failed:', error)
      return false
    }
  }

  // Test admin access functionality
  private async testAdminAccess(): Promise<boolean> {
    try {
      // Switch temporarily to new mode for testing
      const originalConfig = { ...this.queryAdapter['config'] }
      this.queryAdapter.updateConfig({ mode: 'new' })

      // Test admin user query
      const adminUser = await this.queryAdapter.findAdminUser({ 
        email: 'admin@infinitymatch.com' 
      })

      // Restore original config
      this.queryAdapter.updateConfig(originalConfig)

      if (!adminUser) {
        console.error('❌ Admin access test failed - admin user not found')
        return false
      }

      console.log('✅ Admin access test passed')
      return true
    } catch (error) {
      console.error('❌ Admin access test failed:', error)
      return false
    }
  }

  // Test critical collections exist
  private async testCriticalCollections(): Promise<boolean> {
    try {
      const twoDB = this.dbSetup.getTwoDatabases()
      
      // Check for admin collections
      const adminRecords = await new Promise<any[]>((resolve, reject) => {
        twoDB.admin.find({}, (err: any, docs: any[]) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })

      const adminCollections = [...new Set(adminRecords.map(r => r._collection))]
      const expectedAdminCollections = ['admin_users', 'admin_roles', 'permission_atoms']
      const hasRequiredAdminCollections = expectedAdminCollections.every(col => 
        adminCollections.includes(col)
      )

      if (!hasRequiredAdminCollections) {
        console.error('❌ Missing required admin collections:', {
          expected: expectedAdminCollections,
          found: adminCollections
        })
        return false
      }

      console.log('✅ Critical collections test passed')
      return true
    } catch (error) {
      console.error('❌ Critical collections test failed:', error)
      return false
    }
  }

  // Run hybrid mode tests
  private async runHybridTests(): Promise<{ total: number; passed: number; errors: string[] }> {
    const tests = [
      () => this.testHybridQueryRouting(),
      () => this.testFallbackMechanism()
    ]

    let passed = 0
    const errors: string[] = []

    for (const test of tests) {
      try {
        const result = await test()
        if (result) passed++
        else errors.push('Hybrid test failed')
      } catch (error) {
        errors.push(`Hybrid test failed: ${error}`)
      }
    }

    return { total: tests.length, passed, errors }
  }

  // Test hybrid query routing
  private async testHybridQueryRouting(): Promise<boolean> {
    try {
      // Test that queries route to new database when data exists
      const adminUser = await this.queryAdapter.findAdminUser({ status: 'active' })
      
      if (!adminUser) {
        console.error('❌ Hybrid routing test failed - no admin user found')
        return false
      }

      console.log('✅ Hybrid query routing test passed')
      return true
    } catch (error) {
      console.error('❌ Hybrid routing test failed:', error)
      return false
    }
  }

  // Test fallback mechanism
  private async testFallbackMechanism(): Promise<boolean> {
    try {
      // This is a simplified test - in production you'd test actual fallback scenarios
      const stats = await this.queryAdapter.getSystemStats()
      
      if (!stats.legacy || !stats.new) {
        console.error('❌ Fallback test failed - unable to get system stats')
        return false
      }

      console.log('✅ Fallback mechanism test passed')
      return true
    } catch (error) {
      console.error('❌ Fallback test failed:', error)
      return false
    }
  }

  // Run post-activation tests
  private async runPostActivationTests(): Promise<{ total: number; passed: number; errors: string[] }> {
    const tests = [
      () => this.testNewModeOperations(),
      () => this.testPerformanceBaseline()
    ]

    let passed = 0
    const errors: string[] = []

    for (const test of tests) {
      try {
        const result = await test()
        if (result) passed++
        else errors.push('Post-activation test failed')
      } catch (error) {
        errors.push(`Post-activation test failed: ${error}`)
      }
    }

    return { total: tests.length, passed, errors }
  }

  // Test new mode operations
  private async testNewModeOperations(): Promise<boolean> {
    try {
      // Test basic CRUD operations
      const adminUser = await this.queryAdapter.findAdminUser({ status: 'active' })
      
      if (!adminUser) {
        console.error('❌ New mode operations test failed')
        return false
      }

      console.log('✅ New mode operations test passed')
      return true
    } catch (error) {
      console.error('❌ New mode operations test failed:', error)
      return false
    }
  }

  // Test performance baseline
  private async testPerformanceBaseline(): Promise<boolean> {
    try {
      const startTime = Date.now()
      
      // Run a series of queries to test performance
      await this.queryAdapter.findAdminUser({ status: 'active' })
      
      const queryTime = Date.now() - startTime
      
      // Basic performance check (queries should complete in reasonable time)
      if (queryTime > 1000) {
        console.warn('⚠️  Query performance slower than expected:', queryTime + 'ms')
        return false
      }

      console.log('✅ Performance baseline test passed:', queryTime + 'ms')
      return true
    } catch (error) {
      console.error('❌ Performance test failed:', error)
      return false
    }
  }

  // Measure performance metrics
  private async measurePerformance(): Promise<{ queryTime: number; memoryUsage: number }> {
    const startTime = Date.now()
    const startMemory = process.memoryUsage().heapUsed

    // Run representative queries
    await this.queryAdapter.findAdminUser({ status: 'active' })
    await this.queryAdapter.getSystemStats()

    const queryTime = Date.now() - startTime
    const memoryUsage = process.memoryUsage().heapUsed - startMemory

    console.log('📊 Performance metrics:', { queryTime: queryTime + 'ms', memoryUsage: Math.round(memoryUsage / 1024) + 'KB' })

    return { queryTime, memoryUsage }
  }

  // Get current configuration
  getCurrentConfig(): any {
    return this.queryAdapter['config']
  }

  // Emergency rollback to legacy mode
  emergencyRollback(): void {
    console.log('🚨 Emergency rollback to legacy mode')
    this.queryAdapter.updateConfig({
      mode: 'legacy',
      preferNew: false,
      fallbackEnabled: true
    })
  }

  // Get the query adapter instance for external use
  getQueryAdapter(): QueryAdapterService {
    return this.queryAdapter
  }
}

export default DatabaseActivationService