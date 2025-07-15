# 天造地設人成對 InfinityMatch 預約系統開發指南

## 🎯 系統概覽

InfinityMatch 預約系統支援兩種類型的預約：
1. **資詢預約** - 潛在會員想了解平台的諮詢
2. **會員面試** - 正式會員的30分鐘視訊面試

## 📊 數據架構

### 核心實體

#### 1. AppointmentSlot (預約時段)
```typescript
interface AppointmentSlot {
  _id: string
  type: 'consultation' | 'member_interview'
  
  // 時間管理
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  duration: number // 分鐘
  timezone: string // 'Asia/Taipei'
  
  // 面試官資訊
  interviewerId: string
  interviewerName: string
  interviewType: 'video_call' | 'phone_call' | 'in_person'
  
  // 可用性
  isAvailable: boolean
  capacity: number // 可預約人數
  bookedCount: number // 已預約人數
  
  // 重複預約支援
  isRecurring: boolean
  recurringPattern?: RecurringPattern
  
  // 業務邏輯
  requiresPreApproval: boolean
  cancellationDeadlineHours: number
  
  // 會議資訊
  meetingUrl?: string
  location?: string
  
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
```

#### 2. AppointmentBooking (預約記錄)
```typescript
interface AppointmentBooking {
  _id: string
  slotId: string
  
  // 用戶資訊
  userId?: string // 註冊用戶
  guestInfo?: {   // 訪客資訊
    name: string
    email: string
    phone: string
    preferredContact: 'email' | 'phone' | 'line'
  }
  
  // 預約詳情
  type: 'consultation' | 'member_interview'
  status: 'available' | 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  
  // 排程資訊
  scheduledDate: string
  scheduledTime: string
  duration: number
  
  // 面試/諮詢特定資訊
  purpose?: string
  questions?: string[]
  membershipInterest?: string[]
  
  // 會議詳情
  meetingUrl?: string
  location?: string
  
  // 溝通記錄
  confirmationSent: boolean
  remindersSent: number
  
  // 後續追蹤
  completed: boolean
  outcome?: 'approved' | 'rejected' | 'pending_review'
  interviewNotes?: string
  rating?: number
  followUpRequired: boolean
  
  // 時間戳
  bookedAt: Date
  confirmedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  
  createdAt: Date
  updatedAt: Date
}
```

#### 3. Interviewer (面試官)
```typescript
interface Interviewer {
  _id: string
  userId: null // 面試官不是系統用戶，由客戶管理人員專責維護
  
  // 基本資訊
  name: string
  title: string
  email: string // 聯絡用信箱，非登入帳戶
  phone?: string
  
  // 專業領域
  appointmentTypes: ('consultation' | 'member_interview')[]
  interviewTypes: ('video_call' | 'phone_call' | 'in_person')[]
  languages: string[]
  specialties: string[] // 例如：['luxury_dating', 'relationship_coaching']
  
  // 可用性設定
  isActive: boolean
  defaultAvailability: {
    [dayOfWeek: string]: {
      enabled: boolean
      startTime: string
      endTime: string
      breakTimes?: Array<{
        startTime: string
        endTime: string
      }>
    }
  }
  
  // 設定
  maxDailyAppointments: number
  bufferTimeMinutes: number // 預約間隔時間
  advanceBookingDays: number // 提前預約天數
  autoApproval: boolean
  
  // 績效統計
  totalAppointments: number
  completedAppointments: number
  averageRating: number
  
  createdAt: Date
  updatedAt: Date
}
```

## 🔐 權限架構設計 - 2層4類系統

### 管理員權限架構

#### 第一層：最高權限層
**1. 總管理員 (super_admin)**
- **職責**: 業務最高決策權
- **權限**: 所有權限 (*)
- **用戶**: 張執行長 (superadmin@infinitymatch.tw)

