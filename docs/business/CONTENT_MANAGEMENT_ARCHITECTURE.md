# SheSocial 內容管理架構文件
## 三大模塊分層架構設計

---

## 🎯 系統架構概述

### 設計原則
- **分層解耦** - 基礎共用層與業務模塊層分離
- **獨立展示** - 每個模塊有獨立的展示和管理部分
- **權限分級** - 不同模塊對應不同的訪問權限
- **內容復用** - 基礎組件在三大模塊間共用

---

## 🏗️ 三層架構設計

### **Layer 1: 基礎共用內容管理層**
```javascript
const sharedContentLayer = {
  components: {
    MediaManager: "統一媒體上傳與管理 (Cloudinary整合)",
    ContentWorkflow: "通用內容審核狀態機",
    PermissionSystem: "基於會員等級的權限控制框架", 
    AdminWorkspace: "後台管理基礎界面框架",
    SEOOptimizer: "SEO優化與社群分享功能"
  },
  
  services: {
    ContentService: "通用內容CRUD操作",
    WorkflowService: "審核流程管理",
    PermissionService: "權限檢查與控制",
    MediaService: "媒體文件處理與優化"
  },
  
  middleware: {
    AuthMiddleware: "認證中間件",
    PermissionMiddleware: "權限控制中間件", 
    ContentValidation: "內容驗證中間件",
    MediaProcessing: "媒體處理中間件"
  }
}
```

### **Layer 2: 業務模塊層**
```javascript
const businessModules = {
  VVIPIntroModule: {
    purpose: "VVIP專屬會員介紹服務",
    accessLevel: "premium_2500 專屬",
    monetization: "額外付費服務 (NT$1,500)",
    
    display: {
      component: "VVIPIntroGallery",
      route: "/members/vvip-intros",
      permission: "僅VVIP會員可查看其他人介紹"
    },
    
    management: {
      component: "VVIPIntroAdmin", 
      workflow: "訂購 → 製作 → 審核 → 發布",
      features: ["內容創建", "審核管理", "收費處理"]
    }
  },
  
  EventManagementModule: {
    purpose: "活動創建、報名與參與者管理",
    accessLevel: "付費會員 (2個月等待期後)",
    monetization: "活動報名費 + 票券折抵",
    
    display: {
      component: "EventsList",
      route: "/events",
      permission: "付費會員可參與，基本用戶僅瀏覽"
    },
    
    management: {
      component: "EventAdmin",
      workflow: "創建 → 發布 → 報名管理 → 活動執行",
      features: ["活動CRUD", "報名管理", "參與者控制"]
    }
  },
  
  EventShowcaseModule: {
    purpose: "精彩活動集展示與宣傳",
    accessLevel: "完全開放 (包含訪客)",
    monetization: "營銷引流，提升註冊轉換",
    
    display: {
      component: "EventShowcase",
      route: "/showcase",
      permission: "所有人可瀏覽，SEO友好"
    },
    
    management: {
      component: "ShowcaseAdmin",
      workflow: "活動篩選 → 內容策展 → 宣傳發布",
      features: ["活動策展", "內容編輯", "SEO優化"]
    }
  }
}
```

### **Layer 3: 前端展示層**
```javascript
const presentationLayer = {
  userFacing: {
    "/members/vvip-intros": "VVIP會員介紹瀏覽",
    "/events": "活動列表與報名",
    "/showcase": "精彩活動公開展示",
    "/services/vvip-intro": "VVIP介紹服務購買"
  },
  
  adminFacing: {
    "/admin/vvip-intros": "VVIP介紹管理",
    "/admin/events": "活動管理",
    "/admin/showcase": "活動策展管理",
    "/admin/content": "統一內容管理"
  }
}
```

---

## 🔐 權限控制架構

