// Admin Routes
// API endpoints for admin authentication and permission management
import express, { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AdminPermissionServiceDB } from '../services/AdminPermissionServiceDB'
import { AdminUser } from '../models/AdminPermission'

// Extend Express Request type for admin authentication
interface AdminRequest extends Request {
  admin?: {
    adminId: string
    username: string
    roleId: string
    department: string
  }
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
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Look up admin user from database by email
    let adminUser: AdminUser | null
    try {
      adminUser = await adminPermissionService.getAdminUserByEmail(email)
    } catch (error) {
      console.error('Error looking up admin user:', error)
      return res.status(500).json({ error: 'Server error during authentication' })
    }

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if admin is active
    if (adminUser.status !== 'active') {
      return res.status(403).json({ error: 'Admin account is suspended or inactive' })
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        adminId: adminUser.adminId,
        username: adminUser.username,
        roleId: adminUser.roleId,
        department: adminUser.profile.department
      },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES_IN }
    )

    const refreshToken = jwt.sign(
      { adminId: adminUser.adminId },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_REFRESH_EXPIRES_IN }
    )

    // Update last login
    adminUser.profile.lastLogin = new Date()

    const permissions = await adminPermissionService.getUserPermissions(adminUser.adminId)

    res.json({
      success: true,
      data: {
        admin: {
          adminId: adminUser.adminId,
          username: adminUser.username,
          email: adminUser.email,
          profile: adminUser.profile,
          roleId: adminUser.roleId,
          department: adminUser.profile.department,
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
    const permissions = await adminPermissionService.getUserPermissions(admin.adminId)

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
router.get('/permissions/atoms', requirePermission('admin:audit'), adminAuth, async (req, res) => {
  try {
    const atoms = await adminPermissionService.getAllPermissionAtoms()
    res.json({ success: true, data: atoms })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permission atoms' })
  }
})

router.get('/permissions/atoms/grouped', requirePermission('admin:audit'), adminAuth, async (req, res) => {
  try {
    const grouped = await adminPermissionService.getPermissionsByGroup()
    res.json({ success: true, data: grouped })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch grouped permissions' })
  }
})

router.post('/permissions/atoms', requirePermission('admin:permissions'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const atomData = { ...req.body, createdBy: req.admin!.adminId }
    const atom = await adminPermissionService.createPermissionAtom(atomData)
    res.status(201).json({ success: true, data: atom })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Role Management Routes
router.get('/roles', requirePermission('admin:audit'), adminAuth, async (req, res) => {
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

router.post('/roles', requirePermission('admin:permissions'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const roleData = { ...req.body, createdBy: req.admin!.adminId, lastModifiedBy: req.admin!.adminId }
    const role = await adminPermissionService.createRole(roleData)
    res.status(201).json({ success: true, data: role })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/roles/:roleId', requirePermission('admin:permissions'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { roleId } = req.params
    const updates = req.body
    const role = await adminPermissionService.updateRole(roleId, updates, req.admin!.adminId)
    res.json({ success: true, data: role })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/roles/:roleId/capabilities', requirePermission('admin:audit'), adminAuth, async (req, res) => {
  try {
    const { roleId } = req.params
    const capabilities = await adminPermissionService.getRoleCapabilities(roleId)
    res.json({ success: true, data: capabilities })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Permission Validation Routes
router.post('/permissions/validate', requirePermission('admin:audit'), adminAuth, async (req, res) => {
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
router.post('/users', requirePermission('admin:create'), adminAuth, async (req: AdminRequest, res: Response) => {
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

router.put('/users/:adminId', requirePermission('admin:edit'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { adminId } = req.params
    const updates = { ...req.body }

    // Hash password if provided
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 12)
      delete updates.password
    }

    const user = await adminPermissionService.updateAdminUser(adminId, updates, req.admin!.adminId)
    res.json({ success: true, data: user })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Audit Routes
router.get('/audit/logs', requirePermission('admin:audit'), adminAuth, async (req, res) => {
  try {
    const { adminId, targetType, startDate, endDate, limit } = req.query

    const filters: any = {}
    if (adminId) filters.adminId = adminId
    if (targetType) filters.targetType = targetType
    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)
    if (limit) filters.limit = parseInt(limit as string)

    const logs = await adminPermissionService.getAuditLogs(filters)
    res.json({ success: true, data: logs })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
})

// Events Management Routes (Admin-specific)
router.get('/events', requirePermission('admin:audit'), adminAuth, async (req, res) => {
  try {
    // Import event model here to avoid circular dependencies
    const { EventModel } = await import('../models/Event')
    const NeDBSetup = (await import('../db/nedb-setup')).default
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

router.get('/events/:id', requirePermission('admin:audit'), adminAuth, async (req, res) => {
  try {
    const { EventModel } = await import('../models/Event')
    const NeDBSetup = (await import('../db/nedb-setup')).default
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

router.put('/events/:id/status', requirePermission('admin:edit'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { EventModel } = await import('../models/Event')
    const NeDBSetup = (await import('../db/nedb-setup')).default
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventModel = new EventModel(databases.events)

    const { status } = req.body
    const validStatuses = ['draft', 'published', 'cancelled', 'completed']

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

router.delete('/events/:id', requirePermission('admin:delete'), adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { EventModel } = await import('../models/Event')
    const NeDBSetup = (await import('../db/nedb-setup')).default
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

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is healthy',
    timestamp: new Date().toISOString(),
    service: 'admin-permission-system'
  })
})

export default router