**2. 系統維護員 (system_admin)**
- **職責**: 技術最高權限，系統安全和穩定運行
- **權限**: 所有權限 (*)
- **用戶**: 李技術長 (sysadmin@infinitymatch.tw)

#### 第二層：日常營運層
**3. 日常營運 (operation_admin)**
- **職責**: 內容營運、活動管理
- **權限**: 
  - 內容管理 (content:*)
  - 活動管理 (events:*)
  - 用戶查看 (users:view)
- **限制**: **不觸及面試、預約、付費相關功能**
- **用戶**: 王營運經理 (operations@infinitymatch.tw)

**4. 客戶管理 (customer_admin)**
- **職責**: 面試流程、面試官維護、預約時段、付費用戶、VIP服務
- **權限**: 
  - 用戶管理 (users:*)
  - 面試管理 (interviews:*)
  - **面試官管理 (interviewers:*)** 
  - **預約管理 (appointments:*)**
  - 付費管理 (payments:*)
  - VIP服務 (vvip:*)
- **用戶**: 陳客戶經理 (customer@infinitymatch.tw)

### 面試官管理模式
- **角色定位**: 被管理的資源，**不是系統用戶**
- **登入權限**: 面試官**無系統登入帳戶**
- **管理權責**: 由**客戶管理人員**專責維護
- **聯絡方式**: 僅保留聯絡用信箱，非登入帳戶

### 平台用戶權限

#### 會員 (Member)
- **識別方式**: 已註冊用戶
- **權限依會員等級**:
  - 查看可用預約時段
  - 預約面試 (需要 `membership.permissions.bookInterview = true`)
  - 查看自己的預約記錄
  - 取消自己的預約

#### 訪客 (Guest)
- **識別方式**: 未註冊用戶
- **權限**:
  - 查看資詢預約時段
  - 預約資詢 (提供聯絡資訊)
  - 通過 email 查詢預約狀態

## 🛠️ API 端點設計

### 預約時段管理

#### 創建時段 (管理員專用)
```http
POST /api/appointments/slots
Authorization: Admin Token
Content-Type: application/json

{
  "type": "consultation",
  "date": "2025-07-20",
  "startTime": "14:00",
  "endTime": "14:30",
  "interviewerId": "interviewer123",
  "capacity": 1,
  "interviewType": "video_call",
  
  // 可選：重複預約
  "isRecurring": true,
  "recurringPattern": {
    "type": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 2, 3, 4, 5], // 週一到週五
    "maxOccurrences": 20
  }
}
```

#### 獲取可用時段 (公開)
```http
GET /api/appointments/slots/available?type=consultation&startDate=2025-07-20&endDate=2025-07-27&interviewerId=interviewer123
```

#### 更新時段 (管理員/面試官)
```http
PUT /api/appointments/slots/:slotId
Authorization: Admin/Interviewer Token

{
  "isAvailable": false,
  "notes": "臨時無法服務"
}
```

### 預約管理

#### 創建預約 (會員/訪客)
```http
POST /api/appointments/bookings
Authorization: Bearer Token (可選，訪客不需要)

{
  "slotId": "slot123",
  "type": "consultation",
  
  // 註冊用戶 (有 token)
  "purpose": "了解VIP會員方案",
  "questions": ["價格方案", "服務內容"],
  
  // 訪客用戶 (無 token)
  "guestInfo": {
    "name": "王小明",
    "email": "wang@example.com",
    "phone": "0920-123-456",
    "preferredContact": "line"
  }
}
```

#### 查看用戶預約 (會員/訪客)
```http
GET /api/appointments/bookings
Authorization: Bearer Token

// 或訪客查詢
GET /api/appointments/bookings?email=wang@example.com
```

#### 更新預約狀態 (管理員/面試官)
```http
PUT /api/appointments/bookings/:bookingId/status
Authorization: Admin/Interviewer Token

{
  "status": "completed",
  "interviewNotes": "申請人適合VIP方案",
  "rating": 5,
  "outcome": "approved"
}
```

