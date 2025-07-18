import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AdminPermissionServiceDB } from '../services/AdminPermissionServiceDB'

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_jwt_secret_key_should_be_secure'

// 擴展 Request 類型以包含管理員信息
export interface AdminRequest extends Request {
  admin?: any
  requiredPermission?: string
}

// 初始化權限服務
const adminPermissionService = new AdminPermissionServiceDB()

// 管理員身份驗證中間件
export const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: '拒絕訪問。未提供令牌。' })
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any

    // Check if this is a top-level admin based on admin type (bypass all permission checks)
    const isTopLevelAdmin = decoded.type === 'super_admin' || 
                           decoded.type === 'system_admin'

    console.log('🔍 Admin auth check:', { 
      username: decoded.username, 
      type: decoded.type,
      isTopLevelAdmin,
      requiredPermission: req.requiredPermission 
    })

    // 如果是頂級管理員類型，跳過所有權限檢查
    if (!isTopLevelAdmin && req.requiredPermission) {
      const hasPermission = await adminPermissionService.userHasPermission(decoded.adminId, req.requiredPermission)

      if (!hasPermission) {
        return res.status(403).json({ error: '拒絕訪問。權限不足。' })
      }
    }

    req.admin = decoded
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
