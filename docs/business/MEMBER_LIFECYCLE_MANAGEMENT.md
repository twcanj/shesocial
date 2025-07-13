# SheSocial 會員生命週期管理文件
## 完整會員啟動、票券管理與權限控制系統

---

## 🎯 系統概述

### 核心管理領域
- **會員啟動管理** - 付費、審查、面試、等待期完整流程
- **票券生命週期** - 發放、生效、使用、過期全程追蹤
- **權限動態控制** - 基於會員狀態的即時權限更新
- **狀態同步機制** - 多系統間的數據一致性保證

---

## 🔄 會員完整生命週期

### 會員狀態流程圖
```javascript
const memberLifecycle = {
  // 階段1: 註冊與資料收集
  registration_started: {
    description: "開始註冊流程",
    duration: "無限制",
    permissions: {
      viewEventShowcase: true,
      registerAccount: true,
      completeProfile: true
    },
    nextActions: ["完成進階註冊"]
  },
  
  // 階段2: 資料完成與方案選擇  
  profile_completed: {
    description: "完成3步驟資料收集",
    duration: "7天有效期",
    permissions: {
      viewEventShowcase: true,
      viewPersonalizedRecommendations: true,
      selectMembershipPlan: true
    },
    nextActions: ["選擇會員方案並付費"]
  },
  
  // 階段3: 付費處理
  payment_pending: {
    description: "等待付費完成",
    duration: "24小時超時",
    permissions: {
      viewEventShowcase: true,
      completePayment: true
    },
    nextActions: ["完成付款", "付費超時取消"]
  },
  
  // 階段4: 付費完成
  payment_completed: {
    description: "付費成功，準備面試",
    duration: "14天內必須預約面試",
    permissions: {
      viewEventShowcase: true,
      scheduleInterview: true,
      viewEvents: "僅瀏覽不可報名"
    },
    nextActions: ["預約視訊面試"]
  },
  
  // 階段5: 面試已預約
  interview_scheduled: {
    description: "面試時間已確定",
    duration: "面試日期前",
    permissions: {
      viewEventShowcase: true,
      attendInterview: true,
      rescheduleInterview: "最多1次",
      viewEvents: "僅瀏覽不可報名"
    },
    nextActions: ["參加面試", "重新預約"]
  },
  
  // 階段6: 面試完成等待結果
  interview_completed_pending: {
    description: "面試完成，等待審核結果",
    duration: "2個工作天內出結果",
    permissions: {
      viewEventShowcase: true,
      checkInterviewResult: true,
      viewEvents: "僅瀏覽不可報名"
    },
    nextActions: ["面試通過", "面試失敗"]
  },
  
  // 階段7: 面試通過，開始等待期
  interview_passed_waiting: {
    description: "面試通過，2個月等待期",
    duration: "60天等待期",
    permissions: {
      viewEventShowcase: true,
      viewEvents: "僅瀏覽不可報名",
      purchaseVVIPIntro: true,
      viewVoucherBalance: "票券已發放但未生效"
    },
    voucherStatus: "issued_waiting", // 票券已發放但等待生效
    nextActions: ["等待期結束自動啟動"]
  },
  
  // 階段8: 正式會員(等待期結束)
  member_active: {
    description: "完整會員權限",
    duration: "永久有效(除非暫停)",
    permissions: {
      viewEventShowcase: true,
      joinEvents: true,
      useVouchers: true,
      purchaseVVIPIntro: true,
      viewParticipants: "僅Premium會員",
      viewVVIPIntros: "僅Premium會員"
    },
    voucherStatus: "active", // 票券生效可用
    nextActions: ["參與平台活動", "購買額外服務"]
  },
  
  // 異常狀態
  interview_failed: {
    description: "面試未通過",
    duration: "永久狀態",
    permissions: {
      viewEventShowcase: true,
      requestRefund: true
    },
    nextActions: ["申請退費", "重新申請(6個月後)"]
  },
  
  member_suspended: {
    description: "會員暫停",
    duration: "依據違規情況",
    permissions: {
      viewEventShowcase: true,
      contactSupport: true
    },
    nextActions: ["申訴處理", "帳號恢復"]
  }
}
```