### 面試官管理

#### 創建面試官 (客戶管理專用)
```http
POST /api/appointments/interviewers
Authorization: customer_admin Token

{
  "userId": null, // 面試官不是系統用戶
  "name": "王美玲",
  "title": "資深情感諮詢師",
  "email": "wangmeiling@infinitymatch.tw", // 聯絡用信箱，非登入帳戶
  "appointmentTypes": ["consultation", "member_interview"],
  "interviewTypes": ["video_call", "phone_call"],
  "specialties": ["luxury_dating", "relationship_coaching"],
  "defaultAvailability": {
    "monday": {
      "enabled": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breakTimes": [
        {"startTime": "12:00", "endTime": "13:00"}
      ]
    }
    // ... 其他工作日
  }
}
```

#### 獲取面試官列表 (公開)
```http
GET /api/appointments/interviewers?appointmentType=consultation&interviewType=video_call
```

#### 更新面試官可用性 (客戶管理專用)
```http
PUT /api/appointments/interviewers/:interviewerId/availability
Authorization: customer_admin Token

{
  "dayOfWeek": "monday",
  "availability": {
    "enabled": true,
    "startTime": "10:00",
    "endTime": "17:00"
  }
}
```

**註**: 面試官無系統登入權限，所有設定由客戶管理人員代為操作

## 🔄 業務流程

### 資詢預約流程

1. **訪客查看可用時段**
   ```http
   GET /api/appointments/slots/available?type=consultation
   ```

2. **訪客預約資詢**
   ```http
   POST /api/appointments/bookings
   ```

3. **系統發送確認通知**
   - Email 確認信
   - 會議資訊 (視訊連結/地址)

4. **客戶管理確認預約**
   ```http
   PUT /api/appointments/bookings/:id/status
   ```
   **註**: 由客戶管理人員代為確認，面試官通過聯絡信箱接收通知

5. **進行資詢會議**

6. **客戶管理完成記錄**
   ```http
   PUT /api/appointments/bookings/:id/status
   ```
   **註**: 客戶管理人員根據面試官回饋更新記錄

### 會員面試流程

1. **會員查看面試時段**
   ```http
   GET /api/appointments/slots/available?type=member_interview
   ```

2. **會員預約面試**
   ```http
   POST /api/appointments/bookings
   ```

3. **自動確認預約** (如果 autoApproval: true)

4. **發送面試通知**
   - 面試準備說明
   - 技術檢查連結

5. **進行面試**

6. **客戶管理評估並記錄**
   ```http
   PUT /api/appointments/bookings/:id/status
   ```
   **註**: 客戶管理人員根據面試結果更新評估

7. **更新會員面試狀態**
   - 自動更新 `user.profile.interviewStatus`

## 📅 時段管理策略

### 時段創建策略

#### 單次時段
適用於：
- 特殊活動時段
- 臨時加班時段
- 一次性諮詢

#### 重複時段
適用於：
- 固定工作時間
- 定期可用時段

```javascript
// 每週一到五，早上9點到下午6點，持續3個月
{
  "isRecurring": true,
  "recurringPattern": {
    "type": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 2, 3, 4, 5],
    "maxOccurrences": 60, // 3個月 × 5天/週 × 4週/月
    "endDate": "2025-10-20"
  }
}
```

### 衝突檢測

系統會自動檢測：

1. **面試官時段衝突**
   - 同一面試官不能有重疊時段

2. **用戶預約衝突**
   - 同一用戶不能同時預約多個時段

3. **可用性檢查**
   - 檢查面試官當日可用性設定
   - 檢查是否超過每日最大預約數

4. **工作時間驗證**
   - 預約時間必須在面試官工作時間內
   - 排除休息時間和非工作日

## 🔔 通知系統

### 通知類型

1. **預約確認**
   - 立即發送
   - 包含會議資訊
   - 取消連結

