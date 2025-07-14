// Admin Permission Model
// Defines atomic permissions and role configurations for the admin system
import { v4 as uuidv4 } from 'uuid'

export interface PermissionAtom {
  _id?: string
  createdAt: Date
  updatedAt: Date
  
  // Permission Identity
  atomId: string // e.g., "users:view", "content:moderate"
  group: string  // e.g., "users", "content", "system"
  action: string // e.g., "view", "edit", "delete"
  
  // Permission Details
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  
  // Constraints
  conflictsWith?: string[] // Array of permission atomIds that conflict
  requiresAll?: string[]   // Array of permission atomIds that are required
  deprecatedAt?: Date
  
  // Metadata
  version: string
  createdBy: string // Admin ID who created this permission
}

export interface AdminRole {
  _id?: string
  createdAt: Date
  updatedAt: Date
  
  // Role Identity
  roleId: string // e.g., "super_admin", "system_admin"
  name: string
  department: 'executive' | 'technical' | 'operations' | 'members'
  
  // Permissions
  permissions: string[] // Array of permission atomIds
  isCustom: boolean     // true for custom roles, false for system defaults
  
  // Configuration
  description: string
  maxUsers?: number     // Maximum users allowed for this role
  isActive: boolean
  
  // Metadata
  version: string
  createdBy: string
  lastModifiedBy: string
}

export interface AdminUser {
  _id?: string
  createdAt: Date
  updatedAt: Date
  
  // Identity
  adminId: string
  username: string
  email: string
  passwordHash: string
  
  // Profile
  profile: {
    realName: string
    employeeId: string
    department: 'executive' | 'technical' | 'operations' | 'members'
    joinDate: Date
    lastLogin?: Date
  }
  
  // Role and Permissions
  roleId: string        // Reference to AdminRole
  customPermissions?: string[] // Additional permissions beyond role
  
  // Status
  status: 'active' | 'suspended' | 'inactive'
  
  // Security
  twoFactorEnabled: boolean
  ipWhitelist?: string[]
  sessionTimeout: number // in minutes
  
  // Metadata
  createdBy: string
  lastModifiedBy: string
}

export interface PermissionAuditLog {
  _id?: string
  timestamp: Date
  
  // Operation Details
  adminId: string
  action: 'grant' | 'revoke' | 'modify' | 'create_role' | 'delete_role'
  targetType: 'user' | 'role' | 'permission'
  targetId: string
  
  // Changes
  changes: {
    before?: any
    after?: any
    permissionsAdded?: string[]
    permissionsRemoved?: string[]
  }
  
  // Context
  reason?: string
  ipAddress: string
  userAgent: string
  
  // Result
  success: boolean
  errorMessage?: string
}

