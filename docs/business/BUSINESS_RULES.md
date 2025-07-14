# InfinityMatch 天造地設人成對 業務規則文件
## 三大內容模塊、會員制度與服務管理規範

> **重要更新**: 2025年實施三大內容模塊架構 - VVIPIntro、EventManagement、EventShowcase，建立分層權限與內容管理系統

---

## 💎 會員等級與定價

### 會員方案與權限系統
```javascript
const membershipTiers = {
  visitor: {
    name: "訪客",
    cost: 0,
    currency: "NT$",
    benefits: ["瀏覽活動資訊", "查看精彩活動集"],
    activityLimit: 3, // 最多只能看3個活動
    activityLimitEnforcement: "強制限制，超過3個活動後無法查看更多",
    upgradePrompt: "瀏覽更多活動需要註冊會員",
    permissions: {
      joinEvents: false, // 不能參加活動
      viewParticipants: false,
      viewVVIPIntros: false,
      purchaseVVIPIntro: false,
      viewEventShowcase: true // 可瀏覽精彩活動集
    }
  },
  
  registered: {
    name: "註冊會員",
    cost: 0,
    currency: "NT$", 
    benefits: ["免費註冊", "瀏覽活動資訊", "查看精彩活動集", "個人資料管理"],
    activityLimit: 12, // 最多只能看12個活動
    activityLimitEnforcement: "強制限制，超過12個活動後無法查看更多",
    upgradePrompt: "查看無限活動和參加活動需要升級為付費會員",
    permissions: {
      joinEvents: false, // 不能參加活動
      viewParticipants: false,
      viewVVIPIntros: false,
      purchaseVVIPIntro: false,
      viewEventShowcase: true // 可瀏覽精彩活動集
    }
  },
  
  vip: {
    name: "VIP會員", 
    cost: 1300,
    currency: "NT$",
    benefits: ["無限活動瀏覽", "優先報名", "票券折抵", "專業客服"],
    activityLimit: "unlimited", // 無限制活動瀏覽
    waitingPeriod: "付費後2個月才能參加活動",
    permissions: {
      joinEvents: "2個月等待期後",
      viewParticipants: false,
      viewVVIPIntros: false,
      purchaseVVIPIntro: true,
      viewEventShowcase: true
    },
    vouchers: {
      "100_dollar": 2, // NT$100票券 x 2張
      "200_dollar": 1, // NT$200票券 x 1張
      total_value: 400
    }
  },
  
  vvip: {
    name: "VVIP會員",
    cost: 2500,
    currency: "NT$", 
    benefits: ["無限活動瀏覽", "最高優先權", "查看參與者名單", "專屬服務", "最多票券"],
    activityLimit: "unlimited", // 無限制活動瀏覽
    waitingPeriod: "付費後2個月才能參加活動",
    permissions: {
      joinEvents: "2個月等待期後",
      viewParticipants: true, // 唯一可查看參與者的方案
      viewVVIPIntros: true, // 唯一可查看VVIP介紹的方案
      purchaseVVIPIntro: true,
      viewEventShowcase: true
    },
    vouchers: {
      "100_dollar": 5, // NT$100票券 x 5張
      "200_dollar": 4, // NT$200票券 x 4張  
      total_value: 1300
    }
  }
}
```

---

## 👁️ 活動瀏覽限制規則 (重要業務規則) ✅ **已實現**