2. **預約提醒**
   - 24小時前
   - 1小時前
   - 可配置提醒時間

3. **狀態變更通知**
   - 預約取消
   - 時段變更
   - 面試結果

### 通知管道

- **Email**: 主要通知方式
- **LINE**: 台灣用戶偏好
- **Push**: PWA 推送通知
- **SMS**: 緊急通知

## 📊 統計與分析

### 關鍵指標

1. **預約統計**
   - 總預約數
   - 完成率
   - 取消率
   - No-show 率

2. **面試官績效**
   - 平均評分
   - 完成預約數
   - 用戶滿意度

3. **時段利用率**
   - 可用時段使用率
   - 熱門時段分析
   - 閒置時段識別

4. **轉換率**
   - 資詢到註冊轉換率
   - 面試通過率
   - 會員升級率

## 🚀 實施計劃

### Phase 1: 核心功能 ✅ 已完成
- [x] 數據模型設計
- [x] API 端點實現
- [x] 權限系統設計
- [x] 衝突檢測邏輯

### Phase 2: 前端界面 (進行中)
- [ ] 管理員時段設定界面
- [ ] 用戶預約選擇界面
- [ ] 面試官管理後台
- [ ] 預約狀態管理

### Phase 3: 通知系統
- [ ] Email 通知模板
- [ ] LINE Bot 整合
- [ ] PWA 推送通知
- [ ] 提醒排程系統

### Phase 4: 進階功能
- [ ] 日曆同步 (Google Calendar, Outlook)
- [ ] 視訊會議整合 (Zoom, Teams)
- [ ] 自動化工作流程
- [ ] 報表分析儀表板

## 🔧 技術實現細節

### 數據庫集合

```javascript
// NeDB 集合
databases = {
  appointments_slots: Datastore<AppointmentSlot>
  appointment_bookings: Datastore<AppointmentBooking>
  interviewers: Datastore<Interviewer>
  availability_overrides: Datastore<AvailabilityOverride>
  appointment_notifications: Datastore<AppointmentNotification>
}
```

### 索引優化

```javascript
// 已創建的索引
appointments_slots: ['interviewerId', 'date', 'type', 'isAvailable']
appointment_bookings: ['userId', 'slotId', 'type', 'status', 'scheduledDate', 'guestInfo.email']
interviewers: ['userId', 'email', 'isActive', 'appointmentTypes']
```

### API 安全

1. **JWT 驗證**: 所有需要權限的端點
2. **權限檢查**: 基於角色的存取控制
3. **資料驗證**: 輸入資料格式驗證
4. **速率限制**: 防止 API 濫用

### 錯誤處理

```typescript
// 標準錯誤回應格式
{
  success: false,
  error: "錯誤訊息",
  code: "ERROR_CODE",
  timestamp: Date.now()
}
```

## 🎯 下一步行動

### 立即任務 (高優先級)
1. **修復預約系統權限缺失** ⚠️ 
   - 添加 appointments:* 和 interviewers:* 權限到原子列表
   - 更新客戶管理角色權限配置

2. **修復面試官創建問題** ⚠️
   - 解決 NeDB 唯一性約束衝突
   - 重新運行種子數據創建

3. **創建預約時段測試數據**
   - 為 3 個面試官創建未來 2 週預約時段
   - 包含資詢和面試兩種類型

### 中期任務
4. **建立前端界面** - 預約選擇和管理界面
5. **整合通知系統** - Email 和 LINE 通知
6. **用戶測試** - Beta 測試和反饋收集

### 權限架構確認 ✅
- 2層4類權限系統已設計完成
- 面試官管理模式已明確：由客戶管理專責，不是系統用戶
- 權責分離清晰：日常營運不觸及面試，客戶管理專責面試相關

---

**更新時間**: 2025-07-15  
**權限架構**: 2層4類管理系統  
**狀態**: 權限系統需要補充預約相關權限  
**負責人**: InfinityMatch 開發團隊