// Admin Models

export interface AdminUser {
  _id?: string
  createdAt: Date
  updatedAt: Date

  // 身份
  adminId: string
  username: string
  email: string
  passwordHash: string

  // 個人資料
  profile?: {
    realName?: string
    employeeId?: string
    department?: 'executive' | 'technical' | 'operations' | 'members' | 'system'
    joinDate?: Date
    lastLogin?: Date
  }

  // 部門（直接屬性）
  department?: string

  // 角色和權限
  roleId: string        // 引用 AdminRole
  customPermissions?: string[] // 超出角色的額外權限
  permissions?: string[] // 直接權限
  
  // 狀態
  status: 'active' | 'suspended' | 'inactive'

  // 安全
  twoFactorEnabled: boolean
  ipWhitelist?: string[]
  sessionTimeout: number // 分鐘
}

export interface AdminRole {
  _id?: string
  createdAt: Date
  updatedAt: Date

  // 角色身份
  roleId: string // 例如："super_admin", "system_admin"
  name: string
  department: 'executive' | 'technical' | 'operations' | 'members' | 'system'

  // 權限
  permissions: string[] // 功能級別權限數組
  isCustom: boolean     // 自定義角色為 true，系統默認為 false

  // 配置
  description: string
  maxUsers?: number     // 此角色允許的最大用戶數
  isActive: boolean

  // 元數據
  version: string
  createdBy: string
  lastModifiedBy: string
}

export interface PermissionAtom {
  _id?: string
  createdAt: Date
  updatedAt: Date

  // 權限身份
  atomId: string // 例如："users:view", "content:moderate"
  group: string  // 例如："users", "content", "system"
  action: string // 例如："view", "edit", "delete"

  // 權限詳情
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'

  // 約束
  conflictsWith?: string[] // 衝突的權限原子 ID 數組
  requiresAll?: string[]   // 必需的權限原子 ID 數組
  deprecatedAt?: Date

  // 元數據
  version: string
  createdBy: string // 創建此權限的管理員 ID
}
