# InfinityMatch 管理系統文檔

## 管理系統概述

InfinityMatch 管理系統是一個完整的後台管理解決方案，提供活動管理、會員面試管理、諮詢預約管理、權限管理等功能。系統採用基於角色的訪問控制（RBAC）模型，確保不同級別的管理員擁有適當的權限。

## 管理員身份驗證

### 登入流程

1. 管理員通過 `/api/admin/auth/login` 端點進行身份驗證
2. 系統驗證電子郵件和密碼
3. 成功後，系統生成 JWT 訪問令牌和刷新令牌
4. 令牌包含管理員 ID、用戶名、角色 ID 和部門等信息
5. 前端將令牌存儲在 localStorage 中，用於後續請求

### JWT 令牌配置

```javascript
// JWT 配置
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_jwt_secret_key_should_be_secure'
const ADMIN_JWT_EXPIRES_IN = '8h'
const ADMIN_REFRESH_EXPIRES_IN = '24h'
```

### 令牌刷新

系統支持令牌刷新機制，當訪問令牌過期時，可以使用刷新令牌獲取新的訪問令牌，無需重新登入。

## 權限管理系統

### 權限模型

系統採用**功能級別權限模型**，而非操作級別權限模型。每個權限代表一個功能模塊的訪問權限，而不是具體的操作權限。

**重要規則**：當管理員被授予某個功能的權限時，他們可以執行該功能下的所有操作，無需額外授權。例如，如果管理員被授予「活動管理」權限，則他們可以查看、創建、編輯、刪除活動，以及管理活動狀態等所有活動相關操作。

### 功能級別權限

系統定義了以下主要功能模塊：

1. **系統管理 (system)**：系統監控、配置、備份等
2. **用戶管理 (users)**：管理用戶資料、狀態等
3. **活動管理 (events)**：管理所有活動相關操作
4. **面試管理 (interviews)**：管理面試流程和面試官
5. **預約管理 (appointments)**：管理諮詢預約
6. **管理員管理 (admin)**：管理其他管理員帳戶

### 角色定義

系統預設了以下角色：

1. **超級管理員 (super_admin)**：擁有所有權限，業務最高決策權
2. **系統管理員 (system_admin)**：擁有所有權限，技術最高權限
3. **營運管理員 (operation_admin)**：負責內容營運、活動管理等，無用戶管理權限
4. **客戶管理員 (customer_admin)**：負責面試流程、面試官維護等

### 權限檢查

權限檢查在兩個層面進行：

1. **前端 UI 層面**：控制管理界面中可見和可操作的功能
2. **後端 API 層面**：確保只有具有適當權限的管理員才能執行特定操作

#### 前端權限檢查

```javascript
// 檢查管理員是否具有特定權限
const hasPermission = (permission: string | null) => {
  // 無需權限或頂級管理員（具有通配符權限）
  if (!permission || admin?.permissions?.includes('*')) return true
  
  // 功能級別權限檢查
  const functionName = permission.split(':')[0]
  if (admin?.permissions?.some(p => p.startsWith(functionName + ':'))) return true
  
  return false
}
```

#### 後端權限中間件

```javascript
// 管理員身份驗證中間件
const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: '拒絕訪問。未提供令牌。' })
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as any

    // 如果端點需要特定權限，則檢查用戶是否具有該權限
    if (req.requiredPermission) {
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

// 權限要求中間件
const requirePermission = (permission: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    req.requiredPermission = permission
    next()
  }
}
```

### 功能級別權限實現

```javascript
// 功能級別權限檢查
async userHasPermission(adminId: string, permission: string): Promise<boolean> {
  const user = await this.getAdminUser(adminId)
  
  if (!user || user.status !== 'active') {
    return false
  }

  // 檢查直接權限
  if (user.permissions) {
    if (user.permissions.includes('*')) return true
    
    // 功能級別權限檢查
    const functionName = permission.split(':')[0]
    
    // 如果管理員有該功能的任何權限，授予該功能的所有操作權限
    if (user.permissions.some(p => p.startsWith(functionName + ':'))) {
      return true
    }
  }

  // 檢查角色權限
  const role = await this.getRole(user.roleId)
  if (!role || !role.isActive) {
    return false
  }

  // 檢查通配符權限
  if (role.permissions.includes('*')) {
    return true
  }
  
  // 功能級別權限檢查
  const functionName = permission.split(':')[0]
  if (role.permissions.some(p => p.startsWith(functionName + ':'))) {
    return true
  }

  return false
}
```

## 管理界面

### 導航側邊欄

管理界面的側邊欄顯示所有可用的功能模塊，包括：

- 系統總覽
- 活動管理
- 會員面試管理
- 諮詢預約管理
- 過往活動管理
- 權限管理
- 角色管理
- 管理員管理
- 審計日誌