### 會員等級活動瀏覽限制 ✅ **前端實現完成**
```javascript
const activityViewingLimits = {
  enforcement: {
    visitor: {
      limit: 3,
      description: "訪客最多只能瀏覽3個活動",
      implementation: "frontend強制限制，超過3個後隱藏其他活動",
      upgradeMessage: "想要瀏覽更多活動？請註冊成為會員！",
      technicalImplementation: "EventList.tsx中使用array.slice(0, 3)限制顯示"
    },
    
    registered: {
      limit: 12,
      description: "註冊會員最多只能瀏覽12個活動", 
      implementation: "frontend強制限制，超過12個後隱藏其他活動",
      upgradeMessage: "想要無限瀏覽活動並參加活動？請升級為付費會員！",
      technicalImplementation: "EventList.tsx中使用array.slice(0, 12)限制顯示"
    },
    
    vip: {
      limit: "unlimited",
      description: "VIP會員可以瀏覽所有活動",
      implementation: "無限制瀏覽",
      benefits: "無限活動瀏覽 + 可參加活動(2個月等待期後)"
    },
    
    vvip: {
      limit: "unlimited", 
      description: "VVIP會員可以瀏覽所有活動",
      implementation: "無限制瀏覽",
      benefits: "無限活動瀏覽 + 可參加活動(2個月等待期後) + 查看參與者名單"
    }
  },
  
  businessLogic: {
    purpose: "限制免費用戶過度瀏覽，促進付費轉換",
    conversionStrategy: "階段式限制，逐步引導用戶升級",
    userExperience: "在達到限制時顯示升級提示，而非完全阻擋",
    retentionStrategy: "註冊會員仍有12個活動瀏覽額度，維持一定使用價值"
  },
  
  technicalImplementation: {
    location: "client/src/components/events/EventList.tsx:121-138",
    method: "switch語句根據membership.type進行array.slice()限制",
    fallback: "未登入或無效membership預設為visitor限制(3個活動)",
    userFeedback: "當接近或達到限制時，顯示相應的升級提示訊息"
  }
}
```

### 活動瀏覽升級流程
```javascript
const viewingUpgradeFlow = {
  visitor_to_registered: {
    trigger: "達到3個活動瀏覽限制",
    action: "顯示註冊提示",
    benefit: "註冊後可瀏覽12個活動",
    conversion_rate_target: "60%"
  },
  
  registered_to_paid: {
    trigger: "達到12個活動瀏覽限制",
    action: "顯示付費會員升級提示",
    benefit: "無限瀏覽 + 參加活動權限",
    conversion_rate_target: "25%"
  },
  
  upgrade_messaging: {
    visitor_limit_reached: "您已瀏覽3個活動的限制。註冊會員可瀏覽12個活動！",
    registered_limit_reached: "您已瀏覽12個活動的限制。升級付費會員享受無限瀏覽和參加活動！",
    upgrade_cta: "立即升級",
    benefits_highlight: "強調無限瀏覽和活動參與價值"
  }
}
```

---

## 🎯 三大內容模塊權限架構

### 模塊權限分級
```javascript
const modulePermissions = {
  EventShowcase: {
    name: "精彩活動集",
    description: "已結束活動的宣傳展示",
    accessLevel: "完全開放",
    permissions: {
      view: "所有人(包含訪客)可瀏覽",
      share: "支援社群分享，SEO友好",
      manage: "僅管理員可策展管理"
    },
    businessPurpose: "營銷引流，提升註冊轉換率"
  },
  
  EventManagement: {
    name: "活動管理",
    description: "活動創建、報名與參與者管理", 
    accessLevel: "會員限定",
    permissions: {
      view: "所有用戶可瀏覽活動資訊",
      participate: "付費會員(2個月等待期後)可報名參與",
      viewParticipants: "僅Premium會員可查看參與者名單",
      manage: "僅管理員可管理活動"
    },
    businessPurpose: "核心服務，會員留存關鍵"
  },
  
  VVIPIntro: {
    name: "VVIP會員介紹",
    description: "高端個人介紹製作與展示服務",
    accessLevel: "VVIP專屬",
    permissions: {
      purchase: "所有付費會員可購買製作服務(NT$1,500)",
      viewOwn: "介紹所有者可查看自己的",
      viewOthers: "僅Premium會員可查看其他人的介紹",
      manage: "僅管理員可管理製作流程"
    },
    businessPurpose: "高端服務差異化，直接收費模式"
  }
}
```

---

## 📅 活動排程規則

