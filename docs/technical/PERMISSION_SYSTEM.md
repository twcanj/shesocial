# InfinityMatch 權限系統設計

## 功能級別權限模型

InfinityMatch 管理系統採用**功能級別權限模型**，而非操作級別權限模型。這是一個重要的設計決策，旨在簡化權限管理並提高系統可維護性。

### 重要規則：功能級別權限的核心原則

**當管理員被授予某個功能的權限時，他們可以執行該功能下的所有操作，無需額外授權。**

例如，如果管理員被授予「活動管理」(events) 權限，則他們自動獲得以下所有權限：
- 查看活動列表和詳情
- 創建新活動
- 編輯現有活動
- 刪除活動
- 管理活動狀態（上架、下架、暫停等）
- 管理活動參與者
- 查看活動統計數據
- 等等...

這種設計確保了權限系統的簡潔性和可維護性，特別適合我們的管理員結構（2級4種管理員類型）。

### 功能級別 vs 操作級別

| 功能級別權限 | 操作級別權限 |
|------------|------------|
| 權限以功能模塊為單位授予 | 權限以具體操作為單位授予 |
| 例如：`events`（活動管理） | 例如：`events:view`、`events:create`、`events:edit` |
| 簡化權限管理 | 權限管理更加複雜 |
| 適合小型到中型團隊 | 適合大型組織和複雜權限需求 |

**InfinityMatch 選擇功能級別權限模型的原因**：
1. 簡化權限管理
2. 減少權限配置的複雜性
3. 符合實際業務需求
4. 提高系統可維護性
5. 適合我們的管理員結構（2級4種管理員類型）

## 管理員類型和權限

InfinityMatch 系統定義了四種管理員類型，每種類型具有不同的功能級別權限：

1. **超級管理員 (super_admin)**
   - 擁有所有權限（通配符 `*`）
   - 業務最高決策權
   - 可以管理其他管理員

2. **系統管理員 (system_admin)**
   - 擁有所有權限（通配符 `*`）
   - 技術最高權限
   - 負責系統維護和配置

3. **營運管理員 (operation_admin)**
   - 擁有活動管理、內容營運等權限
   - 負責活動管理和內容營運
   - 無系統配置權限
   - 無用戶管理權限

4. **客戶管理員 (customer_admin)**
   - 擁有面試管理、預約管理等權限
   - 負責面試流程和面試官維護
   - 無系統配置和用戶管理權限

## 主要功能模塊

系統定義了以下主要功能模塊，每個模塊對應一個功能級別權限：

1. **系統管理 (system)**
   - 系統監控
   - 系統配置
   - 系統備份
   - 系統日誌

2. **用戶管理 (users)**
   - 用戶資料管理
   - 用戶狀態管理
   - 用戶審核
   - 用戶統計

3. **活動管理 (events)**
   - 活動創建
   - 活動編輯
   - 活動狀態管理
   - 活動參與者管理
   - 活動統計

4. **面試管理 (interviews)**
   - 面試預約
   - 面試官管理
   - 面試評估
   - 面試結果管理

5. **預約管理 (appointments)**
   - 預約創建
   - 預約編輯
   - 預約狀態管理
   - 預約統計

6. **管理員管理 (admin)**
   - 管理員創建
   - 管理員編輯
   - 角色管理
   - 權限管理
   - 審計日誌

## 權限檢查實現

### 後端權限檢查

```javascript
async userHasPermission(adminId: string, permission: string): Promise<boolean> {
  const user = await this.getAdminUser(adminId)
  
  if (!user || user.status !== 'active') {
    return false
  }

  // 從權限字符串中提取功能名稱（例如 'events:view' -> 'events'）
  const functionName = permission.split(':')[0]

  // 檢查直接權限
  if (user.permissions) {
    // 超級管理員權限檢查
    if (user.permissions.includes('*')) return true
    
    // 功能級別權限檢查 - 如果有該功能的任何權限，則授予該功能的所有操作權限
    if (user.permissions.includes(functionName) || 
        user.permissions.some(p => p.startsWith(functionName + ':'))) {
      return true
    }
  }

  // 檢查角色權限
  const role = await this.getRole(user.roleId)
  if (!role || !role.isActive) {
    return false
  }

  // 超級管理員角色檢查
  if (role.permissions.includes('*')) {
    return true
  }
  
  // 功能級別角色權限檢查
  if (role.permissions.includes(functionName) || 
      role.permissions.some(p => p.startsWith(functionName + ':'))) {
    return true
  }

  return false
}
```

### 前端權限檢查

```javascript
const hasPermission = (permission: string | null) => {
  // 無需權限或頂級管理員（具有通配符權限）
  if (!permission || admin?.permissions?.includes('*')) return true
  
  // 功能級別權限檢查
  if (permission) {
    const functionName = permission.split(':')[0]
    if (admin?.permissions?.includes(functionName) || 
        admin?.permissions?.some(p => p.startsWith(functionName + ':'))) {
      return true
    }
  }
  
  return false
}
```

### API 路由中的權限要求

```javascript
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

// 使用示例
router.get('/events', adminAuth, requirePermission('events'), async (req, res) => {
  // 處理請求
})
```

## 最佳實踐

1. **權限命名規範**
   - 功能權限使用名詞：`events`, `users`, `interviews`
   - 雖然系統使用功能級別權限，但在代碼中仍可使用 `功能:操作` 格式（如 `events:view`）
   - 系統會自動提取功能名稱進行權限檢查

2. **權限分配原則**
   - 遵循最小權限原則
   - 根據管理員職責分配相應功能權限
   - 避免不必要的權限授予

3. **權限檢查位置**
   - 前端：控制 UI 元素的顯示和交互
   - 後端：保護 API 端點，確保安全性

4. **權限審計**
   - 定期審查管理員權限
   - 記錄權限變更
   - 監控權限使用情況

## 結論

InfinityMatch 的功能級別權限模型提供了一個簡單而有效的方式來管理管理員權限。通過將權限授予功能模塊而非具體操作，系統簡化了權限管理，同時確保管理員可以執行其職責所需的所有操作。這種設計特別適合我們的管理員結構（2級4種管理員類型），使權限管理更加直觀和高效。
