# 預約系統 API 文檔

## 🎯 概述

InfinityMatch 預約系統提供完整的預約管理功能，支援兩種預約類型：
- **資詢預約 (consultation)**: 潛在會員諮詢平台服務
- **會員面試預約 (member_interview)**: 現有會員 30 分鐘視訊面試

## 🔐 權限架構

### 2層4類權限系統
```
第一層 (最高權限)：
├── super_admin (總管理員) - 所有權限 (*)
└── system_admin (系統維護員) - 所有權限 (*)

第二層 (日常營運)：
├── operation_admin (日常營運) - 內容+活動管理，不觸及面試
└── customer_admin (客戶管理) - 面試+面試官+預約+付費+VIP
```

### 預約系統權限
```javascript
// 客戶管理專用權限 (customer_admin)
'appointments:view'      // 查看預約
'appointments:create'    // 創建時段
'appointments:edit'      // 編輯預約
'appointments:delete'    // 刪除預約
'appointments:manage'    // 管理預約系統
'appointments:export'    // 匯出預約數據
'interviewers:view'      // 查看面試官
'interviewers:create'    // 創建面試官
'interviewers:edit'      // 編輯面試官
'interviewers:delete'    // 刪除面試官
'interviewers:manage'    // 管理面試官資源
'interviewers:schedule'  // 面試官排程管理
```

## 📋 API 端點總覽

### 面試官管理 (Interviewers)
```
GET    /api/appointments/interviewers           # 查看面試官列表
POST   /api/appointments/interviewers           # 創建面試官
GET    /api/appointments/interviewers/:id       # 查看特定面試官
PUT    /api/appointments/interviewers/:id       # 更新面試官
DELETE /api/appointments/interviewers/:id       # 刪除面試官
```

### 預約時段管理 (Appointment Slots)
```
GET    /api/appointments/slots                  # 查看預約時段
POST   /api/appointments/slots                  # 創建預約時段
GET    /api/appointments/slots/:id              # 查看特定時段
PUT    /api/appointments/slots/:id              # 更新預約時段
DELETE /api/appointments/slots/:id              # 刪除預約時段
POST   /api/appointments/slots/bulk             # 批量創建時段
GET    /api/appointments/slots/availability     # 查看可用時段
```

### 預約記錄管理 (Appointment Bookings)
```
GET    /api/appointments/bookings               # 查看預約記錄
POST   /api/appointments/bookings               # 創建預約
GET    /api/appointments/bookings/:id           # 查看特定預約
PUT    /api/appointments/bookings/:id           # 更新預約
DELETE /api/appointments/bookings/:id           # 取消預約
POST   /api/appointments/bookings/:id/reschedule # 重新安排預約
```

### 統計報表
```
GET    /api/appointments/analytics              # 預約統計分析
GET    /api/appointments/reports/export         # 匯出預約報表
```

## 🎯 面試官管理 API

### 創建面試官
```http
POST /api/appointments/interviewers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "王美玲",
  "title": "資深情感諮詢師",
  "email": "wangmeiling@infinitymatch.tw",
  "phone": "02-2345-6789",
  "appointmentTypes": ["consultation", "member_interview"],
  "interviewTypes": ["video_call", "phone_call"],
  "languages": ["zh-TW", "en"],
  "specialties": ["luxury_dating", "relationship_coaching"],
  "defaultAvailability": {
    "monday": {
      "enabled": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breakTimes": [{"startTime": "12:00", "endTime": "13:00"}]
    }
  },
  "maxDailyAppointments": 8,
  "bufferTimeMinutes": 15,
  "advanceBookingDays": 30,
  "autoApproval": true
}
```

**權限要求**: `interviewers:create` (customer_admin 專用)

**回應**:
```json
{
  "success": true,
  "data": {
    "_id": "interviewer-123",
    "name": "王美玲",
    "title": "資深情感諮詢師",
    "isActive": true,
    "totalAppointments": 0,
    "createdAt": "2025-07-15T10:00:00.000Z"
  }
}
```