---

## 🎫 票券管理系統

### 票券生命週期詳細設計
```javascript
const voucherLifecycle = {
  // 票券發放邏輯
  issuance: {
    trigger: "面試通過後立即發放",
    timing: "interview_passed_waiting狀態觸發",
    initialStatus: "issued_waiting",
    notification: "發送票券發放通知信"
  },
  
  // 票券生效邏輯
  activation: {
    trigger: "2個月等待期結束",
    timing: "member_active狀態觸發", 
    statusChange: "issued_waiting → active",
    notification: "發送票券可用通知信"
  },
  
  // 票券使用邏輯
  usage: {
    eligibleEvents: ["2day_trip"], // 僅2日遊可用
    usageLimit: "每次活動最多1張票券",
    stackable: false, // 不可疊加使用
    transferable: false, // 不可轉讓
    partialUse: false // 不支援部分使用
  },
  
  // 票券過期邏輯
  expiration: {
    validityPeriod: "用戶選擇(2個月/4個月/半年)",
    calculationFrom: "生效日期開始計算",
    expiryWarning: "過期前7天發送提醒",
    expiredStatus: "expired",
    noRefund: "過期票券不予退費"
  }
}
```

### 票券數據結構
```javascript
const VoucherSchema = {
  _id: "ObjectId",
  userId: "會員ID",
  membershipType: "vip | premium", // 會員等級
  
  // 票券基本資訊
  voucher: {
    type: "100_dollar | 200_dollar",
    value: 100, // 票券面值
    currency: "NT$",
    batchId: "發放批次ID"
  },
  
  // 生命週期狀態
  lifecycle: {
    issuedDate: "2025-01-15T10:00:00Z", // 發放日期(面試通過)
    activationDate: "2025-03-15T10:00:00Z", // 生效日期(等待期結束)
    expiryDate: "2025-05-15T10:00:00Z", // 過期日期(從生效日算起)
    validityPeriod: "2months", // 用戶選擇的有效期
    
    status: "issued_waiting", // issued_waiting, active, used, expired, cancelled
    statusHistory: [
      {
        status: "issued_waiting",
        timestamp: "2025-01-15T10:00:00Z",
        reason: "面試通過後發放"
      }
    ]
  },
  
  // 使用記錄
  usage: {
    used: false,
    usedDate: null,
    eventId: null, // 使用於哪個活動
    originalAmount: null, // 活動原價
    discountAmount: null, // 折扣金額
    finalAmount: null // 最終支付金額
  },
  
  // 限制條件
  restrictions: {
    eligibleEventTypes: ["2day_trip"],
    maxUsagePerEvent: 1,
    transferable: false,
    stackable: false
  },
  
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z"
}
```

---

## ⏰ 等待期管理系統

### 等待期精確計算
```javascript
const waitingPeriodManagement = {
  // 等待期開始計算
  startCalculation: {
    trigger: "面試通過瞬間",
    duration: "60天(2個月)",
    precision: "精確到分鐘",
    timezone: "Asia/Taipei"
  },
  
  // 等待期倒計時
  countdown: {
    displayFormat: "還有 X 天 Y 小時 Z 分鐘",
    updateFrequency: "每小時更新一次",
    milestoneNotifications: [
      "等待期開始(立即)",
      "還有30天(發送提醒)",
      "還有7天(發送提醒)",
      "還有1天(發送提醒)",
      "等待期結束(權限自動開放)"
    ]
  },
  
  // 權限漸進開放
  progressivePermissions: {
    immediate: [
      "購買VVIP介紹服務",
      "查看個人票券餘額(未生效)",
      "瀏覽活動資訊"
    ],
    afterWaiting: [
      "參加活動報名",
      "使用票券折抵",
      "查看參與者名單(Premium會員)",
      "查看VVIP介紹(Premium會員)"
    ]
  }
}
```