### 活動頻率與類型
```javascript
const activitySchedule = {
  cycle: "3個月",
  frequency: "每兩個禮拜一場",
  totalEvents: 6, // 3個月內共6場
  
  eventTypes: {
    "1day_trip": {
      count: 4, // 4場一日遊
      description: "一日遊活動"
    },
    "4hour_dining": {
      count: 2, // 可能包含在一日遊中
      description: "4小時餐會"
    },
    "2day_trip": {
      count: 2, // 2場二日遊
      description: "二日遊活動",
      voucherEligible: true // 可使用票券折抵
    }
  }
}
```

### 票券使用規則
```javascript
const voucherRules = {
  eligibleEvents: ["2day_trip"], // 僅2日遊可用票券
  
  discountStructure: {
    "100_voucher": 100, // $100票券折抵$100
    "200_voucher": 200  // $200票券折抵$200
  },
  
  expiryOptions: {
    "2months": 60,  // 2個月 = 60天
    "4months": 120, // 4個月 = 120天  
    "6months": 180  // 半年 = 180天
  },
  
  usageLimit: {
    perEvent: 1, // 每場活動最多用1張票券
    stackable: false // 票券不可疊加使用
  }
}
```

---

## 👥 參與者查看權限

### 參與者查看權限系統
```javascript
const participantViewPermissions = {
  // 基本用戶（免費）
  basic: {
    canView: false,
    reason: "基本用戶無查看參與者權限",
    alternative: "可升級為付費會員獲得查看權限"
  },
  
  // VIP付費會員 (NT$1300)
  vip: {
    canView: true,
    scope: "完整參與者名單", 
    includes: ["姓名", "年齡", "職業", "興趣", "照片"],
    reason: "VIP會員享有查看參與者權限"
  },
  
  // Premium付費會員 (NT$2500)
  premium: {
    canView: true,
    scope: "完整參與者名單",
    includes: ["姓名", "年齡", "職業", "興趣", "照片", "詳細資料"],
    reason: "Premium會員享有查看參與者權限",
    additionalFeatures: ["優先客服", "專屬服務"]
  }
}
```

### 後台管理功能
```javascript
const adminFeatures = {
  participantManagement: {
    viewAllParticipants: true,
    exportParticipantList: true,
    sendNotifications: true,
    description: "後台可抓取會員資料放在一頁上看到全部參加的人"
  },
  
  notificationSystem: {
    autoSend: true,
    triggers: ["活動確認", "活動提醒", "活動變更"],
    channels: ["email", "LINE"],
    description: "發會員參加通知信"
  }
}
```

---

## 🎥 會員審核流程

### 視訊面試規則
```javascript
const interviewProcess = {
  requirement: "所有付費會員必須完成視訊面試",
  duration: 30, // 半小時
  format: "一對一視訊通話",
  
  process: {
    step1: "會員完成進階註冊（3步驟資料收集）",
    step2: "系統生成銷售機會並推薦最適方案", 
    step3: "會員選擇方案並完成付費",
    step4: "預約視訊面試時間",
    step5: "進行30分鐘視訊面試",
    step6: "面試官評估並決定通過/拒絕",
    step7: "面試通過後開始2個月等待期",
    step8: "等待期滿後可參加活動"
  },
  
  criteria: [
    "身份驗證",
    "個人背景確認", 
    "參與動機評估",
    "平台規則理解"
  ],
  
  outcome: {
    pass: "獲得會員權限，開始2個月等待期",
    fail: "退費並取消會員資格"
  },
  
  additionalServices: {
    vvipIntroService: "面試通過後可購買VVIP介紹製作服務",
    description: "平台主動提供的專業介紹製作，非會員申請服務"
  }
}
```

---

## 🎯 銷售優化註冊流程 (NEW)

### 進階註冊流程
```javascript
const enhancedRegistrationFlow = {
  philosophy: "資料優先，付費其次 - 最大化銷售機會追蹤",
  
  step1_accountBasics: {
    required: ["email", "password", "confirmPassword"],
    salesTracking: ["leadSource", "agreeToTerms", "agreeToMarketing"],
    leadSources: ["website", "social_media", "referral", "advertisement", "other"]
  },
  
  step2_personalInfo: {
    required: ["name", "age", "location", "phone"],
    optional: ["occupation", "interests"],
    purpose: "建立完整的客戶檔案，用於個人化推薦"
  },
  
  step3_preferences: {
    required: ["membershipInterest", "expectations"],
    optional: ["referralCode"],
    output: "個人化方案推薦與價格優惠"
  }
}
```

