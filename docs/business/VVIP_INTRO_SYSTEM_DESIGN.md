# SheSocial VVIPIntro系統設計文件
## VVIP專屬會員介紹展示與管理系統

---

## 🎯 系統概述

### 核心功能
- **會員介紹創建與管理** - 專業化的個人介紹製作服務
- **VVIP專屬查看權限** - 只有premium_2500會員可查看其他會員介紹
- **收費服務管理** - VVIPIntro製作的獨立付費系統
- **內容審核機制** - 確保介紹內容品質與平台形象

### 業務邏輯
```javascript
const vvipIntroSystem = {
  service: "額外付費服務",
  target: "所有會員均可購買",
  viewer_permission: "僅VVIP (premium_2500) 可查看",
  content_location: "平台自建，完全控制權限"
}
```

---

## 💎 會員介紹數據結構

### VVIPIntro Collection
```javascript
const VVIPIntroSchema = {
  _id: "ObjectId",
  userId: "會員ID",
  
  // 服務訂單信息
  order: {
    orderId: "VVIP_INTRO_001",
    purchaseDate: "2025-07-13T10:00:00Z",
    price: 1500, // NT$1500
    paymentStatus: "completed",
    paymentMethod: "LINE Pay"
  },
  
  // 介紹內容
  content: {
    title: "個人標題",
    description: "詳細自我介紹",
    highlights: ["特色1", "特色2", "特色3"],
    photos: [
      {
        url: "cloudinary_url",
        caption: "照片說明",
        order: 1
      }
    ],
    interests: ["興趣1", "興趣2"],
    lifestyle: "生活方式描述",
    expectations: "交友期望"
  },
  
  // 狀態管理
  status: {
    current: "completed", // draft, in_progress, review, completed, published
    createdDate: "2025-07-13T10:00:00Z",
    completedDate: "2025-07-15T16:30:00Z",
    publishedDate: "2025-07-16T09:00:00Z"
  },
  
  // 審核記錄
  review: {
    reviewerId: "admin_001",
    reviewDate: "2025-07-15T15:00:00Z",
    approved: true,
    feedback: "內容優質，已批准發布",
    revisionRequests: []
  },
  
  // 瀏覽統計
  analytics: {
    viewCount: 25,
    lastViewed: "2025-07-20T14:30:00Z",
    viewers: ["user_vvip_001", "user_vvip_002"]
  },
  
  createdAt: "2025-07-13T10:00:00Z",
  updatedAt: "2025-07-16T09:00:00Z"
}
```

---

## 🔐 權限控制系統

### 查看權限邏輯
```javascript
const viewingPermissions = {
  // 只有VVIP會員可以查看其他人的介紹
  canViewIntros: (viewer, targetUser) => {
    return viewer.membership.type === 'premium_2500' && 
           viewer.membership.status === 'active' &&
           viewer._id !== targetUser._id // 不能查看自己的
  },
  
  // 介紹所有者可以查看自己的介紹
  canViewOwnIntro: (viewer, introUserId) => {
    return viewer._id === introUserId
  },
  
  // 管理員可以查看所有介紹
  canViewAsAdmin: (viewer) => {
    return viewer.role === 'admin' || viewer.role === 'moderator'
  }
}
```

### API權限中間件
```javascript
const vvipIntroPermissionMiddleware = {
  // 查看介紹列表權限
  viewIntroList: async (req, res, next) => {
    const user = req.user
    if (user.membership.type !== 'premium_2500' || user.membership.status !== 'active') {
      return res.status(403).json({
        error: '只有VVIP會員可以查看會員介紹',
        requiredMembership: 'premium_2500'
      })
    }
    next()
  },
  
  // 查看特定介紹權限
  viewSpecificIntro: async (req, res, next) => {
    const user = req.user
    const introId = req.params.introId
    
    const intro = await VVIPIntroModel.findById(introId)
    if (!intro) {
      return res.status(404).json({ error: '介紹不存在' })
    }
    
    // 檢查是否為自己的介紹
    if (intro.userId === user._id) {
      return next() // 可以查看自己的
    }
    
    // 檢查是否為VVIP
    if (user.membership.type !== 'premium_2500' || user.membership.status !== 'active') {
      return res.status(403).json({
        error: '只有VVIP會員可以查看其他會員介紹'
      })
    }
    
    next()
  }
}
```

