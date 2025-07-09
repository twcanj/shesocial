# SheSocial 業務規則文件
## 會員制度、票券系統與活動管理規範

---

## 💎 會員等級與定價

### 基本會員方案
```javascript
const membershipTiers = {
  regular: {
    name: "一般會員",
    entryFee: 600,
    monthlyFee: 300,
    quarterlyFee: 900,
    benefits: ["基本活動參與", "個人資料管理"]
  },
  
  vip: {
    name: "VIP會員", 
    entryFee: 1000,
    monthlyFee: 300,
    quarterlyFee: 900,
    benefits: ["查看參與者資料", "優先報名"]
  }
}
```

### 新增票券方案
```javascript
const voucherPlans = {
  premium_1300: {
    name: "$1,300 票券方案",
    price: 1300,
    vouchers: {
      "100_dollar": 2, // $100送2張
      "200_dollar": 1  // $200送1張
    },
    restrictions: ["僅可折抵2日遊活動"],
    validity: ["2個月", "4個月", "半年"], // 按月前選擇期限
    benefits: ["票券折抵優惠"]
  },
  
  premium_2500: {
    name: "$2,500 票券方案",
    price: 2500,
    vouchers: {
      "100_dollar": 5, // $100送5張  
      "200_dollar": 4  // $200送4張
    },
    restrictions: ["僅可折抵2日遊活動"],
    validity: ["2個月", "4個月", "半年"],
    benefits: [
      "票券折抵優惠",
      "可查看活動參與者完整名單",
      "優先客服支援"
    ]
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

### 權限等級
```javascript
const participantViewPermissions = {
  regular: {
    canView: false,
    reason: "一般會員無查看權限"
  },
  
  vip: {
    canView: false, // 注意：VIP也無法查看完整名單
    reason: "VIP會員無完整名單查看權限"
  },
  
  premium_1300: {
    canView: false,
    reason: "$1,300方案無查看權限"
  },
  
  premium_2500: {
    canView: true,
    scope: "完整參與者名單",
    includes: ["姓名", "年齡", "職業", "興趣", "照片"]
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
  requirement: "所有新會員必須完成視訊面試",
  duration: 30, // 半小時
  format: "一對一視訊通話",
  
  process: {
    step1: "會員註冊並繳費",
    step2: "預約視訊面試時間",
    step3: "進行30分鐘視訊面試",
    step4: "面試官評估並決定通過/拒絕",
    step5: "通知面試結果"
  },
  
  criteria: [
    "身份驗證",
    "個人背景確認", 
    "參與動機評估",
    "平台規則理解"
  ],
  
  outcome: {
    pass: "獲得完整會員權限",
    fail: "退費並取消會員資格"
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
    conversionRate: "註冊到付費轉換率",
    retentionRate: "會員續費率",
    upgradeRate: "方案升級率"
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

*最後更新: 2024-07-09*  
*版本: 1.0*  
*狀態: 業務規則確認完成，待技術實現*
