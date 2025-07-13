# SheSocial 業務規則文件
## 三大內容模塊、會員制度與服務管理規範

> **重要更新**: 2025年實施三大內容模塊架構 - VVIPIntro、EventManagement、EventShowcase，建立分層權限與內容管理系統

---

## 💎 會員等級與定價

### 會員方案與權限系統
```javascript
const membershipTiers = {
  basic: {
    name: "基本用戶",
    cost: 0,
    currency: "NT$",
    benefits: ["免費註冊", "瀏覽活動資訊", "查看精彩活動集"],
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
    benefits: ["優先報名", "票券折抵", "專業客服"],
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
  
  premium: {
    name: "Premium會員 (VVIP)",
    cost: 2500,
    currency: "NT$", 
    benefits: ["最高優先權", "查看參與者名單", "專屬服務", "最多票券"],
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

## 🏗️ VVIP介紹服務規則

### 服務定價與流程
```javascript
const vvipIntroService = {
  name: "VVIP會員介紹製作服務",
  price: 1500, // NT$1,500
  currency: "NT$",
  duration: "3-5個工作天",
  
  eligibility: {
    purchaser: "所有付費會員均可購買(等待期內也可購買)",
    viewer: "僅Premium會員可查看其他人的介紹"
  },
  
  included: [
    "專業介紹文案撰寫",
    "照片優化與排版", 
    "個性化內容設計",
    "一次免費修改機會"
  ],
  
  workflow: {
    step1: "付費確認",
    step2: "資料收集問卷",
    step3: "初稿製作",
    step4: "客戶確認修改",
    step5: "最終發布供VVIP查看"
  },
  
  businessModel: {
    revenueType: "直接服務收費",
    targetRevenue: "每月20-30筆訂單",
    marginEstimate: "80% (主要為人工成本)"
  }
}
```

### 精彩活動集管理
```javascript
const eventShowcaseRules = {
  contentSource: "已結束的優質活動",
  selectionCriteria: [
    "活動成功執行",
    "參與者滿意度高",
    "具備宣傳價值",
    "照片影片品質佳"
  ],
  
  curationProcess: {
    step1: "活動結束後管理員評估",
    step2: "篩選優質活動內容",
    step3: "製作宣傳素材",
    step4: "SEO優化處理",
    step5: "公開發布展示"
  },
  
  accessPermissions: {
    viewing: "完全開放，包含訪客",
    sharing: "支援社群分享",
    seoOptimized: "搜尋引擎友好"
  },
  
  businessValue: {
    marketingPurpose: "吸引新用戶註冊",
    brandBuilding: "展示平台活動品質", 
    trustBuilding: "建立社群信任度",
    seoRanking: "提升搜尋排名"
  }
}
```

---

*最後更新: 2025-07-13*  
*版本: 3.0*  
*狀態: 三大模塊架構完成 ✅*

**重要里程碑**: 完成三大內容模塊架構設計 - VVIPIntro(VVIP專屬)、EventManagement(會員限定)、EventShowcase(完全開放)，建立分層權限控制與獨立收費模式。系統準備進入模塊化開發階段。
