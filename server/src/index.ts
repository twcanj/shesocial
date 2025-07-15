// SheSocial Backend Server
// Taiwan Luxury Social Platform API

import express from 'express'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'

// Middleware imports
import corsMiddleware from './middleware/cors'
import { developmentFormat, productionFormat, errorFormat } from './middleware/logger'

// Routes
import apiRoutes from './routes/api'
import adminRoutes from './routes/admin'

// Database
import NeDBSetup from './db/nedb-setup'

const app = express()
const PORT = process.env.PORT || 10000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log(`📁 Created data directory: ${dataDir}`)
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// CORS middleware
app.use(corsMiddleware)

// Request logging
if (NODE_ENV === 'production') {
  app.use(productionFormat)
  app.use(errorFormat)
} else {
  app.use(developmentFormat)
}

// Body parsing middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// API routes
app.use('/api', apiRoutes)

// Admin routes (completely separate from user API)
app.use('/api/admin', adminRoutes)

// Health check endpoint (outside API prefix for load balancers)
app.get('/health', async (req, res) => {
  try {
    // Basic server health
    const serverHealth = {
      success: true,
      message: 'SheSocial Backend is healthy',
      timestamp: Date.now(),
      environment: NODE_ENV,
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    }

    // Database health check
    let databaseHealth = {}
    try {
      const dbSetup = NeDBSetup.getInstance()
      const db = dbSetup.getDatabases()
      
      // Get collection counts
      const collections = [
        'users', 'events', 'bookings', 'syncQueue',
        'appointments_slots', 'appointment_bookings', 'interviewers',
        'availability_overrides', 'appointment_notifications'
      ]
      
      const collectionCounts = {}
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

      // Get database files info
      const dbFiles = await dbSetup.listDatabaseFiles()
      const dataPath = dbSetup.getDataPath()
      
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

      databaseHealth = {
        status: 'connected',
        dataPath,
        collections: collectionCounts,
        files: fileStats,
        totalFiles: dbFiles.length,
        r2Ready: true
      }
    } catch (error) {
      databaseHealth = {
        status: 'error',
        error: error.message,
        r2Ready: false
      }
    }

    // Combined health response
    res.json({
      ...serverHealth,
      database: databaseHealth
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: Date.now()
    })
  }
})

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'SheSocial API',
    description: 'Taiwan Luxury Social Activity Platform Backend',
    version: '1.0.0',
    environment: NODE_ENV,
    documentation: {
      health: '/health',
      api: '/api',
      endpoints: {
        users: '/api/users',
        events: '/api/events',
        bookings: '/api/bookings',
        appointments: '/api/appointments',
        admin: '/api/admin',
        auth: '/api/auth',
        stats: '/api/stats',
        sync: '/api/sync'
      }
    },
    taiwan: {
      locale: 'zh-TW',
      timezone: 'Asia/Taipei',
      currency: 'TWD'
    },
    timestamp: Date.now()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `路徑 ${req.originalUrl} 不存在`,
    timestamp: Date.now()
  })
})

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Server Error:', err)
  
  res.status(err.status || 500).json({
    success: false,
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: Date.now(),
    ...(NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  console.log('🚀 SheSocial Backend Server Started')
  console.log('🌏 Taiwan Luxury Social Platform API')
  console.log(`📡 Server running on port ${PORT}`)
  console.log(`🔧 Environment: ${NODE_ENV}`)
  console.log(`⏰ Started at: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`📚 API docs: http://localhost:${PORT}/api`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})

export default app