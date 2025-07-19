// Migration API Routes for Rolling Deployment
// Provides safe endpoints for database migration management

import express, { Request, Response } from 'express'
import DatabaseMigrationService, { MigrationProgress } from '../services/DatabaseMigrationService'
import DatabaseActivationService from '../services/DatabaseActivationService'
import { adminAuth, requirePermission } from '../middleware/adminAuth'

// Extend Express Request type for admin authentication
interface AdminRequest extends Request {
  admin?: any
  requiredPermission?: string
}

const router = express.Router()
const migrationService = new DatabaseMigrationService()
const activationService = new DatabaseActivationService()

// Track migration progress globally
let currentMigrationProgress: MigrationProgress | null = null

// Get migration plan analysis
router.get('/plan', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    console.log('📋 Admin requesting migration plan analysis')
    
    const plan = await migrationService.analyzeMigrationPlan()
    
    res.json({
      success: true,
      data: {
        plan,
        recommendation: plan.estimatedRecords > 10000 
          ? 'Large dataset detected. Consider maintenance window.' 
          : 'Dataset size is manageable for live migration.',
        readyForMigration: true,
        currentStatus: 'legacy-21-files'
      }
    })
  } catch (error) {
    console.error('❌ Migration plan analysis failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze migration plan',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Create rollback snapshot
router.post('/snapshot', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    console.log('📸 Admin creating rollback snapshot')
    
    const success = await migrationService.createRollbackSnapshot()
    
    if (success) {
      res.json({
        success: true,
        message: 'Rollback snapshot created successfully',
        timestamp: new Date()
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create rollback snapshot'
      })
    }
  } catch (error) {
    console.error('❌ Snapshot creation failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Snapshot creation failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Start migration process
router.post('/start', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    if (currentMigrationProgress?.status === 'running') {
      return res.status(409).json({
        success: false,
        error: 'Migration already in progress'
      })
    }

    console.log('🚀 Admin starting database migration')
    
    // Start migration asynchronously
    migrationService.executeFullMigration((progress) => {
      currentMigrationProgress = progress
      console.log(`📊 Migration progress: ${progress.percentage}% - ${progress.step}`)
    }).then((result) => {
      console.log('✅ Migration completed:', result)
      if (currentMigrationProgress) {
        currentMigrationProgress.status = result.success ? 'completed' : 'error'
        currentMigrationProgress.percentage = 100
      }
    }).catch((error) => {
      console.error('❌ Migration failed:', error)
      if (currentMigrationProgress) {
        currentMigrationProgress.status = 'error'
        currentMigrationProgress.errors.push(String(error))
      }
    })

    // Initialize progress tracking
    currentMigrationProgress = {
      step: 'Initializing migration',
      completed: 0,
      total: 100,
      percentage: 0,
      status: 'running',
      errors: [],
      startTime: new Date()
    }

    res.json({
      success: true,
      message: 'Migration started successfully',
      migrationId: Date.now().toString()
    })
  } catch (error) {
    console.error('❌ Migration start failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start migration',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Get migration progress
router.get('/progress', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    if (!currentMigrationProgress) {
      return res.json({
        success: true,
        data: {
          status: 'not-started',
          message: 'No migration in progress'
        }
      })
    }

    res.json({
      success: true,
      data: currentMigrationProgress
    })
  } catch (error) {
    console.error('❌ Progress check failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get migration progress',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Validate migration results
router.post('/validate', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    console.log('🔍 Admin requesting migration validation')
    
    const validation = await migrationService.validateMigration()
    
    res.json({
      success: true,
      data: {
        valid: validation.valid,
        issues: validation.issues,
        recommendation: validation.valid 
          ? 'Migration successful. Safe to proceed with query updates.'
          : 'Issues detected. Consider rollback or manual fixes.'
      }
    })
  } catch (error) {
    console.error('❌ Migration validation failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Migration validation failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Rollback to previous state
router.post('/rollback', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { snapshotPath } = req.body
    
    console.log('🔄 Admin initiating rollback operation')
    
    const success = await migrationService.rollback(snapshotPath)
    
    if (success) {
      // Reset migration progress
      currentMigrationProgress = null
      
      res.json({
        success: true,
        message: 'Rollback completed successfully',
        timestamp: new Date()
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Rollback operation failed'
      })
    }
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Rollback failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Get migration logs
router.get('/logs', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const logs = migrationService.getMigrationLogs()
    
    res.json({
      success: true,
      data: {
        logs,
        count: logs.length,
        lastUpdate: new Date()
      }
    })
  } catch (error) {
    console.error('❌ Failed to get migration logs:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get migration logs',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Emergency stop migration (pause)
router.post('/stop', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    if (currentMigrationProgress?.status === 'running') {
      currentMigrationProgress.status = 'paused'
      
      res.json({
        success: true,
        message: 'Migration paused successfully',
        note: 'Migration can be resumed or rolled back'
      })
    } else {
      res.status(400).json({
        success: false,
        error: 'No active migration to stop'
      })
    }
  } catch (error) {
    console.error('❌ Failed to stop migration:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to stop migration',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Get system status (legacy vs new database usage)
router.get('/status', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    // Check if new databases have data
    const dbSetup = require('../db/nedb-setup').default.getInstance()
    const newDb = dbSetup.getTwoDatabases()
    
    const adminCount = await new Promise<number>((resolve, reject) => {
      newDb.admin.count({}, (err: any, count: number) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
    
    const appCount = await new Promise<number>((resolve, reject) => {
      newDb.application.count({}, (err: any, count: number) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
    
    const totalNewRecords = adminCount + appCount
    
    let status = 'legacy-21-files'
    if (totalNewRecords > 0) {
      status = currentMigrationProgress?.status === 'completed' ? 'new-2-database' : 'migration-in-progress'
    }
    
    res.json({
      success: true,
      data: {
        currentStatus: status,
        newDatabaseRecords: totalNewRecords,
        adminRecords: adminCount,
        applicationRecords: appCount,
        migrationInProgress: currentMigrationProgress?.status === 'running',
        lastMigrationProgress: currentMigrationProgress
      }
    })
  } catch (error) {
    console.error('❌ Failed to get system status:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get system status',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// Database Activation Routes (Post-Migration)
router.post('/activate', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { mode = 'new', testPeriodHours = 24, rollbackOnError = true, monitorPerformance = true } = req.body
    
    console.log('🔄 Admin initiating database activation')
    
    const result = await activationService.activateNewDatabase({
      mode,
      testPeriodHours,
      rollbackOnError,
      monitorPerformance
    })

    if (result.success) {
      res.json({
        success: true,
        message: 'Database activation completed successfully',
        data: result
      })
    } else {
      res.status(400).json({
        success: false,
        error: 'Database activation failed',
        data: result
      })
    }
  } catch (error) {
    console.error('❌ Database activation failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Database activation failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

router.get('/config', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const config = activationService.getCurrentConfig()
    
    res.json({
      success: true,
      data: {
        currentMode: config.mode,
        preferNew: config.preferNew,
        fallbackEnabled: config.fallbackEnabled,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('❌ Failed to get database config:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get database configuration',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

router.post('/rollback-activation', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    console.log('🚨 Admin initiating emergency activation rollback')
    
    activationService.emergencyRollback()
    
    res.json({
      success: true,
      message: 'Emergency rollback completed - system reverted to legacy mode',
      timestamp: new Date()
    })
  } catch (error) {
    console.error('❌ Emergency rollback failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Emergency rollback failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

export default router