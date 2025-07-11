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

// Health check endpoint (outside API prefix for load balancers)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SheSocial Backend is healthy',
    timestamp: Date.now(),
    environment: NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime()
  })
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