---

## 💰 收費系統設計

### 服務定價
```javascript
const vvipIntroService = {
  name: "VVIP會員介紹製作服務",
  price: 1500, // NT$1500
  currency: "NT$",
  duration: "3-5個工作天",
  
  included: [
    "專業介紹文案撰寫",
    "照片優化與排版",
    "個性化內容設計",
    "一次免費修改機會"
  ],
  
  process: [
    "付費確認",
    "資料收集問卷",
    "初稿製作",
    "客戶確認修改",
    "最終發布"
  ]
}
```

### 付費流程
```javascript
const paymentFlow = {
  step1: {
    action: "會員選擇購買VVIP介紹服務",
    page: "/services/vvip-intro",
    price_display: "NT$1,500"
  },
  
  step2: {
    action: "填寫介紹製作問卷",
    required_info: [
      "個人特色描述",
      "興趣愛好詳細",
      "交友期望",
      "生活方式",
      "特殊才能或經歷"
    ]
  },
  
  step3: {
    action: "選擇照片並付費",
    payment_methods: ["LINE Pay", "信用卡", "Apple Pay"],
    photos_required: "3-5張個人照片"
  },
  
  step4: {
    action: "平台製作介紹",
    timeline: "3-5個工作天",
    status_tracking: "即時更新製作進度"
  },
  
  step5: {
    action: "客戶確認與發布",
    modification_allowed: "一次免費修改",
    final_approval: "客戶確認後正式發布"
  }
}
```

---

## 🎨 前端界面設計

### VVIP會員介紹瀏覽頁面
```jsx
const VVIPIntroGallery = () => {
  // /members/vvip-intros (只有VVIP可訪問)
  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-pearl to-luxury-champagne">
      <Header title="會員介紹展示" subtitle="VVIP專屬內容" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {vvipIntros.map(intro => (
          <VVIPIntroCard 
            key={intro._id}
            intro={intro}
            onView={() => viewIntroDetail(intro._id)}
          />
        ))}
      </div>
      
      <VVIPBadge text="VVIP專屬內容" />
    </div>
  )
}
```

### 介紹製作服務購買頁面
```jsx
const VVIPIntroServicePage = () => {
  // /services/vvip-intro (所有會員可訪問)
  return (
    <div className="luxury-page-container">
      <ServiceHeader 
        title="專業VVIP會員介紹製作"
        price="NT$1,500"
        duration="3-5個工作天"
      />
      
      <ServiceFeatures features={vvipIntroService.included} />
      
      <ProcessTimeline steps={vvipIntroService.process} />
      
      <PurchaseButton 
        onClick={() => startPurchaseFlow()}
        disabled={!isAuthenticated}
      />
      
      <VVIPPreview 
        message="購買後，VVIP會員可在會員介紹區查看您的個人介紹"
      />
    </div>
  )
}
```

---

## 🔄 工作流程管理

### 介紹製作狀態機
```javascript
const introWorkflow = {
  states: {
    'ordered': {
      description: '已下單，等待資料收集',
      next_actions: ['collect_info'],
      duration: '24小時內'
    },
    
    'info_collected': {
      description: '資料收集完成，開始製作',
      next_actions: ['start_creation'],
      duration: '1個工作天'
    },
    
    'in_progress': {
      description: '製作中',
      next_actions: ['submit_draft'],
      duration: '2-3個工作天'
    },
    
    'draft_ready': {
      description: '初稿完成，等待客戶確認',
      next_actions: ['approve', 'request_revision'],
      duration: '客戶3天內回覆'
    },
    
    'revision_requested': {
      description: '客戶要求修改',
      next_actions: ['submit_final'],
      duration: '1個工作天'
    },
    
    'approved': {
      description: '客戶確認，準備發布',
      next_actions: ['publish'],
      duration: '24小時內'
    },
    
    'published': {
      description: '已發布，VVIP可查看',
      next_actions: ['view_analytics'],
      duration: '永久有效'
    }
  }
}
```

