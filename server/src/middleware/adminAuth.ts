import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AdminPermissionServiceDB } from '../services/AdminPermissionServiceDB'
import NeDBSetup from '../db/nedb-setup'

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_jwt_secret_key_should_be_secure'

// 擴展 Request 類型以包含管理員信息
export interface AdminRequest extends Request {
  admin?: any
  requiredPermission?: string
}

// 初始化權限服務
const adminPermissionService = new AdminPermissionServiceDB()

// 管理員身份驗證中間件 - Real-time database lookups for security
export const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: '拒絕訪問。未提供令牌。' })
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any

    // Get fresh admin data from database (don't trust JWT claims)
    const dbSetup = NeDBSetup.getInstance()
    const db = dbSetup.getDatabases()
    
    const adminUser = await new Promise<any>((resolve, reject) => {
      db.admin_users.findOne({ adminId: decoded.adminId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (!adminUser) {
      return res.status(401).json({ error: '管理員用戶未找到。' })
    }

    if (adminUser.status !== 'active') {
      return res.status(403).json({ error: '管理員帳戶已暫停或非活躍狀態。' })
    }

    // Check if this is a level 1 admin using REAL database data
    const isTopLevelAdmin = adminUser.level === 1

    // Level 1 admins bypass ALL permission checks
    if (!isTopLevelAdmin && req.requiredPermission) {
      const hasPermission = await adminPermissionService.userHasPermission(decoded.adminId, req.requiredPermission)

      if (!hasPermission) {
        return res.status(403).json({ error: '拒絕訪問。權限不足。' })
      }
    }

    // Add both JWT and database data to request
    req.admin = {
      ...decoded,
      level: adminUser.level,  // Real database level
      type: adminUser.type,    // Real database type
      status: adminUser.status // Real database status
    }

    next()
  } catch (error) {
    res.status(401).json({ error: '無效的令牌。' })
  }
}

// 權限要求中間件 - 只需要功能名稱，不需要具體操作
export const requirePermission = (permission: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    // 從權限字符串中提取功能名稱（例如 'events:view' -> 'events'）
    const functionName = permission.split(':')[0]
    // 設置為功能級別權限
    req.requiredPermission = functionName
    next()
  }
}