### 銷售機會管理
```javascript
const salesLeadSystem = {
  automaticCreation: {
    trigger: "完成步驟2個人資料",
    conversionProbability: 75, // 完成資料的用戶轉換率
    estimatedValue: "根據選擇的會員方案計算",
    leadScoring: "年齡、地區、職業、興趣綜合評分"
  },
  
  personalizedRecommendations: {
    ageBasedScoring: {
      "25-35": "premium_1300方案 +30分，premium_2500方案 +20分",
      "35+": "premium_2500方案 +40分，VIP方案 +30分", 
      "<25": "regular方案 +30分，VIP方案 +20分"
    },
    
    locationBasedScoring: {
      "台北市,新北市": "premium_2500方案 +25分（重視查看參與者功能）"
    },
    
    occupationBasedScoring: {
      "醫師,律師,主管": "premium_2500方案 +35分",
      "工程師,設計師": "premium_1300方案 +30分"
    }
  },
  
  discountManagement: {
    referralDiscount: 10, // 朋友推薦10%折扣
    sundaySpecial: 10,    // 週日限時10%折扣
    validityPeriod: 7     // 優惠7天有效
  }
}
```

### 會員狀態進程 (完整生命週期)
```javascript
const membershipStatusProgression = {
  // 註冊階段
  registration_started: {
    description: "開始註冊流程",
    permissions: ["瀏覽精彩活動集", "完成個人資料"],
    nextAction: "完成進階註冊",
    timeout: "無限制"
  },
  
  profile_completed: {
    description: "資料收集完成，銷售機會已建立",
    permissions: ["查看個人化推薦", "選擇會員方案"],
    nextAction: "選擇會員方案付費",
    timeout: "7天優惠期"
  },
  
  // 付費階段
  payment_pending: {
    description: "準備付費流程",
    permissions: ["完成付款"],
    nextAction: "完成付款",
    timeout: "24小時自動取消"
  },
  
  payment_completed: {
    description: "付費完成，準備面試",
    permissions: ["預約面試", "瀏覽活動(不可報名)"],
    nextAction: "預約視訊面試",
    timeout: "14天內必須預約"
  },
  
  // 面試階段
  interview_scheduled: {
    description: "面試已預約",
    permissions: ["參加面試", "重新預約(限1次)"],
    nextAction: "參加視訊面試",
    timeout: "面試日期前"
  },
  
  interview_completed_pending: {
    description: "面試完成，等待結果",
    permissions: ["查看面試結果"],
    nextAction: "等待審核結果",
    timeout: "2個工作天內出結果"
  },
  
  // 等待期階段
  interview_passed_waiting: {
    description: "面試通過，2個月等待期",
    permissions: [
      "購買VVIP介紹服務",
      "查看票券餘額(未生效)",
      "瀏覽活動(不可報名)"
    ],
    ticketStatus: "已發放，等待生效",
    nextAction: "等待期結束自動啟動",
    duration: "60天等待期"
  },
  
  // 正式會員階段
  member_active: {
    description: "正式會員，完整權限",
    permissions: [
      "參加活動報名",
      "使用票券折抵",
      "購買VVIP介紹服務",
      "查看參與者名單(僅Premium)",
      "查看VVIP介紹(僅Premium)"
    ],
    ticketStatus: "生效可用",
    nextAction: "參與平台活動",
    duration: "永久有效"
  },
  
  // 異常狀態
  interview_failed: {
    description: "面試未通過",
    permissions: ["申請退費"],
    nextAction: "申請退費或重新申請(6個月後)",
    refundPolicy: "全額退費"
  },
  
  payment_timeout: {
    description: "付費或面試預約超時",
    permissions: ["重新開始流程"],
    nextAction: "重新選擇方案付費",
    cleanup: "清理未完成訂單"
  },
  
  member_suspended: {
    description: "會員帳號暫停",
    permissions: ["聯絡客服申訴"],
    nextAction: "申訴處理",
    duration: "依據違規情況"
  }
}
```