### UI 權限處理

- 所有菜單項始終顯示，提供系統功能的完整視圖
- 頂級管理員（具有通配符權限 '*'）可以訪問所有功能
- 非頂級管理員看到的未授權功能會被禁用（灰色顯示）
- 禁用的菜單項顯示鎖定圖標，表示需要權限

```jsx
<button
  key={item.id}
  onClick={() => canAccess && onSectionChange(item.id)}
  disabled={!canAccess}
  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
    isActive
      ? 'bg-luxury-gold text-luxury-midnight-black shadow-md'
      : canAccess 
        ? 'text-luxury-platinum hover:bg-luxury-gold/10 hover:text-luxury-gold' 
        : 'text-luxury-platinum/40 cursor-not-allowed opacity-60'
  }`}
  title={!canAccess ? '需要權限' : ''}
>
  <span className={isActive ? 'text-luxury-midnight-black' : canAccess ? 'text-luxury-platinum/60' : 'text-luxury-platinum/30'}>
    {item.icon}
  </span>
  <span className="font-medium">{item.name}</span>
  {!canAccess && (
    <span className="ml-auto">
      <svg className="w-4 h-4 text-luxury-platinum/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    </span>
  )}
</button>
```

## 數據模型

### 管理員用戶 (AdminUser)

```typescript
interface AdminUser {
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
```

### 管理員角色 (AdminRole)

```typescript
interface AdminRole {
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
```

## API 端點

### 身份驗證端點

- `POST /api/admin/auth/login` - 管理員登入
- `POST /api/admin/auth/refresh` - 刷新訪問令牌
- `POST /api/admin/auth/logout` - 管理員登出
- `GET /api/admin/auth/profile` - 獲取管理員個人資料

### 權限管理端點

- `GET /api/admin/permissions` - 獲取所有權限
- `GET /api/admin/permissions/grouped` - 獲取按功能分組的權限
- `POST /api/admin/permissions/validate` - 驗證權限組合
- `GET /api/admin/permissions/check/:permission` - 檢查特定權限

### 角色管理端點

- `GET /api/admin/roles` - 獲取所有角色
- `POST /api/admin/roles` - 創建新角色
- `PUT /api/admin/roles/:roleId` - 更新角色
- `GET /api/admin/roles/:roleId/capabilities` - 獲取角色能力

### 管理員用戶端點

- `POST /api/admin/users` - 創建管理員用戶
- `PUT /api/admin/users/:adminId` - 更新管理員用戶

### 審計端點

- `GET /api/admin/audit/logs` - 獲取審計日誌

### 活動管理端點

- `GET /api/admin/events` - 獲取所有活動
- `GET /api/admin/events/:id` - 獲取特定活動
- `POST /api/admin/events` - 創建新活動
- `PUT /api/admin/events/:id` - 更新活動
- `PUT /api/admin/events/:id/status` - 更新活動狀態
- `DELETE /api/admin/events/:id` - 刪除活動

### 系統端點

- `GET /api/admin/system/stats` - 獲取系統統計信息
- `GET /api/admin/health` - 健康檢查

## 最佳實踐

1. **安全性**：
   - 所有敏感操作都應該在後端進行權限驗證
   - 前端 UI 權限僅用於提升用戶體驗，不應依賴於安全性
   - 定期審查審計日誌，監控可疑活動

2. **權限設計**：
   - 遵循功能級別權限原則
   - 為每個功能模塊定義清晰的權限邊界
   - 避免過度細分權限，保持管理簡單

3. **用戶體驗**：
   - 提供清晰的視覺反饋，指示哪些功能可用
   - 對於禁用的功能，提供獲取權限的指導
   - 確保錯誤消息友好且有幫助

## 故障排除

### 常見問題

1. **登入失敗**：
   - 檢查電子郵件和密碼是否正確
   - 確認管理員帳戶狀態為 'active'
   - 檢查服務器日誌中的錯誤消息

2. **權限問題**：
   - 確認管理員角色具有所需功能的權限
   - 檢查 JWT 令牌中的角色 ID 是否正確
   - 驗證權限服務是否正常工作

3. **UI 顯示問題**：
   - 清除瀏覽器 localStorage 並重新登入
   - 檢查控制台錯誤
   - 確認權限數據正確加載

### 調試工具

系統提供了幾個調試工具：

1. **權限檢查工具**：
   ```javascript
   window.debugAdminPermissions()
   ```

2. **測試 HTML 頁面**：
   - `/test-admin-permissions.html` - 測試管理員權限
   - 可以查看、設置和清除管理員權限數據

## 未來擴展

1. **雙因素認證**：增強管理員帳戶安全性
2. **IP 白名單**：限制管理員登入的 IP 地址
3. **活動審批工作流**：多級審批流程
4. **自定義儀表板**：允許管理員自定義儀表板