### 權限層級設計
```javascript
const permissionLevels = {
  visitor: {
    access: ["EventShowcase展示"],
    description: "未註冊用戶，僅可瀏覽精彩活動集"
  },
  
  basic_user: {
    access: ["EventShowcase展示", "Event瀏覽(不可報名)"],
    description: "免費註冊用戶，可瀏覽活動但不能參與"
  },
  
  paid_member_waiting: {
    access: ["EventShowcase展示", "Event瀏覽(不可報名)", "VVIPIntro服務購買"],
    description: "付費會員2個月等待期內"
  },
  
  paid_member_active: {
    access: ["EventShowcase展示", "Event完整功能", "VVIPIntro服務購買"],
    description: "付費會員2個月等待期後"
  },
  
  vvip_member: {
    access: ["所有功能", "VVIPIntro查看權限"],
    description: "premium_2500會員，可查看其他會員介紹"
  },
  
  admin: {
    access: ["所有管理功能"],
    description: "管理員，完整後台控制權限"
  }
}
```

### 模塊權限映射
```javascript
const modulePermissions = {
  VVIPIntro: {
    create: "所有付費會員可購買服務",
    view_own: "介紹所有者可查看自己的",
    view_others: "僅premium_2500會員可查看其他人的",
    manage: "僅管理員可管理"
  },
  
  EventManagement: {
    view: "所有用戶可瀏覽活動資訊",
    participate: "付費會員(2個月等待期後)可報名參與",
    view_participants: "premium_2500會員可查看參與者名單",
    manage: "僅管理員可管理活動"
  },
  
  EventShowcase: {
    view: "完全開放，包含未註冊訪客",
    share: "支援社群分享，SEO友好",
    manage: "僅管理員可策展管理"
  }
}
```

---

## 🔄 內容工作流程

### 通用內容狀態機
```javascript
const contentWorkflow = {
  states: {
    draft: {
      description: "草稿狀態",
      permissions: ["創建者", "管理員"],
      actions: ["edit", "submit_for_review", "delete"]
    },
    
    pending_review: {
      description: "等待審核",
      permissions: ["管理員"],
      actions: ["approve", "reject", "request_revision"]
    },
    
    revision_requested: {
      description: "要求修改",
      permissions: ["創建者", "管理員"],
      actions: ["edit", "resubmit", "delete"]
    },
    
    approved: {
      description: "審核通過",
      permissions: ["管理員"],
      actions: ["publish", "reject"]
    },
    
    published: {
      description: "已發布",
      permissions: ["查看權限依模塊而定"],
      actions: ["unpublish", "edit_published"]
    },
    
    archived: {
      description: "已封存",
      permissions: ["管理員"],
      actions: ["restore", "delete_permanent"]
    }
  }
}
```

### 模塊特定工作流程
```javascript
const moduleSpecificWorkflows = {
  VVIPIntro: {
    order_placed: "服務訂購完成",
    info_collecting: "收集會員資料",
    content_creation: "製作個人介紹",
    client_review: "客戶確認內容",
    final_published: "正式發布供VVIP查看"
  },
  
  EventManagement: {
    event_draft: "活動草稿",
    registration_open: "開放報名",
    registration_closed: "報名截止", 
    event_completed: "活動結束",
    ready_for_showcase: "可轉入精彩活動集"
  },
  
  EventShowcase: {
    content_selection: "從已結束活動中選擇",
    content_curation: "策展與內容編輯",
    seo_optimization: "SEO優化處理",
    public_published: "公開發布"
  }
}
```

---

## 📊 數據模型關係

