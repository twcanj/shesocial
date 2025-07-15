# 權限系統最終設計 - 2層4類架構

## 🎯 權限架構設計確認

### 架構原則
- **2層結構**: 最高權限層 + 日常營運層
- **4類角色**: 總管理員、系統維護員、日常營運、客戶管理
- **權責分離**: 日常營運不觸及客戶，客戶管理專責面試相關

## 📊 權限層級和職責

### 第一層：最高權限層

#### 1. 總管理員 (super_admin)
- **職責**: 業務最高決策權
- **權限**: 所有權限 (*)
- **用戶**: 張執行長 (superadmin@infinitymatch.tw)
- **部門**: executive

#### 2. 系統維護員 (system_admin)  
- **職責**: 技術最高權限，系統安全和穩定運行
- **權限**: 所有權限 (*)
- **用戶**: 李技術長 (sysadmin@infinitymatch.tw)
- **部門**: technical

### 第二層：日常營運層

#### 3. 日常營運 (operation_admin)
- **職責**: 內容營運、活動管理
- **權限**:
  ```
  內容管理: content:view, content:moderate, content:edit, content:feature, content:export
  活動管理: events:view, events:create, events:edit, events:participants, events:showcase, events:export
  用戶查看: users:view (僅查看，不可編輯)
  ```
- **不包含**: 面試、預約、付費相關權限
- **用戶**: 王營運經理 (operations@infinitymatch.tw)
- **部門**: operations

#### 4. 客戶管理 (customer_admin)
- **職責**: 面試流程、面試官維護、預約時段、付費用戶、VIP服務
- **權限**:
  ```
  用戶管理: users:view, users:edit, users:status, users:export
  面試管理: interviews:view, interviews:schedule, interviews:conduct, interviews:review, interviews:reschedule, interviews:export
  面試官管理: interviewers:view, interviewers:create, interviewers:edit, interviewers:delete, interviewers:manage, interviewers:schedule
  預約管理: appointments:view, appointments:create, appointments:edit, appointments:delete, appointments:manage, appointments:export
  付費管理: payments:view, payments:process, payments:reports
  VIP服務: vvip:intro_management, vvip:consultation, vvip:priority_support, vvip:exclusive_events
  ```
- **用戶**: 陳客戶經理 (customer@infinitymatch.tw)
- **部門**: members

## 🎯 面試官管理模式

### 面試官定位
- **角色**: 被管理的資源，不是系統用戶
- **登入**: 不需要系統登入帳戶
- **管理**: 由客戶管理人員專責維護
- **聯絡**: 僅保留聯絡用信箱

### 面試官資源
```
王美玲 - 資深情感諮詢師 (wangmeiling@infinitymatch.tw)
張麗華 - 專業配對顧問   (zhanglihua@infinitymatch.tw)
李志強 - 心理諮詢專家   (lizhiqiang@infinitymatch.tw)
```

### 工作流程
1. **客戶管理** 創建和維護面試官資源
2. **客戶管理** 設定面試官可預約時段
3. **客戶管理** 安排面試流程和管理
4. **系統自動** 發送通知到面試官聯絡信箱
5. **日常營運** 專注內容和活動，不涉及面試

## 🔐 權限邊界清晰化

### 日常營運 vs 客戶管理

| 功能 | 日常營運 | 客戶管理 | 說明 |
|------|---------|---------|------|
| 內容管理 | ✅ 完整權限 | ❌ 無權限 | 內容營運專責 |
| 活動管理 | ✅ 完整權限 | ❌ 無權限 | 活動營運專責 |
| 用戶查看 | ✅ 僅查看 | ✅ 完整管理 | 客戶管理可編輯用戶 |
| 面試管理 | ❌ 無權限 | ✅ 完整權限 | 客戶管理專責 |
| 面試官維護 | ❌ 無權限 | ✅ 完整權限 | 客戶管理專責 |
| 預約時段 | ❌ 無權限 | ✅ 完整權限 | 客戶管理專責 |
| 付費管理 | ❌ 無權限 | ✅ 完整權限 | 客戶管理專責 |

### 權責分離優勢
- **清晰職責**: 日常營運專注內容活動，客戶管理專注面試付費
- **降低風險**: 日常營運人員無法接觸客戶敏感資料
- **提高效率**: 各部門專精各自領域
- **便於管理**: 權限邊界清楚，易於審計

## 🚀 實施要點

### 缺失權限補充
需要添加以下預約系統權限到原子列表：
```
appointments:view, appointments:create, appointments:edit, appointments:delete, appointments:manage, appointments:export
interviewers:view, interviewers:create, interviewers:edit, interviewers:delete, interviewers:manage, interviewers:schedule
```

### 資料庫修正
面試官記錄修改：
- `userId: null` (不關聯系統用戶)
- `email` 改為聯絡用信箱
- 由客戶管理人員維護

### 種子數據
4個管理員帳戶：
1. 張執行長 (總管理員)
2. 李技術長 (系統維護員)  
3. 王營運經理 (日常營運)
4. 陳客戶經理 (客戶管理)

---

**設計確認時間**: 2025-07-15  
**架構**: 2層4類權限系統  
**核心原則**: 權責分離，專業分工