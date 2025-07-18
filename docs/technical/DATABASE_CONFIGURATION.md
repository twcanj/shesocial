# InfinityMatch 數據庫配置指南

## 數據存儲策略

InfinityMatch 使用 NeDB 作為主要數據存儲解決方案，配合 IndexedDB 實現前端離線支持。

### 重要規則：始終使用持久化存儲

**重要規則**：系統必須始終使用持久化存儲（文件系統），而非內存數據庫。內存數據庫不應在任何環境中使用，包括開發、測試和生產環境。

### 持久化存儲配置

正確的數據庫初始化方式：

```javascript
// 正確的初始化方式 - 使用持久化存儲
this.databases = {
  users: new Datastore({ filename: path.join(dataDir, 'users.db'), autoload: true }),
  events: new Datastore({ filename: path.join(dataDir, 'events.db'), autoload: true }),
  bookings: new Datastore({ filename: path.join(dataDir, 'bookings.db'), autoload: true }),
  // ... 其他數據庫
}
```

### 錯誤的內存數據庫配置（不應使用）

以下配置不應在任何環境中使用，包括測試環境：

```javascript
// 錯誤的初始化方式 - 使用內存數據庫（不應使用）
this.databases = {
  users: new Datastore(), // 沒有 filename 參數，創建內存數據庫
  events: new Datastore(),
  bookings: new Datastore(),
  // ... 其他數據庫
}
```

## 測試環境配置

在測試環境中，應使用專門的測試數據目錄，而非內存數據庫：

```javascript
// 測試環境的正確配置
const dataDir = process.env.NODE_ENV === 'test' 
  ? path.join(__dirname, '../../test_data') 
  : path.join(__dirname, '../../data');

this.databases = {
  users: new Datastore({ filename: path.join(dataDir, 'users.db'), autoload: true }),
  // ... 其他數據庫
}
```

## 數據目錄結構

數據文件存儲在以下目錄：

```
/server/data/
├── users.db           # 用戶數據
├── events.db          # 活動數據
├── bookings.db        # 預約數據
├── sync_queue.db      # 同步隊列
├── admin_users.db     # 管理員用戶
├── admin_roles.db     # 管理員角色
├── permission_atoms.db # 權限原子
├── interviewers.db    # 面試官數據
├── appointment_bookings.db # 預約數據
└── audit_logs.db      # 審計日誌
```

## 數據庫索引

系統自動創建以下索引以提高查詢性能：

```javascript
// 創建索引
this.databases.users.ensureIndex({ fieldName: 'email', unique: true })
this.databases.admin_users.ensureIndex({ fieldName: 'email', unique: true })
this.databases.admin_users.ensureIndex({ fieldName: 'username', unique: true })
this.databases.admin_roles.ensureIndex({ fieldName: 'roleId', unique: true })
this.databases.permission_atoms.ensureIndex({ fieldName: 'atomId', unique: true })
```

## 數據備份策略

系統使用 Cloudflare R2 進行自動數據備份：

1. **每日增量備份**：每天凌晨 3 點進行增量備份
2. **每週完整備份**：每週日凌晨 2 點進行完整備份
3. **備份保留策略**：
   - 每日備份保留 7 天
   - 每週備份保留 4 週
   - 每月備份保留 6 個月

## 數據同步機制

前端和後端數據同步使用以下機制：

1. **離線優先**：前端使用 IndexedDB 存儲數據，支持離線操作
2. **後台同步**：使用 Background Sync API 在網絡恢復時同步數據
3. **衝突解決**：使用時間戳和版本號解決數據衝突

## 數據遷移

系統支持以下數據遷移方式：

1. **自動遷移**：系統啟動時自動檢測並應用數據結構變更
2. **手動遷移**：使用 `npm run migrate` 命令手動執行遷移腳本

## 故障排除

### 常見問題

1. **數據庫鎖定錯誤**：
   - 原因：多個進程嘗試同時寫入同一個數據庫文件
   - 解決方案：確保只有一個服務實例運行，或使用主從架構

2. **數據庫損壞**：
   - 原因：非正常關閉服務或磁盤錯誤
   - 解決方案：從最近的備份恢復，使用 `npm run db:repair` 修復

3. **索引不一致**：
   - 原因：數據庫操作中斷
   - 解決方案：使用 `npm run db:reindex` 重建索引

### 數據庫修復命令

```bash
# 修復損壞的數據庫文件
npm run db:repair

# 重建數據庫索引
npm run db:reindex

# 從備份恢復
npm run db:restore --date=YYYY-MM-DD
```