### 查看面試官列表
```http
GET /api/appointments/interviewers?active=true&specialty=luxury_dating
Authorization: Bearer <admin_token>
```

**權限要求**: `interviewers:view`

**回應**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "interviewer-123",
      "name": "王美玲",
      "title": "資深情感諮詢師",
      "specialties": ["luxury_dating", "relationship_coaching"],
      "isActive": true,
      "totalAppointments": 45,
      "averageRating": 4.8
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10
  }
}
```

## ⏰ 預約時段管理 API

### 創建預約時段
```http
POST /api/appointments/slots
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "interviewerId": "interviewer-123",
  "appointmentType": "member_interview",
  "startTime": "2025-07-20T10:00:00.000Z",
  "endTime": "2025-07-20T10:30:00.000Z",
  "maxBookings": 1,
  "isRecurring": false,
  "recurringPattern": null,
  "notes": "30分鐘會員面試時段"
}
```

**權限要求**: `appointments:create` (customer_admin 專用)

### 批量創建預約時段
```http
POST /api/appointments/slots/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "interviewerId": "interviewer-123",
  "appointmentType": "member_interview",
  "dateRange": {
    "startDate": "2025-07-20",
    "endDate": "2025-07-26"
  },
  "timeSlots": [
    {"startTime": "09:00", "endTime": "09:30"},
    {"startTime": "10:00", "endTime": "10:30"},
    {"startTime": "14:00", "endTime": "14:30"}
  ],
  "excludeDates": ["2025-07-24"], // 排除週三
  "notes": "週次批量時段"
}
```

### 查看可用預約時段
```http
GET /api/appointments/slots/availability?type=member_interview&date=2025-07-20&interviewerId=interviewer-123
```

**權限要求**: 無 (公開 API，供前端預約表單使用)

**回應**:
```json
{
  "success": true,
  "data": [
    {
      "slotId": "slot-456",
      "startTime": "2025-07-20T10:00:00.000Z",
      "endTime": "2025-07-20T10:30:00.000Z",
      "interviewerName": "王美玲",
      "available": true,
      "bookingsCount": 0,
      "maxBookings": 1
    }
  ]
}
```

## 📋 預約記錄管理 API

### 創建預約
```http
POST /api/appointments/bookings
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "slotId": "slot-456",
  "appointmentType": "member_interview",
  "contactInfo": {
    "name": "張俊豪",
    "email": "member1@infinitymatch.tw",
    "phone": "0912-345-678"
  },
  "preferences": {
    "interviewType": "video_call",
    "language": "zh-TW"
  },
  "notes": "希望討論配對偏好",
  "reminderPreferences": {
    "email": true,
    "sms": false,
    "timings": ["1_day_before", "1_hour_before"]
  }
}
```

**權限要求**: 
- 會員面試: `membership.permissions.bookInterview = true`
- 資詢預約: 無 (開放給潛在會員)

### 查看預約記錄
```http
GET /api/appointments/bookings?userId=user-123&status=confirmed&startDate=2025-07-15
Authorization: Bearer <admin_token>
```

**權限要求**: `appointments:view`

### 重新安排預約
```http
POST /api/appointments/bookings/booking-789/reschedule
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "newSlotId": "slot-999",
  "reason": "面試官時間調整",
  "notifyUser": true
}
```

## 📊 統計分析 API

### 預約統計
```http
GET /api/appointments/analytics?period=week&interviewerId=interviewer-123
Authorization: Bearer <admin_token>
```

**權限要求**: `appointments:view`

**回應**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBookings": 45,
      "completedBookings": 38,
      "cancelledBookings": 7,
      "averageRating": 4.8,
      "utilizationRate": 0.85
    },
    "byType": {
      "consultation": 12,
      "member_interview": 33
    },
    "byStatus": {
      "confirmed": 25,
      "completed": 38,
      "cancelled": 7,
      "rescheduled": 3
    },
    "timeline": [
      {
        "date": "2025-07-15",
        "bookings": 5,
        "completed": 4
      }
    ]
  }
}
```

