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

export default router