### 核心實體關係
```javascript
const dataRelationships = {
  User: {
    hasMany: ["VVIPIntros", "EventRegistrations", "EventShowcaseViews"],
    membershipType: "決定權限等級"
  },
  
  VVIPIntro: {
    belongsTo: "User",
    workflow: "VVIPIntroWorkflow",
    permissions: "基於查看者會員等級"
  },
  
  Event: {
    hasMany: ["EventRegistrations"],
    canBecomeShowcase: "結束後可轉入EventShowcase",
    permissions: "基於參與者會員等級"
  },
  
  EventShowcase: {
    belongsTo: "Event (optional)",
    permissions: "完全開放",
    features: ["SEO優化", "社群分享"]
  },
  
  ContentWorkflow: {
    polymorphic: "可關聯VVIPIntro, Event, EventShowcase",
    states: "通用狀態機"
  }
}
```

---

## 🛠️ 技術實現架構

### 後端API設計
```javascript
const apiArchitecture = {
  sharedServices: {
    "/api/content": "通用內容管理API",
    "/api/media": "媒體上傳與管理API",
    "/api/workflow": "審核流程API",
    "/api/permissions": "權限檢查API"
  },
  
  moduleApis: {
    "/api/vvip-intros": "VVIP介紹相關API",
    "/api/events": "活動管理API", 
    "/api/showcase": "精彩活動集API"
  },
  
  adminApis: {
    "/api/admin/content": "統一內容管理",
    "/api/admin/workflows": "工作流程管理",
    "/api/admin/analytics": "數據分析"
  }
}
```

### 前端組件架構
```javascript
const componentArchitecture = {
  shared: {
    "MediaUpload": "統一媒體上傳組件",
    "ContentEditor": "富文本編輯器",
    "WorkflowStatus": "審核狀態顯示",
    "PermissionGuard": "權限控制包裝器",
    "AdminLayout": "管理後台佈局"
  },
  
  moduleSpecific: {
    vvipIntro: ["VVIPIntroCard", "VVIPIntroGallery", "IntroServicePage"],
    events: ["EventCard", "EventsList", "EventDetail"],
    showcase: ["ShowcaseCard", "ShowcaseGallery", "ShowcaseDetail"]
  }
}
```

---

## 🚀 開發實施計劃

### Phase 1: 基礎共用層 (2週)
- ✅ MediaManager實現
- ✅ ContentWorkflow狀態機
- ✅ PermissionSystem框架
- ✅ AdminWorkspace基礎

### Phase 2: VVIPIntro模塊 (2週)
- ✅ 介紹服務購買流程
- ✅ 內容製作管理
- ✅ VVIP查看權限
- ✅ 收費系統整合

### Phase 3: EventManagement模塊 (2週)
- ✅ 活動CRUD功能
- ✅ 報名與參與者管理
- ✅ 2個月等待期控制
- ✅ 票券系統整合

### Phase 4: EventShowcase模塊 (1週)
- ✅ 活動策展功能
- ✅ 公開展示界面
- ✅ SEO優化
- ✅ 社群分享功能

### Phase 5: 整合優化 (1週)
- ✅ 跨模塊數據流測試
- ✅ 性能優化
- ✅ 用戶體驗優化
- ✅ 安全性檢測

---

## 📈 商業價值分析

### 各模塊商業定位
```javascript
const businessValue = {
  VVIPIntro: {
    revenueModel: "直接收費服務 (NT$1,500/次)",
    customerValue: "個性化介紹提升交友成功率",
    platformValue: "高端服務差異化，增加VVIP價值"
  },
  
  EventManagement: {
    revenueModel: "活動報名費 + 會員費",
    customerValue: "高品質社交活動體驗",
    platformValue: "核心服務，會員留存關鍵"
  },
  
  EventShowcase: {
    revenueModel: "營銷引流，提升註冊轉換",
    customerValue: "了解平台活動品質",
    platformValue: "品牌建設，獲客成本降低"
  }
}
```

---

*最後更新: 2025-07-13*  
*版本: 1.0*  
*狀態: 架構設計完成，準備實施 ✅*

**重要里程碑**: 三大模塊內容管理架構設計完成，建立分層解耦的可擴展系統，每個模塊獨立運作但共用基礎設施，為後續開發提供清晰的技術路線圖。