// Default permission atoms based on our admin architecture
export const DEFAULT_PERMISSION_ATOMS: Omit<PermissionAtom, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  // User Management Permissions
  {
    atomId: 'users:view',
    group: 'users',
    action: 'view',
    name: '查看用戶',
    description: '查看用戶列表和基本資料',
    riskLevel: 'low',
    version: '1.0'
  },
  {
    atomId: 'users:edit',
    group: 'users', 
    action: 'edit',
    name: '編輯用戶',
    description: '編輯用戶個人資料',
    riskLevel: 'medium',
    requiresAll: ['users:view'],
    version: '1.0'
  },
  {
    atomId: 'users:status',
    group: 'users',
    action: 'status',
    name: '修改用戶狀態',
    description: '修改用戶帳號狀態',
    riskLevel: 'high',
    requiresAll: ['users:view'],
    version: '1.0'
  },
  {
    atomId: 'users:suspend',
    group: 'users',
    action: 'suspend',
    name: '暫停用戶',
    description: '暫停用戶帳號',
    riskLevel: 'high',
    requiresAll: ['users:view', 'users:status'],
    version: '1.0'
  },
  {
    atomId: 'users:delete',
    group: 'users',
    action: 'delete',
    name: '刪除用戶',
    description: '刪除用戶帳號',
    riskLevel: 'critical',
    requiresAll: ['users:view', 'users:status'],
    version: '1.0'
  },
  {
    atomId: 'users:export',
    group: 'users',
    action: 'export',
    name: '匯出用戶數據',
    description: '匯出用戶數據',
    riskLevel: 'high',
    requiresAll: ['users:view'],
    version: '1.0'
  },
  
  // Content Management Permissions
  {
    atomId: 'content:view',
    group: 'content',
    action: 'view',
    name: '查看內容',
    description: '查看所有內容',
    riskLevel: 'low',
    version: '1.0'
  },
  {
    atomId: 'content:moderate',
    group: 'content',
    action: 'moderate',
    name: '審核內容',
    description: '審核內容(通過/拒絕)',
    riskLevel: 'medium',
    requiresAll: ['content:view'],
    version: '1.0'
  },
  {
    atomId: 'content:edit',
    group: 'content',
    action: 'edit',
    name: '編輯內容',
    description: '編輯內容',
    riskLevel: 'medium',
    requiresAll: ['content:view'],
    version: '1.0'
  },
  {
    atomId: 'content:delete',
    group: 'content',
    action: 'delete',
    name: '刪除內容',
    description: '刪除內容',
    riskLevel: 'high',
    requiresAll: ['content:view'],
    version: '1.0'
  },
  {
    atomId: 'content:feature',
    group: 'content',
    action: 'feature',
    name: '設定精選內容',
    description: '設定精選內容',
    riskLevel: 'medium',
    requiresAll: ['content:view'],
    version: '1.0'
  },
  {
    atomId: 'content:bulk_action',
    group: 'content',
    action: 'bulk_action',
    name: '批量內容操作',
    description: '批量內容操作',
    riskLevel: 'high',
    requiresAll: ['content:view', 'content:moderate'],
    version: '1.0'
  },
  
  // Events Management Permissions
  {
    atomId: 'events:view',
    group: 'events',
    action: 'view',
    name: '查看活動',
    description: '查看活動列表',
    riskLevel: 'low',
    version: '1.0'
  },
  {
    atomId: 'events:create',
    group: 'events',
    action: 'create',
    name: '創建活動',
    description: '創建新活動',
    riskLevel: 'medium',
    requiresAll: ['events:view'],
    version: '1.0'
  },
  {
    atomId: 'events:edit',
    group: 'events',
    action: 'edit',
    name: '編輯活動',
    description: '編輯活動資訊',
    riskLevel: 'medium',
    requiresAll: ['events:view'],
    version: '1.0'
  },
  {
    atomId: 'events:delete',
    group: 'events',
    action: 'delete',
    name: '刪除活動',
    description: '刪除活動',
    riskLevel: 'high',
    requiresAll: ['events:view'],
    version: '1.0'
  },
  {
    atomId: 'events:participants',
    group: 'events',
    action: 'participants',
    name: '管理活動參與者',
    description: '管理活動參與者',
    riskLevel: 'medium',
    requiresAll: ['events:view'],
    version: '1.0'
  },
  {
    atomId: 'events:showcase',
    group: 'events',
    action: 'showcase',
    name: '管理精彩活動集',
    description: '管理精彩活動集',
    riskLevel: 'medium',
    requiresAll: ['events:view'],
    version: '1.0'
  },
  
  // Interview Management Permissions
  {
    atomId: 'interviews:view',
    group: 'interviews',
    action: 'view',
    name: '查看面試',
    description: '查看面試安排',
    riskLevel: 'low',
    version: '1.0'
  },
  {
    atomId: 'interviews:schedule',
    group: 'interviews',
    action: 'schedule',
    name: '安排面試',
    description: '安排面試時間',
    riskLevel: 'medium',
    requiresAll: ['interviews:view'],
    version: '1.0'
  },
  {
    atomId: 'interviews:conduct',
    group: 'interviews',
    action: 'conduct',
    name: '進行面試',
    description: '進行面試',
    riskLevel: 'medium',
    requiresAll: ['interviews:view'],
    version: '1.0'
  },
  {
    atomId: 'interviews:review',
    group: 'interviews',
    action: 'review',
    name: '審核面試結果',
    description: '審核面試結果',
    riskLevel: 'high',
    requiresAll: ['interviews:view', 'interviews:conduct'],
    version: '1.0'
  },
  {
    atomId: 'interviews:reschedule',
    group: 'interviews',
    action: 'reschedule',
    name: '重新安排面試',
    description: '重新安排面試',
    riskLevel: 'medium',
    requiresAll: ['interviews:view'],
    version: '1.0'
  },
  {
    atomId: 'interviews:cancel',
    group: 'interviews',
    action: 'cancel',
    name: '取消面試',
    description: '取消面試',
    riskLevel: 'high',
    requiresAll: ['interviews:view'],
    version: '1.0'
  },
  
  // System Management Permissions
  {
    atomId: 'system:monitoring',
    group: 'system',
    action: 'monitoring',
    name: '系統監控',
    description: '系統監控儀表板',
    riskLevel: 'low',
    conflictsWith: ['content:moderate', 'interviews:conduct'],
    version: '1.0'
  },
  {
    atomId: 'system:config',
    group: 'system',
    action: 'config',
    name: '系統配置',
    description: '系統參數配置',
    riskLevel: 'critical',
    conflictsWith: ['content:moderate', 'interviews:conduct'],
    requiresAll: ['system:monitoring'],
    version: '1.0'
  },
  {
    atomId: 'system:backup',
    group: 'system',
    action: 'backup',
    name: '數據備份',
    description: '數據備份操作',
    riskLevel: 'high',
    requiresAll: ['system:monitoring'],
    version: '1.0'
  },
  {
    atomId: 'system:maintenance',
    group: 'system',
    action: 'maintenance',
    name: '系統維護',
    description: '系統維護模式',
    riskLevel: 'critical',
    conflictsWith: ['payments:refund'],
    requiresAll: ['system:monitoring', 'system:config'],
    version: '1.0'
  },
  {
    atomId: 'system:logs',
    group: 'system',
    action: 'logs',
    name: '系統日誌',
    description: '系統日誌查看',
    riskLevel: 'medium',
    requiresAll: ['system:monitoring'],
    version: '1.0'
  },
  {
    atomId: 'system:security',
    group: 'system',
    action: 'security',
    name: '安全設定',
    description: '安全設定管理',
    riskLevel: 'critical',
    requiresAll: ['system:monitoring', 'system:config'],
    version: '1.0'
  },
  
  // Payment Management Permissions
  {
    atomId: 'payments:view',
    group: 'payments',
    action: 'view',
    name: '查看付款',
    description: '查看付款記錄',
    riskLevel: 'medium',
    version: '1.0'
  },
  {
    atomId: 'payments:process',
    group: 'payments',
    action: 'process',
    name: '處理付款',
    description: '處理付款問題',
    riskLevel: 'high',
    requiresAll: ['payments:view'],
    version: '1.0'
  },
  {
    atomId: 'payments:refund',
    group: 'payments',
    action: 'refund',
    name: '退款操作',
    description: '退款操作',
    riskLevel: 'critical',
    conflictsWith: ['system:maintenance'],
    requiresAll: ['payments:view', 'payments:process'],
    version: '1.0'
  },
  {
    atomId: 'payments:reports',
    group: 'payments',
    action: 'reports',
    name: '財務報表',
    description: '財務報表查看',
    riskLevel: 'high',
    requiresAll: ['payments:view'],
    version: '1.0'
  },
  
  // VVIP Services Permissions
  {
    atomId: 'vvip:intro_management',
    group: 'vvip',
    action: 'intro_management',
    name: 'VVIP介紹管理',
    description: 'VVIP介紹服務管理',
    riskLevel: 'medium',
    version: '1.0'
  },
  {
    atomId: 'vvip:exclusive_events',
    group: 'vvip',
    action: 'exclusive_events',
    name: 'VVIP專屬活動',
    description: 'VVIP專屬活動',
    riskLevel: 'medium',
    version: '1.0'
  },
  {
    atomId: 'vvip:consultation',
    group: 'vvip',
    action: 'consultation',
    name: 'VVIP諮詢服務',
    description: 'VVIP諮詢服務',
    riskLevel: 'medium',
    version: '1.0'
  },
  {
    atomId: 'vvip:priority_support',
    group: 'vvip',
    action: 'priority_support',
    name: 'VVIP優先客服',
    description: 'VVIP優先客服',
    riskLevel: 'medium',
    version: '1.0'
  },
  
  // Admin Management Permissions (Super Admin Only)
  {
    atomId: 'admin:create',
    group: 'admin',
    action: 'create',
    name: '創建管理員',
    description: '創建管理員帳號',
    riskLevel: 'critical',
    version: '1.0'
  },
  {
    atomId: 'admin:edit',
    group: 'admin',
    action: 'edit',
    name: '編輯管理員',
    description: '編輯管理員資料',
    riskLevel: 'critical',
    requiresAll: ['admin:create'],
    version: '1.0'
  },
  {
    atomId: 'admin:permissions',
    group: 'admin',
    action: 'permissions',
    name: '分配管理員權限',
    description: '分配管理員權限',
    riskLevel: 'critical',
    requiresAll: ['admin:create'],
    version: '1.0'
  },
  {
    atomId: 'admin:suspend',
    group: 'admin',
    action: 'suspend',
    name: '暫停管理員',
    description: '暫停管理員帳號',
    riskLevel: 'critical',
    requiresAll: ['admin:create'],
    version: '1.0'
  },
  {
    atomId: 'admin:audit',
    group: 'admin',
    action: 'audit',
    name: '查看操作審計',
    description: '查看操作審計日誌',
    riskLevel: 'medium',
    version: '1.0'
  }
]