### 匯出報表
```http
GET /api/appointments/reports/export?format=csv&startDate=2025-07-01&endDate=2025-07-31
Authorization: Bearer <admin_token>
```

**權限要求**: `appointments:export`

## 🚨 錯誤處理

### 常見錯誤代碼
```javascript
// 權限錯誤
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "需要 appointments:create 權限",
  "statusCode": 403
}

// 時間衝突
{
  "success": false,
  "error": "TIME_CONFLICT",
  "message": "該時段已被預約",
  "details": {
    "conflictingBooking": "booking-456",
    "suggestedSlots": ["slot-789", "slot-890"]
  },
  "statusCode": 409
}

// 預約已滿
{
  "success": false,
  "error": "SLOT_FULL",
  "message": "該時段預約已滿",
  "statusCode": 410
}

// 面試官不可用
{
  "success": false,
  "error": "INTERVIEWER_UNAVAILABLE",
  "message": "面試官在該時段不可用",
  "statusCode": 422
}
```

## 🔄 業務流程

### 會員面試預約流程
1. **用戶查看可用時段** - `GET /slots/availability`
2. **創建預約** - `POST /bookings` (需要 `bookInterview` 權限)
3. **系統發送確認通知** - 自動觸發
4. **面試官接收通知** - Email 到面試官聯絡信箱
5. **預約提醒** - 根據用戶偏好發送
6. **面試完成** - 管理員更新狀態
7. **評價回饋** - 可選

### 資詢預約流程
1. **潛在會員查看時段** - 公開 API
2. **填寫預約表單** - 包含聯絡資訊
3. **系統創建待確認預約**
4. **客戶管理確認預約** - 人工審核
5. **發送確認通知**
6. **進行資詢會談**

## 🎯 面試官管理特點

### 管理模式
- **面試官定位**: 被管理的資源，不是系統用戶
- **登入權限**: 面試官無系統登入帳戶
- **管理權責**: 由客戶管理人員 (customer_admin) 專責維護
- **聯絡方式**: 僅保留聯絡用信箱，非登入帳戶

### 工作流程
1. **客戶管理** 創建和維護面試官資源
2. **客戶管理** 設定面試官可預約時段
3. **客戶管理** 安排面試流程和管理
4. **系統自動** 發送通知到面試官聯絡信箱
5. **日常營運** 專注內容和活動，不涉及面試

## 🏥 系統健康監控

### Health Check API
```http
GET /health
```

**用途**: 監控系統和資料庫狀態，適用於負載均衡器和運維監控

**回應範例**:
```json
{
  "success": true,
  "message": "SheSocial Backend is healthy",
  "timestamp": 1752545736248,
  "environment": "development",
  "version": "1.0.0", 
  "uptime": 71.988,
  "memory": {
    "used": 148,
    "total": 150,
    "rss": 240
  },
  "database": {
    "status": "connected",
    "dataPath": "/server/data",
    "collections": {
      "users": 6,
      "appointments_slots": 920,
      "interviewers": 6,
      "appointment_bookings": 0
    },
    "files": [
      {
        "name": "appointments-slots.db",
        "size": 508,
        "modified": "2025-07-15T02:14:27.032Z"
      }
    ],
    "totalFiles": 9,
    "r2Ready": true
  }
}
```

**監控指標**:
- **伺服器健康**: 記憶體使用量、運行時間
- **資料庫狀態**: 連線狀態、集合記錄數
- **檔案系統**: 資料庫檔案大小和修改時間  
- **R2整合**: 雲端同步準備狀態

**運維用途**:
- 負載均衡器健康檢查
- 監控系統警報設定
- 容量規劃分析
- 資料庫備份監控

---

**API 版本**: v1.0  
**最後更新**: 2025-07-15  
**權限架構**: 2層4類管理系統  
**核心原則**: 客戶管理專責面試，權責分離