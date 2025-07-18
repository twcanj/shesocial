// Simplified Admin Routes for immediate functionality
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import NeDBSetup from '../db/nedb-setup'

const router = express.Router()

// JWT Configuration
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_jwt_secret_key_should_be_secure'
const ADMIN_JWT_EXPIRES_IN = '8h'

// Admin login endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      })
    }

    // Get database instance
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()

    // Look up admin user by email
    const adminUser = await new Promise<any>((resolve, reject) => {
      db.admin_users.findOne({ email }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (!adminUser) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      })
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      })
    }

    // Check if admin is active
    if (adminUser.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin account is suspended or inactive' 
      })
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        adminId: adminUser.adminId,
        username: adminUser.username,
        roleId: adminUser.roleId,
        department: adminUser.department || 'admin'
      },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES_IN }
    )

    // Update last login
    await new Promise<void>((resolve, reject) => {
      db.admin_users.update(
        { adminId: adminUser.adminId },
        { $set: { lastLogin: new Date() } },
        {},
        (err: any) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    res.json({
      success: true,
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: ADMIN_JWT_EXPIRES_IN,
        admin: {
          adminId: adminUser.adminId,
          username: adminUser.username,
          email: adminUser.email,
          roleId: adminUser.roleId,
          department: adminUser.department || 'admin',
          status: adminUser.status
        }
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Admin logout endpoint
router.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// Admin profile endpoint
router.get('/auth/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      })
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any

    // Get database instance
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()

    // Get admin user details
    const adminUser = await new Promise<any>((resolve, reject) => {
      db.admin_users.findOne({ adminId: decoded.adminId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (!adminUser) {
      return res.status(404).json({ 
        success: false,
        error: 'Admin user not found' 
      })
    }

    res.json({
      success: true,
      data: {
        adminId: adminUser.adminId,
        username: adminUser.username,
        email: adminUser.email,
        roleId: adminUser.roleId,
        department: adminUser.department || 'admin',
        status: adminUser.status,
        lastLogin: adminUser.lastLogin
      }
    })
  } catch (error) {
    console.error('Admin profile error:', error)
    res.status(401).json({ 
      success: false,
      error: 'Invalid token' 
    })
  }
})

// System stats endpoint
router.get('/system/stats', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      })
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any

    // Get database instance
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()

    // Get system statistics
    const stats = {
      users: await new Promise<number>((resolve, reject) => {
        db.users.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      }),
      events: await new Promise<number>((resolve, reject) => {
        db.events.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      }),
      bookings: await new Promise<number>((resolve, reject) => {
        db.bookings.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      }),
      appointments: await new Promise<number>((resolve, reject) => {
        db.appointment_bookings.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      }),
      adminUsers: await new Promise<number>((resolve, reject) => {
        db.admin_users.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      }),
      marketingCampaigns: await new Promise<number>((resolve, reject) => {
        db.marketing_campaigns.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      })
    }

    // Get recent activity
    const recentActivity = []
    
    // Get recent user registrations
    const recentUsers = await new Promise<any[]>((resolve, reject) => {
      db.users.find({}).sort({ createdAt: -1 }).limit(5).exec((err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    recentUsers.forEach(user => {
      recentActivity.push({
        type: 'user_registration',
        description: `New user registered: ${user.profile?.firstName || 'Unknown'}`,
        timestamp: user.createdAt || new Date()
      })
    })

    // Get recent events
    const recentEvents = await new Promise<any[]>((resolve, reject) => {
      db.events.find({}).sort({ createdAt: -1 }).limit(3).exec((err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    recentEvents.forEach(event => {
      recentActivity.push({
        type: 'event_created',
        description: `New event created: ${event.title}`,
        timestamp: event.createdAt || new Date()
      })
    })

    // Sort recent activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    res.json({
      success: true,
      data: {
        stats,
        recentActivity: recentActivity.slice(0, 10), // Return top 10 recent activities
        systemInfo: {
          uptime: process.uptime(),
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
          },
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development'
        }
      }
    })
  } catch (error) {
    console.error('System stats error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve system statistics' 
    })
  }
})

export default router