---

## 💰 支付與退費規則

### 支付方式優先級
```javascript
const paymentMethods = {
  primary: "LINE Pay", // 主要支付方式
  secondary: ["Apple Pay", "Google Pay"], // 行動支付
  backup: "ECPay", // 信用卡處理
  future: "街口支付" // 未來擴展
}
```

### 退費政策
```javascript
const refundPolicy = {
  interviewFail: {
    refundRate: 100,
    timeframe: "7個工作天",
    method: "原支付方式退回"
  },
  
  voucherExpiry: {
    refundRate: 0,
    reason: "票券過期不予退費"
  },
  
  eventCancellation: {
    byPlatform: {
      refundRate: 100,
      alternative: "轉換為等值票券"
    },
    byUser: {
      refundRate: 50, // 扣除手續費
      timeframe: "活動前48小時"
    }
  }
}
```

---

## 📊 數據追蹤與分析

### 關鍵指標
```javascript
const kpiTracking = {
  membership: {
    registrationConversionRate: "基本註冊到進階註冊轉換率",
    profileCompletionRate: "資料完成率", 
    paymentConversionRate: "資料完成到付費轉換率",
    retentionRate: "會員續費率",
    upgradeRate: "方案升級率"
  },
  
  salesOptimization: {
    leadQuality: "銷售機會品質評分",
    recommendationAccuracy: "個人化推薦準確率",
    discountEffectiveness: "優惠券使用效果",
    followUpSuccess: "後續追蹤成功率"
  },
  
  vouchers: {
    utilizationRate: "票券使用率",
    expiryRate: "票券過期率",
    revenueImpact: "票券對營收影響"
  },
  
  events: {
    participationRate: "活動參與率",
    satisfactionScore: "活動滿意度",
    repeatAttendance: "重複參與率"
  }
}
```

---

## 🔒 隱私與安全規則

### 參與者資料保護
```javascript
const privacyRules = {
  dataAccess: {
    premium_2500: {
      canView: ["基本資料", "興趣愛好", "活動照片"],
      cannotView: ["聯絡方式", "住址", "收入資料"]
    }
  },
  
  dataRetention: {
    activeMembers: "無限期保存",
    inactiveMembers: "2年後匿名化",
    cancelledMembers: "立即刪除個人資料"
  },
  
  consentManagement: {
    profileSharing: "需明確同意才可被其他會員查看",
    photoUsage: "需同意才可用於平台宣傳",
    dataProcessing: "符合個資法規範"
  }
}
```

---

---

## 🚀 CRM整合與後續追蹤

### 銷售資料結構
```javascript
const crmIntegrationData = {
  leadInformation: {
    basicData: ["姓名", "電話", "email", "年齡", "地區"],
    preferenceData: ["會員興趣", "伴侶期望", "職業", "興趣愛好"],
    salesData: ["來源管道", "轉換機率", "預估價值", "推薦方案"]
  },
  
  automationTriggers: {
    profileCompleted: "發送個人化推薦email",
    paymentPending: "24小時後發送提醒",
    paymentCompleted: "發送面試預約連結",
    interviewScheduled: "面試前1天發送提醒",
    interviewCompleted: "開放媒體上傳通知"
  },
  
  taiwanCRMReady: {
    dataFormat: "結構化JSON格式，相容台灣主流CRM系統",
    leadScoring: "1-100分評分制度",
    contactHistory: "完整接觸記錄追蹤",
    conversionTracking: "漏斗分析數據完整"
  }
}
```

