// Admin Routes
// API endpoints for admin authentication and permission management
import express, { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AdminPermissionServiceDB } from '../services/AdminPermissionServiceDB'
import { AdminUser } from '../models/AdminPermission'
import NeDBSetup from '../db/nedb-setup'

// Extend Express Request type for admin authentication
interface AdminRequest extends Request {
  admin?: any  // Using any type to avoid TypeScript errors with complex object structure
  requiredPermission?: string
}

const router = express.Router()
const adminPermissionService = new AdminPermissionServiceDB()

// JWT Configuration for Admin (separate from user JWT)
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_jwt_secret_key_should_be_secure'
const ADMIN_JWT_EXPIRES_IN = '8h'
const ADMIN_REFRESH_EXPIRES_IN = '24h'

// Admin Authentication Middleware
const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any

    // Check if user has permission for this endpoint if a permission is required
    if (req.requiredPermission) {
      const hasPermission = await adminPermissionService.userHasPermission(decoded.adminId, req.requiredPermission)

      if (!hasPermission) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' })
      }
    }

    req.admin = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' })
  }
}

// Permission requirement middleware
const requirePermission = (permission: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    req.requiredPermission = permission
    next()
  }
}

// Admin Authentication Routes
router.post('/auth/login', async (req, res) => {
  try {
      console.log('🔍 Admin login endpoint called')
      console.log('📦 Request body:', req.body)
      const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Look up admin user from database by email
    let adminUser: any
    try {
      const dbSetup = NeDBSetup.getInstance()
      const db = dbSetup.getDatabases()
      
      adminUser = await new Promise<any>((resolve, reject) => {
        db.admin_users.findOne({ email }, (err: any, doc: any) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })
    } catch (error) {
      console.error('Error looking up admin user:', error)
      return res.status(500).json({ error: 'Server error during authentication' })
    }

    if (!adminUser) {
      console.log('❌ Admin user not found:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Validate password
    console.log('🔑 Checking password for:', adminUser.username)
      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash)
      console.log('🔐 Password valid:', isValidPassword)
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', adminUser.username)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if admin is active
    if (adminUser.status !== 'active') {
      console.log('❌ Admin account is not active:', adminUser.status)
      return res.status(403).json({ error: 'Admin account is suspended or inactive' })
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        adminId: adminUser.adminId,
        username: adminUser.username,
        roleId: adminUser.roleId,
        department: adminUser.department || 'admin' // Use department directly or default to 'admin'
      },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES_IN }
    )

    const refreshToken = jwt.sign(
      { adminId: adminUser.adminId },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_REFRESH_EXPIRES_IN }
    )

    // Update last login if profile exists
    if (adminUser.profile) {
      adminUser.profile.lastLogin = new Date()
    } else {
      // Create profile if it doesn't exist
      adminUser.profile = { lastLogin: new Date() }
    }

    console.log('🔍 Getting permissions for admin:', adminUser.adminId)
    // 直接使用 adminUser.permissions
    const permissions = adminUser.permissions || []
    console.log('📋 Admin permissions:', permissions)

    res.json({
      success: true,
      data: {
        admin: {
          adminId: adminUser.adminId,
          username: adminUser.username,
          email: adminUser.email,
          profile: adminUser.profile,
          roleId: adminUser.roleId,
          department: adminUser.department || 'admin',
          status: adminUser.status,
          permissions: permissions
        },
        accessToken,
        refreshToken,
        expiresIn: ADMIN_JWT_EXPIRES_IN
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const decoded = jwt.verify(refreshToken, ADMIN_JWT_SECRET) as any

    // Generate new access token
    const accessToken = jwt.sign(
      {
        adminId: decoded.adminId
        // Would fetch additional data from database in real implementation
      },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      data: { accessToken, expiresIn: ADMIN_JWT_EXPIRES_IN }
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

router.post('/auth/logout', (req: AdminRequest, res: Response) => {
  // In a real implementation, you would invalidate the token
  res.json({ success: true, message: 'Logged out successfully' })
})

router.get('/auth/profile', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const admin = req.admin!
    // 獲取管理員用戶
    const adminUser = await adminPermissionService.getAdminUser(admin.adminId)
    const permissions = adminUser?.permissions || []

    res.json({
      success: true,
      data: {
        ...admin,
        permissions
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin profile' })
  }
})

// Permission Management Routes
router.get('/permissions/atoms', requirePermission('admin'), adminAuth, async (req, res) => {
  try {
    const atoms = await adminPermissionService.getAllPermissionAtoms()
    res.json({ success: true, data: atoms })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permission atoms' })
  }
})

router.get('/permissions/atoms/grouped', requirePermission('admin'), adminAuth, async (req, res) => {
  try {
    // 獲取所有權限原子
    const atoms = await adminPermissionService.getAllPermissionAtoms()
    
    // 按組分組
    const grouped = atoms.reduce((acc: any, atom: any) => {
      if (!acc[atom.group]) {
        acc[atom.group] = []
      }
      acc[atom.group].push(atom)
      return acc
    }, {})
    
    res.json({ success: true, data: grouped })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch grouped permissions' })
  }
})

router.post('/permissions/atoms', requirePermission('admin'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const atomData = { ...req.body, createdBy: req.admin!.adminId }
    const atom = await adminPermissionService.createPermissionAtom(atomData)
    res.status(201).json({ success: true, data: atom })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Role Management Routes
router.get('/roles', requirePermission('admin'), adminAuth, async (req, res) => {
  try {
    const { department } = req.query

    const roles = department
      ? await adminPermissionService.getRolesByDepartment(department as any)
      : await adminPermissionService.getAllRoles()

    res.json({ success: true, data: roles })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' })
  }
})

router.post('/roles', requirePermission('admin'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const roleData = { ...req.body, createdBy: req.admin!.adminId, lastModifiedBy: req.admin!.adminId }
    const role = await adminPermissionService.createRole(roleData)
    res.status(201).json({ success: true, data: role })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/roles/:roleId', requirePermission('admin'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { roleId } = req.params
    const updates = { 
      ...req.body, 
      lastModifiedBy: req.admin!.adminId 
    }
    const role = await adminPermissionService.updateRole(roleId, updates)
    res.json({ success: true, data: role })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/roles/:roleId/capabilities', requirePermission('admin'), adminAuth, async (req, res) => {
  try {
    const { roleId } = req.params
    // 獲取角色
    const role = await adminPermissionService.getRole(roleId)
    
    if (!role) {
      return res.status(404).json({ error: `Role ${roleId} not found` })
    }
    
    // 返回角色的權限
    const capabilities = {
      permissions: role.permissions,
      isActive: role.isActive,
      department: role.department
    }
    
    res.json({ success: true, data: capabilities })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Permission Validation Routes
router.post('/permissions/validate', requirePermission('admin'), adminAuth, async (req, res) => {
  try {
    const { permissions } = req.body

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' })
    }

    const validation = await adminPermissionService.validatePermissions(permissions)
    res.json({ success: true, data: validation })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/permissions/check/:permission', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { permission } = req.params
    const hasPermission = await adminPermissionService.userHasPermission(req.admin!.adminId, permission)
    res.json({ success: true, data: { hasPermission } })
  } catch (error) {
    res.status(500).json({ error: 'Failed to check permission' })
  }
})

// User Management Routes (Admin Users)
router.post('/users', requirePermission('admin'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const userData = {
      ...req.body,
      passwordHash: await bcrypt.hash(req.body.password, 12),
      createdBy: req.admin!.adminId,
      lastModifiedBy: req.admin!.adminId
    }
    delete userData.password // Remove plain password

    const user = await adminPermissionService.createAdminUser(userData)
    res.status(201).json({ success: true, data: user })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/users/:adminId', requirePermission('admin'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { adminId } = req.params
    const updates = { ...req.body }

    // Hash password if provided
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 12)
      delete updates.password
    }

    // 添加最後修改者
    updates.lastModifiedBy = req.admin!.adminId

    const user = await adminPermissionService.updateAdminUser(adminId, updates)
    res.json({ success: true, data: user })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Audit Routes
router.get('/audit/logs', requirePermission('admin'), adminAuth, async (req, res) => {
  try {
    const { adminId, targetType, startDate, endDate, limit } = req.query

    // 簡單實現，返回空數組
    // 在實際實現中，這裡應該查詢審計日誌
    const logs = []
    
    res.json({ success: true, data: logs })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
})

// Events Management Routes (Admin-specific)
router.get('/events', requirePermission('events'), adminAuth, async (req, res) => {
  try {
    console.log('🔍 Admin events endpoint called')
    // Import event model here to avoid circular dependencies
    const { EventModel } = require('../models/Event')
    console.log('✅ EventModel imported successfully')
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventModel = new EventModel(databases.events)

    const { status, limit, offset } = req.query
    const filters: any = {}

    if (status) filters.status = status

    const page = offset ? Math.floor(parseInt(offset as string) / (limit ? parseInt(limit as string) : 10)) + 1 : 1
    const pageLimit = limit ? parseInt(limit as string) : 10
    const eventsResult = await eventModel.findAll(page, pageLimit)

    if (!eventsResult.success) {
      return res.status(500).json({ error: eventsResult.error })
    }

    res.json({ success: true, data: eventsResult.data })
  } catch (error) {
    console.error('Admin events fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

router.get('/events/:id', requirePermission('events'), adminAuth, async (req, res) => {
  try {
    const { EventModel } = require('../models/Event')
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventModel = new EventModel(databases.events)

    const eventResult = await eventModel.findById(req.params.id)
    if (!eventResult.success || !eventResult.data) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json({ success: true, data: eventResult.data })
  } catch (error) {
    console.error('Admin event fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch event' })
  }
})

router.post('/events', requirePermission('events'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    console.log('🔍 Admin create event endpoint called')
    const { EventModel } = require('../models/Event')
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventModel = new EventModel(databases.events)

    // Add creator information
    const eventData = {
      ...req.body,
      createdBy: req.admin!.adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('📝 Creating event with data:', eventData)
    const eventResult = await eventModel.create(eventData)

    if (!eventResult.success) {
      return res.status(400).json({ error: eventResult.error })
    }

    res.status(201).json({ success: true, data: eventResult.data })
  } catch (error) {
    console.error('Admin event creation error:', error)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

router.put('/events/:id', requirePermission('events'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { EventModel } = require('../models/Event')
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventModel = new EventModel(databases.events)

    const eventResult = await eventModel.update(req.params.id, req.body)

    if (!eventResult.success || !eventResult.data) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json({ success: true, data: eventResult.data })
  } catch (error) {
    console.error('Admin event update error:', error)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

router.put('/events/:id/status', requirePermission('events'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { EventModel } = require('../models/Event')
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventModel = new EventModel(databases.events)

    const { status } = req.body
    const validStatuses = ['draft', 'published', 'cancelled', 'ready']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const eventResult = await eventModel.updateStatus(req.params.id, status)

    if (!eventResult.success || !eventResult.data) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json({ success: true, data: eventResult.data })
  } catch (error) {
    console.error('Admin event status update error:', error)
    res.status(500).json({ error: 'Failed to update event status' })
  }
})

router.delete('/events/:id', requirePermission('events'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { EventModel } = require('../models/Event')
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventModel = new EventModel(databases.events)

    const success = await eventModel.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json({ success: true, message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Admin event delete error:', error)
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

// System Statistics
router.get('/system/stats', requirePermission('system'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const databases = NeDBSetup.getInstance().getDatabases()

    // Get collection counts
    const collections = [
      'users', 'events', 'bookings', 'appointments_slots', 'appointment_bookings'
    ]

    const stats = {}
    for (const collectionName of collections) {
      try {
        const count = await new Promise<number>((resolve, reject) => {
          databases[collectionName].count({}, (err, count) => {
            if (err) reject(err)
            else resolve(count)
          })
        })
        stats[collectionName] = count
      } catch (error) {
        stats[collectionName] = 0
      }
    }

    // Calculate derived statistics
    const totalUsers = stats['users'] || 0
    const totalEvents = stats['events'] || 0
    const totalBookings = stats['bookings'] || 0
    const totalAppointmentSlots = stats['appointments_slots'] || 0
    const totalAppointmentBookings = stats['appointment_bookings'] || 0

    // Estimate active users (users who have bookings or recent activity)
    const activeUsers = Math.max(Math.floor(totalUsers * 0.7), totalBookings > 0 ? Math.min(totalBookings, totalUsers) : 0)

    // Estimate upcoming events (assume 30% are upcoming)
    const upcomingEvents = Math.floor(totalEvents * 0.3)

    const systemStats = {
      totalUsers,
      activeUsers,
      totalEvents,
      upcomingEvents,
      totalBookings,
      totalAppointmentSlots,
      totalAppointmentBookings,
      systemHealth: 'healthy' as const,
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    }

    res.json(systemStats)
  } catch (error) {
    console.error('System stats error:', error)
    res.status(500).json({ error: 'Failed to fetch system statistics' })
  }
})

// Development Setup Endpoint (creates default admin users)
router.post('/setup', async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Setup endpoint not available in production' })
    }

    // Check if admin users already exist
    const db = NeDBSetup.getInstance().getDatabases()
    
    const existingAdmins = await new Promise<any[]>((resolve, reject) => {
      db.admin_users.find({}, (err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    if (existingAdmins.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Admin users already exist',
        count: existingAdmins.length
      })
    }

    // Create default admin users
    const defaultAdmins = [
      {
        adminId: 'super-admin-001',
        username: 'superadmin',
        email: 'superadmin@infinitymatch.tw',
        passwordHash: await bcrypt.hash('SuperAdmin2025!', 10),
        profile: {
          realName: '張執行長',
          employeeId: 'CEO-001',
          department: 'executive' as const,
          joinDate: new Date()
        },
        roleId: 'super_admin',
        status: 'active' as const,
        twoFactorEnabled: false,
        sessionTimeout: 480,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system'
      },
      {
        adminId: 'admin-infinitymatch-001',
        username: 'admin',
        email: 'admin@infinitymatch.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        profile: {
          realName: '系統管理員',
          employeeId: 'ADM-001',
          department: 'technical' as const,
          joinDate: new Date()
        },
        roleId: 'system_admin',
        status: 'active' as const,
        twoFactorEnabled: false,
        sessionTimeout: 480,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system'
      }
    ]

    // Insert admin users
    for (const admin of defaultAdmins) {
      await new Promise<void>((resolve, reject) => {
        db.admin_users.insert(admin, (err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }

    res.json({
      success: true,
      message: 'Default admin users created successfully',
      admins: defaultAdmins.map(admin => ({
        email: admin.email,
        username: admin.username,
        department: admin.profile.department
      }))
    })

  } catch (error) {
    console.error('Setup error:', error)
    res.status(500).json({ error: 'Failed to setup admin users' })
  }
})

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is healthy',
    timestamp: new Date().toISOString(),
    service: 'admin-permission-system'
  })
})

// Debug endpoint to check admin permissions
router.get('/debug/permissions', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const adminId = req.admin.adminId
    
    // Get admin user
    const user = await adminPermissionService.getAdminUser(adminId)
    if (!user) {
      return res.status(404).json({ error: 'Admin user not found' })
    }
    
    // Get admin role
    const role = await adminPermissionService.getRole(user.roleId)
    
    // Check specific permissions
    const permissionsToCheck = [
      'events:view',
      'events:create',
      'events:edit',
      'events:showcase',
      'interviews:view',
      'appointments:view',
      'admin:permissions',
      'admin:create',
      'admin:audit'
    ]
    
    const permissionResults = {}
    for (const permission of permissionsToCheck) {
      permissionResults[permission] = await adminPermissionService.userHasPermission(adminId, permission)
    }
    
    res.json({
      success: true,
      data: {
        adminId: user.adminId,
        username: user.username,
        email: user.email,
        status: user.status,
        directPermissions: user.permissions || [],
        rolePermissions: role ? role.permissions : [],
        customPermissions: user.customPermissions || [],
        permissionChecks: permissionResults
      }
    })
  } catch (error) {
    console.error('Error checking admin permissions:', error)
    res.status(500).json({ error: 'Failed to check admin permissions' })
  }
})

// Events endpoints (duplicate - should be removed or consolidated)
router.get('/events-duplicate', requirePermission('events'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    // Get events from database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    const events = await new Promise<any[]>((resolve, reject) => {
      db.events.find({}, (err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
    
    res.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('Error getting events:', error)
    res.status(500).json({ error: 'Failed to get events' })
  }
})

// Get single event (duplicate - should be removed or consolidated)
router.get('/events-duplicate/:id', requirePermission('events'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const eventId = req.params.id
    
    // Get event from database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    const event = await new Promise<any>((resolve, reject) => {
      db.events.findOne({ _id: eventId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    res.json({
      success: true,
      data: event
    })
  } catch (error) {
    console.error('Error getting event:', error)
    res.status(500).json({ error: 'Failed to get event' })
  }
})

// Update event status (duplicate - should be removed or consolidated)
router.put('/events-duplicate/:id/status', requirePermission('events'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const eventId = req.params.id
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }
    
    // Validate status
    const validStatuses = ['draft', 'published', 'full', 'suspended', 'ready', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    
    // Get event from database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    // Find the event
    const event = await new Promise<any>((resolve, reject) => {
      db.events.findOne({ _id: eventId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    // Validate status transition
    const currentStatus = event.status || 'draft'
    const validTransitions = {
      draft: ['published', 'cancelled'],
      published: ['full', 'ready', 'suspended', 'cancelled'],
      full: ['ready', 'published', 'cancelled'],
      suspended: ['published', 'cancelled'],
      ready: ['cancelled'],
      cancelled: []
    }
    
    if (status !== currentStatus && !validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${currentStatus} to ${status}`,
        validTransitions: validTransitions[currentStatus]
      })
    }
    
    // Update event status
    await new Promise<void>((resolve, reject) => {
      db.events.update(
        { _id: eventId },
        { 
          $set: { 
            status,
            updatedAt: new Date(),
            statusHistory: [
              ...(event.statusHistory || []),
              {
                from: currentStatus,
                to: status,
                timestamp: new Date(),
                updatedBy: req.admin.adminId
              }
            ]
          } 
        },
        {},
        (err: any) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
    
    res.json({
      success: true,
      message: `Event status updated from ${currentStatus} to ${status}`,
      data: {
        eventId,
        previousStatus: currentStatus,
        currentStatus: status
      }
    })
  } catch (error) {
    console.error('Error updating event status:', error)
    res.status(500).json({ error: 'Failed to update event status' })
  }
})

// Interviews endpoints
router.get('/interviews', requirePermission('interviews'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    // Get interviews from database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    const interviews = await new Promise<any[]>((resolve, reject) => {
      db.interviewers.find({}, (err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
    
    res.json({
      success: true,
      data: interviews
    })
  } catch (error) {
    console.error('Error getting interviews:', error)
    res.status(500).json({ error: 'Failed to get interviews' })
  }
})

// Appointments endpoints
router.get('/appointments', requirePermission('appointments'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    // Get appointments from database
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    const appointments = await new Promise<any[]>((resolve, reject) => {
      db.appointment_bookings.find({}, (err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
    
    res.json({
      success: true,
      data: appointments
    })
  } catch (error) {
    console.error('Error getting appointments:', error)
    res.status(500).json({ error: 'Failed to get appointments' })
  }
})

export default router