### 管理員工作台
```javascript
const adminWorkspace = {
  dashboard: {
    pending_orders: "待處理訂單數量",
    in_progress: "製作中自介數量",
    pending_approval: "等待客戶確認數量",
    completed_today: "今日完成數量"
  },
  
  order_management: {
    order_list: "所有訂單列表",
    priority_queue: "優先處理佇列",
    deadline_alerts: "截止日期提醒",
    customer_communication: "客戶溝通記錄"
  },
  
  content_creation: {
    template_library: "自介模板庫",
    photo_editor: "照片編輯工具",
    preview_system: "預覽系統",
    approval_workflow: "審核流程"
  },
  
  analytics: {
    service_revenue: "服務營收統計",
    completion_time: "平均完成時間",
    customer_satisfaction: "客戶滿意度",
    revision_rate: "修改請求比例"
  }
}
```

---

## 📊 數據分析與優化

### 關鍵指標追蹤
```javascript
const kpiTracking = {
  business_metrics: {
    service_conversion_rate: "VVIP介紹服務轉換率",
    average_order_value: "平均訂單價值",
    customer_lifetime_value: "客戶生命週期價值",
    repeat_service_rate: "重複購買率"
  },
  
  operational_metrics: {
    average_completion_time: "平均製作時間",
    revision_request_rate: "修改請求比例",
    customer_satisfaction_score: "客戶滿意度評分",
    on_time_delivery_rate: "準時交付率"
  },
  
  engagement_metrics: {
    intro_view_frequency: "介紹查看頻率",
    vvip_engagement_rate: "VVIP會員參與度",
    photo_click_through_rate: "照片點擊率",
    contact_request_conversion: "聯絡請求轉換率"
  }
}
```

---

## 🚀 技術實現計劃

### Phase 1: 基礎架構 (1週)
- ✅ 數據庫schema設計
- ✅ API端點開發
- ✅ 權限控制中間件
- ✅ 基本前端頁面

### Phase 2: 核心功能 (2週)
- ✅ 服務購買流程
- ✅ 內容管理系統
- ✅ 工作流程狀態機
- ✅ 管理員工作台

### Phase 3: 優化增強 (1週)
- ✅ 圖片上傳與優化
- ✅ 數據分析面板
- ✅ 通知系統
- ✅ 性能優化

### Phase 4: 測試部署 (1週)
- ✅ 完整功能測試
- ✅ 用戶體驗優化
- ✅ 安全性檢測
- ✅ 生產環境部署

---

## 💡 未來擴展可能

### 進階功能
- **AI輔助文案生成** - 使用AI協助創建個性化介紹
- **視頻介紹服務** - 擴展到視頻形式的自我介紹
- **介紹效果分析** - 提供介紹瀏覽數據和效果分析
- **個性化推薦** - 基於興趣和條件的會員推薦系統

### 商業模式擴展
- **套餐服務** - 結合攝影、化妝、文案的完整套餐
- **年度更新服務** - 提供定期更新介紹內容的訂閱服務
- **專屬顧問服務** - 一對一的形象顧問和交友指導
- **成功案例分享** - 優秀介紹案例的展示和學習平台

---

*最後更新: 2025-07-13*  
*版本: 1.0*  
*狀態: 系統設計完成，準備開發實現 ✅*

**重要里程碑**: VVIPIntro系統設計完成，整合VVIP專屬權限、獨立收費系統、完整工作流程管理，準備進入開發階段。