### 自動化流程控制
```javascript
const automationRules = {
  // 每日自動檢查任務
  dailyTasks: [
    "檢查等待期到期的會員",
    "自動啟動會員權限",
    "發送等待期倒計時提醒",
    "檢查票券即將過期",
    "處理超時付款取消"
  ],
  
  // 狀態自動轉換
  statusTransitions: {
    "payment_completed + 14天無面試預約": "payment_timeout",
    "interview_passed + 60天": "member_active + voucher_activation",
    "voucher_active + validity_period": "voucher_expired",
    "interview_failed": "refund_processing"
  },
  
  // 異常處理
  exceptionHandling: {
    paymentFailure: "自動回滾到payment_pending狀態",
    interviewNoShow: "標記為面試缺席，允許重新預約1次",
    systemError: "保持當前狀態，記錄錯誤日誌"
  }
}
```

---

## 🔐 權限動態控制系統

### 基於狀態的權限矩陣
```javascript
const dynamicPermissions = {
  // 權限檢查邏輯
  checkPermission: (userId, action) => {
    const user = getUserById(userId)
    const memberStatus = user.membership.status
    const memberType = user.membership.type
    const waitingPeriodExpired = checkWaitingPeriod(user)
    
    return permissionMatrix[memberStatus][action] && 
           (action !== 'joinEvents' || waitingPeriodExpired) &&
           (action !== 'viewParticipants' || memberType === 'premium') &&
           (action !== 'viewVVIPIntros' || memberType === 'premium')
  },
  
  // 權限矩陣
  permissionMatrix: {
    registration_started: {
      viewEventShowcase: true,
      registerAccount: true,
      completeProfile: true
    },
    
    profile_completed: {
      viewEventShowcase: true,
      selectMembershipPlan: true,
      viewRecommendations: true
    },
    
    interview_passed_waiting: {
      viewEventShowcase: true,
      viewEvents: true,
      purchaseVVIPIntro: true,
      viewVoucherBalance: true,
      joinEvents: false // 等待期限制
    },
    
    member_active: {
      viewEventShowcase: true,
      viewEvents: true,
      joinEvents: true,
      useVouchers: true,
      purchaseVVIPIntro: true,
      viewParticipants: "premium_only",
      viewVVIPIntros: "premium_only"
    }
  }
}
```

---

## 📊 管理員控制面板

### 會員狀態儀表板
```javascript
const adminDashboard = {
  // 即時狀態統計
  realTimeStats: {
    totalMembers: "總會員數",
    activeMembers: "活躍會員數",
    waitingMembers: "等待期會員數",
    pendingInterviews: "待面試會員數",
    pendingPayments: "待付費訂單數",
    voucherUtilization: "票券使用率"
  },
  
  // 會員狀態分佈
  statusDistribution: {
    byStatus: "各狀態會員數量分佈",
    byMembershipType: "會員等級分佈",
    byRegistrationDate: "註冊日期分佈",
    byWaitingPeriod: "等待期剩餘時間分佈"
  },
  
  // 異常狀況監控
  alerts: {
    interviewOverdue: "面試預約超時會員",
    paymentTimeout: "付費超時訂單",
    voucherNearExpiry: "即將過期票券",
    suspendedMembers: "暫停會員帳號",
    refundPending: "待處理退費"
  }
}
```

### 批量操作工具
```javascript
const batchOperations = {
  // 會員狀態批量更新
  memberStatus: {
    batchActivate: "批量啟動等待期結束的會員",
    batchSuspend: "批量暫停違規會員",
    batchRefund: "批量處理退費申請",
    batchNotify: "批量發送狀態通知"
  },
  
  // 票券批量管理
  voucherManagement: {
    batchIssue: "批量發放票券",
    batchActivate: "批量啟動票券",
    batchExpire: "批量處理過期票券",
    batchCancel: "批量取消票券"
  },
  
  // 面試排程管理
  interviewScheduling: {
    bulkSchedule: "批量安排面試時段",
    rescheduleConflicts: "解決面試時間衝突",
    sendReminders: "批量發送面試提醒",
    processResults: "批量處理面試結果"
  }
}
```

