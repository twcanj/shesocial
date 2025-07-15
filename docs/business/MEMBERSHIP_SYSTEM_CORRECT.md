# InfinityMatch 天造地設人成對 正確會員系統架構文件
## 基於4-tier會員制度的清晰分層設計

---

## 🎯 核心原則

### 基本邏輯
- **所有人都可以參加活動**
- **只有付費會員可以查看參與者名單**
- **付費會員額外獲得票券優惠**

---

## 💎 會員系統架構

### 訪客（未註冊）
```javascript
const visitor = {
  name: "訪客",
  cost: 0, // 無需註冊
  currency: "NT$",
  
  permissions: {
    joinEvents: false,        // ❌ 不能參加活動
    viewParticipants: false, // ❌ 不能看參與者名單
    uploadMedia: false,
    bookInterview: false
  },
  
  benefits: [
    "瀏覽3個活動資訊",
    "查看精彩活動集"
  ],
  
  limitations: [
    "最多只能瀏覽3個活動",
    "無法參加任何活動",
    "無法查看參與者名單"
  ]
}
```

### 註冊會員（免費）
```javascript
const registeredUser = {
  name: "註冊會員",
  cost: 0, // 免費註冊
  currency: "NT$",
  
  permissions: {
    joinEvents: false,        // ❌ 不能參加活動
    viewParticipants: false, // ❌ 不能看參與者名單
    uploadMedia: false,
    bookInterview: false
  },
  
  benefits: [
    "免費註冊",
    "瀏覽12個活動資訊", 
    "個人資料管理"
  ],
  
  limitations: [
    "最多只能瀏覽12個活動",
    "無法參加任何活動",
    "無法查看參與者名單"
  ]
}
```

### VIP會員（付費）
```javascript
const vipMember = {
  name: "VIP會員",
  cost: 1300,
  currency: "NT$",
  
  permissions: {
    joinEvents: true,       // ✅ 可以參加活動（2個月等待期後）
    viewParticipants: false, // ❌ 不能看參與者名單
    uploadMedia: "面試完成後",
    bookInterview: true
  },
  
  benefits: [
    "無限活動瀏覽",
    "優先報名活動", 
    "優先客服支援",
    "票券折抵優惠"
  ],
  
  vouchers: {
    "100_dollar": 2, // NT$100票券 x 2張
    "200_dollar": 1, // NT$200票券 x 1張
    total_value: 400 // 總價值NT$400
  },
  
  package_value: {
    membership: 1300,
    vouchers: 400,
    total_received: 1700 // 實際獲得價值
  }
}
```

### VVIP會員（付費）
```javascript
const vvipMember = {
  name: "VVIP會員",
  cost: 2500,
  currency: "NT$",
  
  permissions: {
    joinEvents: true,       // ✅ 可以參加活動（2個月等待期後）
    viewParticipants: true, // ✅ 可以看參與者名單
    uploadMedia: "面試完成後",
    bookInterview: true
  },
  
  benefits: [
    "所有VIP會員權益",
    "查看活動參與者名單",
    "最高優先權", 
    "專屬客服服務",
    "最多票券折抵優惠"
  ],
  
  vouchers: {
    "100_dollar": 5, // NT$100票券 x 5張
    "200_dollar": 4, // NT$200票券 x 4張
    total_value: 1300 // 總價值NT$1300
  },
  
  package_value: {
    membership: 2500,
    vouchers: 1300,
    total_received: 3800 // 實際獲得價值
  }
}
```

---

## 🎫 票券系統詳細規則

### 票券使用限制
```javascript
const voucherRules = {
  eligible_events: ["2day_trip"], // 僅限2日遊活動
  usage_per_event: 1, // 每場活動最多用1張
  stackable: false, // 不可疊加使用
  transferable: false, // 不可轉讓
  expiry_options: ["2個月", "4個月", "半年"], // 用戶可選有效期
  
  discount_structure: {
    "100_voucher": 100, // NT$100票券折抵NT$100
    "200_voucher": 200  // NT$200票券折抵NT$200
  }
}
```

### 活動費用結構
```javascript
const eventPricing = {
  two_day_trip: {
    base_price: "依活動而定", // 例如NT$3000
    payment_methods: [
      "現金支付",
      "票券折抵 + 現金補差額",
      "信用卡支付"
    ]
  },
  
  example_scenario: {
    event_cost: 3000, // NT$3000的2日遊
    vip_payment: {
      voucher_200: -200,  // 使用NT$200票券
      cash_balance: 2800  // 現金補NT$2800
    },
    premium_payment: {
      voucher_200: -200,  // 使用NT$200票券  
      cash_balance: 2800  // 現金補NT$2800
    }
  }
}
```

---

## 🎯 核心差異比較

| 功能項目 | 訪客 | 註冊會員 | VIP會員 | VVIP會員 |
|---------|------|---------|---------|----------|
| **註冊費用** | 無 | 免費 | NT$1,300 | NT$2,500 |
| **活動瀏覽** | 3個 | 12個 | 無限 | 無限 |
| **參加活動** | ❌ | ❌ | ✅ | ✅ |
| **查看參與者** | ❌ | ❌ | ❌ | ✅ |
| **票券價值** | 無 | 無 | NT$400 | NT$1,300 |
| **客服支援** | 無 | 基本 | 優先 | 專屬 |
| **實際價值** | NT$0 | NT$0 | NT$1,700 | NT$3,800 |

---

## 📊 商業邏輯優勢

### 對用戶的價值主張
1. **訪客**: 零門檻體驗平台，可瀏覽少量活動
2. **註冊會員**: 免費註冊，可瀏覽更多活動
3. **VIP會員**: 小額投資獲得參與權限 + 票券優惠
4. **VVIP會員**: 最大投資獲得查看權限 + 最多優惠 + 專屬服務

### 對平台的商業價值
1. **用戶分層**: 清楚的付費/免費區隔
2. **轉換誘因**: 查看參與者功能驅動付費轉換
3. **現金流**: 預收會員費改善營運資金
4. **客戶黏性**: 票券機制鼓勵重複參與

---

## 🔄 用戶升級路徑

```javascript
const upgradeFlow = {
  step1: {
    status: "訪客",
    trigger: "想瀏覽更多活動",
    action: "註冊成為會員"
  },
  
  step2: {
    status: "註冊會員",
    trigger: "想參加活動",
    action: "升級為VIP會員"
  },
  
  step3: {
    status: "VIP會員", 
    trigger: "想查看參與者名單",
    action: "升級為VVIP會員"
  },
  
  pricing_strategy: {
    vip_to_vvip: "補差價NT$1,200即可升級",
    incentive: "獲得額外NT$900票券價值 + 查看參與者權限"
  }
}
```

---

*最後更新: 2025-07-15*  
*版本: 4.0*  
*狀態: 4-tier會員架構確認完成 ✅*

**重要說明**: 此文件為正確的會員系統架構，基於「visitor → registered → vip → vvip」的4-tier分層設計，以及「查看參與者權限」作為核心付費誘因的商業模式設計。