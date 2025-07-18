# InfinityMatch 管理員權限系統

## 功能級別權限模型

InfinityMatch 管理系統採用**功能級別權限模型**，而非操作級別權限模型。這是一個重要的設計決策，旨在簡化權限管理並提高系統可維護性。

### 功能級別 vs 操作級別

- **功能級別權限**：權限以功能模塊為單位授予，例如「活動管理」、「用戶管理」等。
- **操作級別權限**：權限以具體操作為單位授予，例如「查看活動」、「編輯活動」、「刪除活動」等。

**InfinityMatch 選擇功能級別權限模型的原因**：
1. 簡化權限管理
2. 減少權限配置的複雜性
3. 符合實際業務需求
4. 提高系統可維護性

## 權限授予原則

**重要原則**：當管理員被授予某個功能的權限時，他們可以執行該功能下的所有操作。

例如，如果管理員被授予「活動管理」(events) 權限，則他們可以：
- 查看所有活動
- 創建新活動
- 編輯現有活動
- 刪除活動
- 管理活動狀態
- 查看活動參與者
- 等等...

## 權限檢查實現

### 後端權限檢查

```javascript
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

### 前端權限檢查

```javascript
const hasPermission = (permission: string | null) => {
  // 無需權限或頂級管理員（具有通配符權限）
  if (!permission || admin?.permissions?.includes('*')) return true
  
  // 功能級別權限檢查
  if (permission) {
    const functionName = permission.split(':')[0]
    if (admin?.permissions?.some(p => p.startsWith(functionName + ':'))) {
      return true
    }
  }
  
  return false
}
```

## 主要功能模塊

InfinityMatch 管理系統定義了以下主要功能模塊：

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

## 管理員類型

InfinityMatch 管理系統定義了四種管理員類型：

1. **超級管理員 (super_admin)**
   - 擁有所有權限（通配符 '*'）
   - 業務最高決策權
   - 可以管理其他管理員

2. **系統管理員 (system_admin)**
   - 擁有所有權限（通配符 '*'）
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

## 權限分配最佳實踐

1. **遵循最小權限原則**
   - 只授予管理員執行其職責所需的最小權限集
   - 避免不必要的權限授予

2. **使用角色進行權限分組**
   - 為常見的職責定義角色
   - 通過角色分配權限，而不是直接分配權限

3. **定期審查權限**
   - 定期檢查管理員的權限是否適當
   - 移除不再需要的權限

4. **記錄權限變更**
   - 記錄所有權限變更
   - 包括誰進行了變更、何時進行的變更以及變更的原因

## 結論

InfinityMatch 管理系統的功能級別權限模型提供了一個簡單而有效的方式來管理管理員權限。通過將權限授予功能模塊而非具體操作，系統簡化了權限管理，同時確保管理員可以執行其職責所需的所有操作。
