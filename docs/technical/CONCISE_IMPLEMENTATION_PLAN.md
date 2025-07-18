# InfinityMatch 實施計劃

## 系統架構

### 前端架構
- **框架**: React 19 + TypeScript + Vite 7.0.3
- **樣式**: Tailwind CSS 4.x + @tailwindcss/postcss + 自定義奢華設計系統
- **狀態管理**: React Hooks + Zustand
- **離線支持**: NeDB 瀏覽器存儲 + IndexedDB (Dexie.js)
- **特色**: 台灣本地化 + 手機優先設計
- **PWA**: 暫時停用 (等待 Vite 7 兼容性)

### 數據庫架構
- **主要數據庫**: NeDB (持久化存儲)
- **前端存儲**: IndexedDB (Dexie.js)
- **重要規則**: 系統必須始終使用持久化存儲，而非內存數據庫
- **數據目錄**: `/server/data/` 和測試環境的 `/server/test_data/`
- **備份策略**: Cloudflare R2 自動備份

### 部署策略
- **平台**: Render.com 免費層
- **域名**: 自定義域名 + SSL
- **監控**: 基本日誌 + 錯誤追蹤
- **備份**: 自動 R2 同步備份

## 核心功能

### 用戶功能
- 註冊/登入 (email + LINE Login)
- 個人資料管理
- 活動瀏覽和報名
- 影片自我介紹
- VIP 會員專屬功能

### 管理功能
- 活動創建和管理
- 用戶審核系統
- 支付記錄查看
- 數據分析報表

## 權限系統

### 功能級別權限模型

InfinityMatch 採用**功能級別權限模型**，而非操作級別權限模型。當管理員被授予某個功能的權限時，他們可以執行該功能下的所有操作。

### 管理員類型

1. **超級管理員 (super_admin)**
   - 擁有所有權限（通配符 `*`）
   - 業務最高決策權

2. **系統管理員 (system_admin)**
   - 擁有所有權限（通配符 `*`）
   - 技術最高權限

3. **營運管理員 (operation_admin)**
   - 擁有活動管理、內容營運等權限
   - 無用戶管理權限

4. **客戶管理員 (customer_admin)**
   - 擁有面試管理、預約管理等權限
   - 無系統配置和用戶管理權限

### 主要功能模塊

1. **系統管理 (system)**
2. **用戶管理 (users)**
3. **活動管理 (events)**
4. **面試管理 (interviews)**
5. **預約管理 (appointments)**
6. **管理員管理 (admin)**

## 數據模型

### 用戶模型
```typescript
interface User {
  _id: string
  email: string
  passwordHash: string
  profile: {
    name: string
    age: number
    location: string
    // 其他個人資料
  }
  membership: {
    type: 'visitor' | 'registered' | 'vip' | 'vvip'
    expiresAt: Date
  }
  status: 'active' | 'pending' | 'suspended'
  createdAt: Date
  updatedAt: Date
}
```

### 活動模型
```typescript
interface Event {
  _id: string
  name: string
  description: string
  metadata: {
    date: Date
    location: string
    category: string
    type: '1day_trip' | 'multi_day' | 'dinner' | 'workshop'
    pricing: {
      male: number
      female: number
      voucherDiscount: Record<string, number>
    }
    requirements: {
      ageMin: number
      ageMax: number
      maritalStatus: 'single' | 'divorced' | 'any'
    }
  }
  participants: string[] // 用戶 ID
  status: 'draft' | 'published' | 'recruiting' | 'full' | 'completed' | 'cancelled' | 'suspended'
  participantVisibility: {
    vvip: boolean
    vip: boolean
    registered: boolean
    visitor: boolean
  }
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastSync: Date
}
```

### 管理員模型
```typescript
interface AdminUser {
  _id: string
  adminId: string
  username: string
  email: string
  passwordHash: string
  profile: {
    realName: string
    department: 'executive' | 'technical' | 'operations' | 'members'
  }
  roleId: string
  permissions: string[]
  status: 'active' | 'suspended' | 'inactive'
  createdAt: Date
  updatedAt: Date
}
```

## 實施階段

### 階段 1: 基礎架構 (完成)
- 前端和後端項目設置
- 數據庫連接和模型定義
- 用戶認證系統
- 基本 UI 組件

### 階段 2: 核心功能 (完成)
- 用戶註冊和登入
- 活動創建和管理
- 個人資料管理
- 管理員後台

### 階段 3: 高級功能 (進行中)
- 支付整合
- 媒體上傳
- 面試預約系統
- 會員升級流程

### 階段 4: 優化和部署 (計劃中)
- 性能優化
- 安全審核
- 生產環境部署
- 監控和日誌系統

## 技術債務管理

1. **已解決**
   - NeDB 版本兼容性問題
   - TypeScript 類型定義完善
   - JWT 認證系統優化

2. **待解決**
   - 圖片處理優化
   - 離線同步機制完善
   - 錯誤處理統一化

## 測試策略

1. **單元測試**
   - 核心業務邏輯
   - 權限檢查
   - 數據驗證

2. **集成測試**
   - API 端點
   - 數據庫操作
   - 認證流程

3. **端到端測試**
   - 用戶註冊流程
   - 活動報名流程
   - 支付流程

## 部署流程

1. **開發環境**
   - 本地開發
   - 自動化測試

2. **測試環境**
   - Render.com 預覽部署
   - 手動測試

3. **生產環境**
   - Render.com 生產部署
   - 監控和日誌

## 維護計劃

1. **定期備份**
   - 每日數據庫備份
   - 每週完整系統備份

2. **性能監控**
   - API 響應時間
   - 數據庫查詢性能
   - 前端加載時間

3. **安全更新**
   - 依賴包更新
   - 安全漏洞修復
   - 密碼策略審核