// Default role configurations
export const DEFAULT_ADMIN_ROLES: Omit<AdminRole, '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>[] = [
  {
    roleId: 'super_admin',
    name: '總管理',
    department: 'executive',
    permissions: ['*'], // All permissions
    isCustom: false,
    description: '總管理者，最高決策層，擁有所有權限',
    isActive: true,
    version: '1.0'
  },
  {
    roleId: 'system_admin',
    name: '系統管理',
    department: 'technical',
    permissions: [
      'system:monitoring',
      'system:config', 
      'system:backup',
      'system:maintenance',
      'system:logs',
      'system:security',
      'users:view',
      'admin:audit'
    ],
    isCustom: false,
    description: '系統管理者，技術維護和系統運營專家',
    isActive: true,
    version: '1.0'
  },
  {
    roleId: 'operation_admin',
    name: '營運管理',
    department: 'operations',
    permissions: [
      'content:view',
      'content:moderate',
      'content:edit',
      'content:feature',
      'events:view',
      'events:create',
      'events:edit',
      'events:participants',
      'events:showcase',
      'users:view',
      'users:edit',
      'users:status'
    ],
    isCustom: false,
    description: '營運管理者，內容營運和一般用戶管理專家',
    isActive: true,
    version: '1.0'
  },
  {
    roleId: 'premium_admin',
    name: '付費用戶管理者',
    department: 'members',
    permissions: [
      'interviews:view',
      'interviews:schedule',
      'interviews:conduct',
      'interviews:review',
      'interviews:reschedule',
      'payments:view',
      'payments:process',
      'vvip:intro_management',
      'vvip:consultation',
      'vvip:priority_support',
      'users:view'
    ],
    isCustom: false,
    description: '付費用戶管理者，VIP/VVIP會員專屬服務專家',
    isActive: true,
    version: '1.0'
  }
]