### 行銷自動化支援
```javascript
const marketingAutomation = {
  emailSequences: {
    welcome: "歡迎信件與平台介紹",
    recommendation: "個人化方案推薦",
    payment_reminder: "付費提醒與優惠資訊",
    interview_prep: "面試準備與注意事項",
    onboarding: "新會員引導流程"
  },
  
  segmentation: {
    byAge: "年齡層分群行銷",
    byLocation: "地區性活動推廣", 
    byMembershipType: "方案別專屬內容",
    byEngagement: "參與度分級溝通"
  },
  
  retargeting: {
    incomplete_registration: "未完成註冊用戶再行銷",
    payment_abandoned: "付費中斷用戶挽回",
    inactive_members: "不活躍會員重新激活"
  }
}
```

---

---

## 🎫 票券管理系統規則

### 票券生命週期管理
```javascript
const voucherLifecycleRules = {
  // 發放規則
  issuance: {
    trigger: "面試通過後立即發放",
    timing: "interview_passed_waiting狀態觸發",
    initialStatus: "issued_waiting",
    notification: "發送票券發放確認信"
  },
  
  // 生效規則  
  activation: {
    trigger: "2個月等待期結束",
    timing: "member_active狀態觸發",
    statusChange: "issued_waiting → active",
    notification: "發送票券可用通知信"
  },
  
  // 使用規則
  usage: {
    eligibleEvents: ["2day_trip"], // 僅2日遊活動可用
    usageLimit: 1, // 每次活動最多1張
    stackable: false, // 不可疊加使用
    transferable: false, // 不可轉讓
    partialUse: false // 不支援部分使用
  },
  
  // 過期規則
  expiration: {
    validityOptions: ["2個月", "4個月", "半年"], // 用戶購買時選擇
    calculationFrom: "生效日期開始計算",
    warningPeriod: "過期前7天發送提醒",
    expiredHandling: "自動標記為過期，不予退費"
  }
}
```

### 票券發放數量表
```javascript
const voucherAllocation = {
  vip_member: {
    membershipFee: 1300,
    vouchers: {
      "100_dollar": 2, // NT$100 x 2張
      "200_dollar": 1, // NT$200 x 1張
      total_value: 400
    },
    costEffectiveness: "實際價值NT$1,700"
  },
  
  premium_member: {
    membershipFee: 2500,
    vouchers: {
      "100_dollar": 5, // NT$100 x 5張
      "200_dollar": 4, // NT$200 x 4張
      total_value: 1300
    },
    costEffectiveness: "實際價值NT$3,800"
  }
}
```

## 🏗️ **統一內容管理系統 (CMS) 架構**

### **CMS 核心設計理念**
```javascript
const unifiedCMSArchitecture = {
  concept: "單一CMS支撐三大業務系統",
  systems: [
    "面試預約系統 (Interview Management)",
    "VVIP介紹系統 (VVIP Intro Service)", 
    "活動管理系統 (Event Management)",
    "精彩活動集 (Event Showcase)"
  ],
  benefits: [
    "統一內容審核流程",
    "共享媒體資源庫",
    "一致的用戶體驗",
    "降低開發維護成本"
  ]
}
```

### **CMS 統一功能模組**
```javascript
const cmsUnifiedModules = {
  // 核心內容管理
  contentManagement: {
    mediaLibrary: "統一媒體資源庫 (照片、影片、文檔)",
    contentEditor: "富文本編輯器 (支援所有內容類型)",
    templateSystem: "內容模板系統 (面試、VVIP、活動)",
    versionControl: "內容版本控制和歷史記錄"
  },
  
  // 審核工作流程
  moderationWorkflow: {
    universalQueue: "統一審核佇列 (所有內容類型)",
    approvalProcess: "多級審核流程 (初審、複審、終審)",
    statusTracking: "內容狀態追蹤 (待審、已批准、已拒絕)",
    feedbackSystem: "審核意見反饋系統"
  },
  
  // 權限管理
  permissionSystem: {
    roleBasedAccess: "角色基礎訪問控制",
    contentPermissions: "內容級別權限設定",
    workflowPermissions: "工作流程權限管理",
    auditTrail: "操作審計追蹤"
  }
}
```

---

---

## 🏛️ 管理員系統架構