---

## 🚨 異常處理與恢復

### 系統異常處理
```javascript
const exceptionHandling = {
  // 付費異常
  paymentExceptions: {
    partialPayment: "部分付款處理",
    paymentReverse: "付款撤銷處理",
    duplicatePayment: "重複付款檢測",
    fraudDetection: "詐騙付款識別"
  },
  
  // 面試異常
  interviewExceptions: {
    noShow: "面試缺席處理",
    technicalIssue: "技術問題重新安排",
    interviewerUnavailable: "面試官臨時無法進行",
    equipmentFailure: "設備故障應急處理"
  },
  
  // 系統異常
  systemExceptions: {
    dataInconsistency: "數據不一致修復",
    statusSyncFailure: "狀態同步失敗恢復",
    automationFailure: "自動化流程失敗處理",
    permissionError: "權限檢查錯誤修復"
  }
}
```

---

## 📈 業務指標追蹤

### 關鍵績效指標
```javascript
const businessMetrics = {
  // 轉換率指標
  conversionMetrics: {
    registrationToPayment: "註冊到付費轉換率",
    paymentToInterview: "付費到面試完成率",
    interviewPassRate: "面試通過率",
    waitingToActive: "等待期到活躍會員轉換率"
  },
  
  // 會員參與指標
  engagementMetrics: {
    voucherUsageRate: "票券使用率",
    eventParticipationRate: "活動參與率",
    vvipServicePurchase: "VVIP服務購買率",
    memberRetentionRate: "會員留存率"
  },
  
  // 營運效率指標
  operationalMetrics: {
    averageActivationTime: "平均會員啟動時間",
    interviewSchedulingEfficiency: "面試安排效率",
    refundProcessingTime: "退費處理時間",
    customerSatisfactionScore: "客戶滿意度評分"
  }
}
```

---

## 🔧 技術實現架構

### 後端服務設計
```javascript
const backendServices = {
  // 會員生命週期服務
  MemberLifecycleService: {
    statusTransition: "處理會員狀態轉換",
    permissionUpdate: "動態更新會員權限",
    automationRules: "執行自動化業務規則",
    exceptionHandling: "處理各種異常情況"
  },
  
  // 票券管理服務
  VoucherManagementService: {
    issuance: "票券發放邏輯",
    activation: "票券生效處理",
    usage: "票券使用驗證",
    expiration: "票券過期管理"
  },
  
  // 等待期管理服務
  WaitingPeriodService: {
    calculation: "等待期精確計算",
    monitoring: "等待期狀態監控",
    notification: "等待期提醒通知",
    autoActivation: "自動啟動處理"
  }
}
```

### 定時任務設計
```javascript
const scheduledTasks = {
  // 每小時執行
  hourlyTasks: [
    "更新等待期倒計時",
    "檢查票券即將過期",
    "處理自動狀態轉換"
  ],
  
  // 每日執行
  dailyTasks: [
    "啟動等待期結束的會員",
    "處理過期票券",
    "發送每日提醒通知",
    "生成業務指標報表"
  ],
  
  // 每週執行
  weeklyTasks: [
    "會員狀態健康檢查",
    "數據一致性驗證",
    "系統性能優化",
    "業務趨勢分析"
  ]
}
```

---

*最後更新: 2025-07-13*  
*版本: 1.0*  
*狀態: 完整生命週期設計完成 ✅*

**重要里程碑**: 建立完整的會員生命週期管理系統，涵蓋從註冊到正式啟動的全流程，整合票券管理、等待期控制、權限動態更新，為平台運營提供完整的會員管理解決方案。