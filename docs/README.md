# InfinityMatch 文檔中心

## 技術文檔

- [技術架構概述](./technical/CONCISE_IMPLEMENTATION_PLAN.md)
- [管理系統文檔](./technical/ADMIN_SYSTEM.md)
- [權限系統設計](./technical/PERMISSION_SYSTEM.md)
- [管理員權限快速參考](./technical/ADMIN_PERMISSIONS_QUICK_REFERENCE.md)
- [管理員權限詳細說明](./technical/ADMIN_PERMISSIONS.md)
- [數據庫配置指南](./technical/DATABASE_CONFIGURATION.md)
- [故障排除指南](./technical/TROUBLESHOOTING.md)

## 業務文檔

- [商業規則](./business/BUSINESS_RULES.md)
- [會員等級與權益](./business/MEMBERSHIP_TIERS.md)
- [活動類型與規則](./business/EVENT_TYPES.md)
- [面試流程](./business/INTERVIEW_PROCESS.md)
- [支付流程](./business/PAYMENT_PROCESS.md)

## 開發文檔

- [開發環境設置](./development/SETUP.md)
- [代碼風格指南](./development/CODE_STYLE.md)
- [API 文檔](./development/API_DOCS.md)
- [測試策略](./development/TESTING.md)
- [部署流程](./development/DEPLOYMENT.md)

## 用戶指南

- [管理員使用手冊](./user/ADMIN_MANUAL.md)
- [面試官使用手冊](./user/INTERVIEWER_MANUAL.md)
- [客服人員使用手冊](./user/CUSTOMER_SERVICE_MANUAL.md)

## 系統架構圖

```
InfinityMatch/
├── 前端 (React 19 + TypeScript + Vite)
│   ├── 用戶界面
│   │   ├── 公開頁面
│   │   ├── 會員頁面
│   │   └── 管理頁面
│   ├── 狀態管理 (Zustand)
│   └── 離線支持 (IndexedDB)
│
├── 後端 (Node.js + Express + TypeScript)
│   ├── API 服務
│   │   ├── 用戶 API
│   │   ├── 活動 API
│   │   ├── 面試 API
│   │   ├── 預約 API
│   │   └── 管理 API
│   ├── 業務邏輯
│   └── 數據存儲 (NeDB)
│
└── 外部服務
    ├── 支付服務 (LINE Pay + ECPay)
    ├── 媒體存儲 (Cloudinary)
    ├── 持久化存儲 (Cloudflare R2)
    └── 監控與日誌
```

## 權限系統概述

InfinityMatch 採用**功能級別權限模型**，當管理員被授予某個功能的權限時，他們可以執行該功能下的所有操作。

### 管理員類型

1. **超級管理員 (super_admin)**
   - 擁有所有權限
   - 業務最高決策權

2. **系統管理員 (system_admin)**
   - 擁有所有權限
   - 技術最高權限

3. **營運管理員 (operation_admin)**
   - 擁有活動管理、內容營運等權限
   - 無用戶管理權限

4. **客戶管理員 (customer_admin)**
   - 擁有面試管理、預約管理等權限
   - 無系統配置和用戶管理權限

詳細權限設計請參閱 [權限系統設計](./technical/PERMISSION_SYSTEM.md) 和 [管理員權限快速參考](./technical/ADMIN_PERMISSIONS_QUICK_REFERENCE.md)。