### **四部門分工管理體系**
```javascript
const adminSystemArchitecture = {
  separation: "管理員系統與用戶系統完全分離",
  authentication: "獨立的管理員認證系統 (/api/admin/auth/*)",
  
  departments: {
    super_admin: {
      name: "總管理",
      department: "執行部",
      scope: "最高決策層，統籌全局",
      permissions: "所有系統權限"
    },
    
    system_admin: {
      name: "系統管理", 
      department: "技術部",
      scope: "系統維護、技術支援、用戶檢核",
      boundaries: "不可操作用戶業務數據和內容審核"
    },
    
    operation_admin: {
      name: "營運管理",
      department: "營運部", 
      scope: "內容審核、活動管理、一般用戶服務",
      boundaries: "不可操作系統配置和VIP財務問題"
    },
    
    premium_admin: {
      name: "付費用戶管理者",
      department: "會員部",
      scope: "VIP/VVIP服務、面試管理、付費問題",
      boundaries: "不可操作系統維護和一般內容審核"
    }
  }
}
```

### **彈性權限配置系統**
```javascript
const flexiblePermissionSystem = {
  concept: "原子化權限設計，支援未來功能擴展",
  
  permissionAtoms: {
    users: ["users:view", "users:edit", "users:suspend", "users:delete"],
    content: ["content:view", "content:moderate", "content:edit", "content:delete"],
    system: ["system:monitoring", "system:config", "system:backup"],
    interviews: ["interviews:schedule", "interviews:conduct", "interviews:review"],
    payments: ["payments:view", "payments:process", "payments:refund"]
  },
  
  dynamicConfiguration: {
    newFeatures: "新功能可快速定義權限原子",
    roleAssignment: "角色權限可動態調整",
    permissionGroups: "權限組合模板方便批量分配",
    versionControl: "權限配置版本化管理"
  },
  
  auditSystem: {
    operationLogging: "所有管理員操作完整記錄",
    securityMonitoring: "高風險操作即時告警",
    accessControl: "基於IP白名單和雙因子認證"
  }
}
```

---

*最後更新: 2025-07-14*  
*版本: 3.2*  
*狀態: 四部門管理員系統架構完成 ✅*

**重要更新**: 完成四部門分工管理員系統架構設計，建立總管理(執行部)、系統管理(技術部)、營運管理(營運部)、付費用戶管理者(會員部)的專業分工體系。實現管理員與用戶系統完全分離，採用彈性權限配置系統支援未來功能擴展，建立完整的操作審計和安全監控機制。

**重要里程碑**: 品牌重塑為 InfinityMatch 天造地設人成對 (1+1=∞)，完成4-tier會員制度(visitor/registered/vip/vvip)與四部門管理體系，實施階段式活動瀏覽限制策略，建立三大內容模塊架構(VVIPIntro/EventManagement/EventShowcase)與獨立管理員系統。天造地設，人成對 - 當二個彼此有情人相遇，愛就開始無限。
### **三大業務系統 CMS 整合**

#### **1. 面試預約系統 CMS 整合**
```javascript
const interviewCMSIntegration = {
  contentTypes: [
    "面試官個人檔案和介紹",
    "面試準備指南和FAQ", 
    "面試流程說明文件",
    "面試結果通知模板"
  ],
  
  workflowIntegration: {
    scheduling: "CMS管理面試時段和可用性",
    documentation: "面試記錄和評估表單",
    communication: "自動化郵件和通知模板",
    reporting: "面試統計和分析報告"
  },
  
  mediaManagement: {
    interviewerPhotos: "面試官專業照片管理",
    instructionalVideos: "面試準備指導影片",
    documentTemplates: "面試相關文件模板",
    brandingAssets: "面試流程品牌素材"
  }
}
```

#### **2. VVIP介紹系統 CMS 整合**
```javascript
const vvipIntroCMSIntegration = {
  contentTypes: [
    "VVIP會員個人介紹頁面",
    "專業介紹文案模板",
    "照片編輯和排版樣式",
    "介紹頁面設計模板"
  ],
  
  productionWorkflow: {
    orderManagement: "VVIP介紹訂單管理",
    contentCreation: "專業文案和設計製作",
    clientReview: "客戶確認和修改流程", 
    publishing: "最終發布和展示管理"
  },
  
  qualityControl: {
    templateStandards: "介紹頁面品質標準",
    contentGuidelines: "文案撰寫指導原則",
    visualStandards: "照片和設計規範",
    approvalProcess: "多層級品質審核"
  }
}
```

#### **3. 活動管理系統 CMS 整合**
```javascript
const eventManagementCMSIntegration = {
  contentTypes: [
    "活動詳情頁面和描述",
    "活動照片和宣傳素材",
    "參與者管理和通訊",
    "活動後記錄和回顧"
  ],
  
  lifecycleManagement: {
    planning: "活動策劃和內容準備",
    promotion: "活動宣傳素材管理",
    execution: "活動進行中內容更新",
    followup: "活動後內容整理和歸檔"
  },
  
  showcaseIntegration: {
    contentCuration: "優質活動內容篩選",
    showcaseCreation: "精彩活動集製作",
    seoOptimization: "搜尋引擎優化處理",
    socialSharing: "社群媒體分享功能"
  }
}
```

#### **4. 精彩活動集 CMS 整合**
```javascript
const eventShowcaseCMSIntegration = {
  contentTypes: [
    "活動回顧文章和故事",
    "精選活動照片集",
    "參與者感想和見證",
    "活動亮點影片剪輯"
  ],
  
  curationWorkflow: {
    contentSelection: "從活動管理系統篩選內容",
    storyCreation: "製作引人入勝的活動故事",
    mediaOptimization: "照片影片編輯和優化",
    publicationScheduling: "內容發布時程安排"
  },
  
  marketingIntegration: {
    seoOptimization: "搜尋引擎優化配置",
    socialMediaReady: "社群媒體分享格式",
    leadGeneration: "潛在客戶轉換追蹤",
    brandStorytelling: "品牌故事建構"
  }
}
```

### **CMS 技術架構規劃**
```javascript
const cmsTechnicalArchitecture = {
  // 統一資料模型
  dataModel: {
    contentItems: {
      id: "唯一識別碼",
      type: "content_type (interview|vvip|event|showcase)",
      title: "內容標題",
      content: "富文本內容",
      media: ["關聯媒體檔案陣列"],
      metadata: "系統特定元數據",
      status: "workflow_status",
      permissions: "訪問權限設定"
    }
  },
  
  // 共享組件庫
  sharedComponents: {
    mediaUploader: "統一媒體上傳組件",
    richTextEditor: "富文本編輯器",
    workflowManager: "工作流程管理器",
    permissionController: "權限控制組件"
  },
  
  // API 端點設計
  apiEndpoints: {
    "POST /api/cms/content": "創建內容",
    "GET /api/cms/content/:type": "獲取特定類型內容",
    "PUT /api/cms/content/:id": "更新內容",
    "POST /api/cms/workflow/:id/advance": "推進工作流程",
    "GET /api/cms/media": "媒體庫管理",
    "POST /api/cms/media/upload": "媒體上傳"
  }
}
```

### **CMS 實施優先級**
```javascript
const cmsImplementationPriority = {
  phase1_foundation: {
    priority: "CRITICAL",
    timeline: "2週",
    deliverables: [
      "統一媒體存儲系統 (S3/R2)",
      "基礎內容管理 API",
      "簡單審核工作流程",
      "管理員基礎界面"
    ]
  },
  
  phase2_integration: {
    priority: "HIGH", 
    timeline: "3週",
    deliverables: [
      "面試預約系統整合",
      "活動管理系統整合",
      "富文本編輯器實現",
      "權限管理系統"
    ]
  },
  
  phase3_advanced: {
    priority: "MEDIUM",
    timeline: "4週", 
    deliverables: [
      "VVIP介紹系統整合",
      "精彩活動集自動化",
      "高級工作流程功能",
      "分析和報告功能"
    ]
  }
}
```
