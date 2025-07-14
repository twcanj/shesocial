# InfinityMatch 天造地設人成對 統一CMS架構設計
## 單一內容管理系統支撐三大業務模組

**更新時間**: 2025-07-14  
**架構版本**: v1.0  
**設計理念**: CMS中心化，業務模組化

---

## 🎯 **CMS 架構核心理念**

### **統一CMS驅動三大業務系統**
```javascript
const cmsArchitecturePhilosophy = {
  coreSystem: "統一內容管理系統 (Unified CMS)",
  businessModules: [
    {
      name: "面試預約系統",
      code: "interview-management",
      description: "30分鐘視訊面試預約和管理"
    },
    {
      name: "VVIP介紹系統", 
      code: "vvip-intro-service",
      description: "NT$1,500 專業介紹製作服務"
    },
    {
      name: "活動管理系統",
      code: "event-management", 
      description: "社交活動創建、管理和參與"
    },
    {
      name: "精彩活動集",
      code: "event-showcase",
      description: "優質活動展示和行銷"
    }
  ],
  
  benefits: [
    "統一內容審核流程",
    "共享媒體資源庫",
    "一致的用戶體驗",
    "降低開發維護成本",
    "快速業務模組擴展"
  ]
}
```

---

## 🏗️ **CMS 技術架構設計**

### **三層架構模式**
```javascript
const cmsArchitectureLayers = {
  // Layer 1: CMS 核心層
  cmsCore: {
    contentEngine: {
      description: "統一內容引擎",
      responsibilities: [
        "內容創建、編輯、發布",
        "版本控制和歷史記錄",
        "內容關聯和引用管理",
        "全文搜索和標籤系統"
      ]
    },
    
    mediaManager: {
      description: "S3/R2 媒體管理器",
      responsibilities: [
        "媒體上傳和存儲",
        "圖片/影片自動處理",
        "CDN 加速和優化",
        "媒體使用追蹤"
      ]
    },
    
    workflowEngine: {
      description: "可配置工作流程引擎",
      responsibilities: [
        "內容審核流程管理",
        "任務分配和追蹤",
        "狀態轉換和通知",
        "工作流程分析報告"
      ]
    },
    
    permissionSystem: {
      description: "細粒度權限控制",
      responsibilities: [
        "角色基礎訪問控制",
        "內容級別權限設定",
        "操作權限驗證",
        "安全審計日誌"
      ]
    }
  },
  
  // Layer 2: 業務適配層
  businessAdapters: {
    interviewAdapter: {
      description: "面試預約業務邏輯適配",
      contentTypes: [
        "面試官個人檔案",
        "面試準備指南",
        "面試流程說明",
        "面試結果模板"
      ]
    },
    
    vvipAdapter: {
      description: "VVIP介紹服務適配",
      contentTypes: [
        "VVIP介紹頁面",
        "介紹文案模板",
        "設計排版樣式",
        "服務流程指南"
      ]
    },
    
    eventAdapter: {
      description: "活動管理業務適配",
      contentTypes: [
        "活動詳情頁面",
        "活動宣傳素材",
        "參與者管理",
        "活動後記錄"
      ]
    },
    
    showcaseAdapter: {
      description: "精彩活動集適配",
      contentTypes: [
        "活動回顧文章",
        "精選照片集",
        "參與者見證",
        "活動亮點影片"
      ]
    }
  },
  
  // Layer 3: 共享服務層
  sharedServices: {
    mediaProcessing: "統一媒體處理服務",
    notificationService: "統一通知服務",
    auditService: "操作審計服務",
    analyticsService: "統一分析服務",
    cacheService: "內容快取服務",
    searchService: "全文搜索服務"
  }
}
```

---

## 📊 **CMS 數據庫架構**

### **統一數據模型設計**
```javascript
const cmsDataModel = {
  // 核心內容表
  cms_content: {
    _id: "content_id",
    type: "interview|vvip|event|showcase", // 業務類型
    category: "profile|guide|template|story|media", // 內容分類
    title: "內容標題",
    slug: "URL友好標識符",
    content: {
      text: "富文本內容",
      structured: "結構化數據 (JSON)",
      metadata: "業務特定元數據"
    },
    media: {
      featured: "主要媒體ID",
      gallery: ["媒體ID陣列"],
      attachments: ["附件ID陣列"]
    },
    seo: {
      metaTitle: "SEO標題",
      metaDescription: "SEO描述",
      keywords: ["關鍵字陣列"],
      ogImage: "社群分享圖片"
    },
    workflow: {
      status: "draft|review|approved|published|archived",
      assignedTo: "當前負責人ID",
      dueDate: "截止日期",
      priority: "low|medium|high|urgent",
      history: [{
        status: "狀態",
        user: "操作用戶",
        timestamp: "時間戳",
        notes: "備註"
      }]
    },
    permissions: {
      viewRoles: ["可查看角色陣列"],
      editRoles: ["可編輯角色陣列"],
      publishRoles: ["可發布角色陣列"]
    },
    analytics: {
      views: "瀏覽次數",
      interactions: "互動次數",
      conversions: "轉換次數"
    },
    createdBy: "創建者ID",
    createdAt: "創建時間",
    updatedAt: "更新時間",
    publishedAt: "發布時間"
  },
  
  // 統一媒體庫
  cms_media: {
    _id: "media_id",
    filename: "原始檔名",
    title: "媒體標題",
    description: "媒體描述",
    mimeType: "檔案類型",
    size: "檔案大小 (bytes)",
    dimensions: {
      width: "寬度",
      height: "高度",
      duration: "影片長度 (秒)"
    },
    storage: {
      provider: "r2|s3",
      bucket: "存儲桶名稱",
      key: "存儲路徑",
      url: "原始URL",
      cdnUrl: "CDN加速URL"
    },
    processing: {
      status: "pending|processing|completed|failed",
      variants: {
        thumbnail: "縮圖URL (150x150)",
        small: "小圖URL (300x300)",
        medium: "中圖URL (600x600)",
        large: "大圖URL (1200x1200)",
        webp: "WebP格式URL"
      },
      optimization: {
        originalSize: "原始大小",
        compressedSize: "壓縮後大小",
        compressionRatio: "壓縮比例"
      }
    },
    metadata: {
      alt: "替代文字",
      caption: "圖片說明",
      tags: ["媒體標籤陣列"],
      exif: "EXIF數據",
      location: "拍攝地點",
      copyright: "版權資訊"
    },
    usage: [{
      contentId: "使用此媒體的內容ID",
      context: "使用情境",
      timestamp: "使用時間"
    }],
    analytics: {
      downloads: "下載次數",
      views: "查看次數"
    },
    uploadedBy: "上傳者ID",
    createdAt: "上傳時間",
    updatedAt: "更新時間"
  },
  
  // 工作流程定義
  cms_workflows: {
    _id: "workflow_id",
    name: "工作流程名稱",
    description: "工作流程描述",
    contentTypes: ["適用內容類型陣列"],
    steps: [{
      id: "步驟ID",
      name: "步驟名稱",
      description: "步驟描述",
      assignedRoles: ["負責角色陣列"],
      requiredActions: ["必要動作陣列"],
      optionalActions: ["可選動作陣列"],
      conditions: {
        entry: "進入條件",
        exit: "退出條件"
      },
      notifications: {
        onEntry: "進入通知設定",
        onExit: "退出通知設定",
        reminders: "提醒設定"
      },
      timeLimit: "時間限制 (小時)",
      escalation: "升級規則"
    }],
    isActive: "是否啟用",
    version: "版本號",
    createdBy: "創建者ID",
    createdAt: "創建時間",
    updatedAt: "更新時間"
  }
}
```

---

## 🔌 **CMS API 設計**

### **RESTful API 端點架構**
```javascript
const cmsAPIArchitecture = {
  // 內容管理 API
  contentAPI: {
    "GET /api/cms/content": {
      description: "獲取內容列表",
      parameters: {
        type: "內容類型篩選",
        category: "內容分類篩選",
        status: "工作流程狀態篩選",
        page: "分頁參數",
        limit: "每頁數量",
        search: "搜索關鍵字"
      },
      response: "分頁內容列表"
    },
    
    "POST /api/cms/content": {
      description: "創建新內容",
      body: "內容數據",
      response: "創建的內容對象"
    },
    
    "GET /api/cms/content/:id": {
      description: "獲取特定內容",
      response: "完整內容對象"
    },
    
    "PUT /api/cms/content/:id": {
      description: "更新內容",
      body: "更新數據",
      response: "更新後內容對象"
    },
    
    "DELETE /api/cms/content/:id": {
      description: "刪除內容",
      response: "刪除確認"
    },
    
    "POST /api/cms/content/:id/publish": {
      description: "發布內容",
      response: "發布結果"
    },
    
    "POST /api/cms/content/:id/archive": {
      description: "歸檔內容",
      response: "歸檔結果"
    }
  },
  
  // 媒體管理 API
  mediaAPI: {
    "GET /api/cms/media": {
      description: "媒體庫列表",
      parameters: {
        type: "媒體類型篩選",
        tags: "標籤篩選",
        page: "分頁參數"
      }
    },
    
    "POST /api/cms/media/upload": {
      description: "上傳媒體檔案",
      body: "multipart/form-data",
      response: "上傳結果和媒體對象"
    },
    
    "GET /api/cms/media/:id": {
      description: "獲取媒體詳情",
      response: "完整媒體對象"
    },
    
    "PUT /api/cms/media/:id": {
      description: "更新媒體資訊",
      body: "媒體元數據",
      response: "更新後媒體對象"
    },
    
    "DELETE /api/cms/media/:id": {
      description: "刪除媒體檔案",
      response: "刪除確認"
    },
    
    "POST /api/cms/media/:id/variants": {
      description: "生成媒體變體",
      body: "變體規格",
      response: "生成結果"
    }
  },
  
  // 工作流程管理 API
  workflowAPI: {
    "GET /api/cms/workflows": {
      description: "工作流程列表",
      response: "工作流程定義列表"
    },
    
    "POST /api/cms/content/:id/workflow/advance": {
      description: "推進工作流程",
      body: {
        action: "執行動作",
        notes: "操作備註"
      },
      response: "工作流程狀態"
    },
    
    "GET /api/cms/content/:id/workflow/history": {
      description: "工作流程歷史",
      response: "歷史記錄列表"
    },
    
    "POST /api/cms/content/:id/workflow/assign": {
      description: "分配任務",
      body: {
        assignTo: "分配給用戶ID",
        notes: "分配備註"
      },
      response: "分配結果"
    }
  }
}
```

---

## 🎨 **CMS 前端組件架構**

### **React 組件庫設計**
```javascript
const cmsComponentArchitecture = {
  // 核心組件
  coreComponents: {
    "CMSLayout": "CMS 主要佈局組件",
    "ContentEditor": "富文本內容編輯器",
    "MediaUploader": "統一媒體上傳組件",
    "WorkflowStatus": "工作流程狀態顯示",
    "PermissionGuard": "權限控制組件"
  },
  
  // 內容管理組件
  contentComponents: {
    "ContentList": "內容列表組件",
    "ContentForm": "內容編輯表單",
    "ContentPreview": "內容預覽組件",
    "ContentSearch": "內容搜索組件",
    "ContentFilter": "內容篩選組件"
  },
  
  // 媒體管理組件
  mediaComponents: {
    "MediaLibrary": "媒體庫組件",
    "MediaGrid": "媒體網格顯示",
    "MediaUploadZone": "拖拽上傳區域",
    "MediaEditor": "媒體編輯器",
    "MediaSelector": "媒體選擇器"
  },
  
  // 工作流程組件
  workflowComponents: {
    "WorkflowBoard": "工作流程看板",
    "TaskList": "任務列表",
    "ApprovalPanel": "審核面板",
    "WorkflowHistory": "工作流程歷史",
    "NotificationCenter": "通知中心"
  },
  
  // 業務特定組件
  businessComponents: {
    "InterviewScheduler": "面試預約組件",
    "VVIPIntroEditor": "VVIP介紹編輯器",
    "EventManager": "活動管理組件",
    "ShowcaseCurator": "精彩活動集策展"
  }
}
```

---

## 🚀 **CMS 實施路線圖**

### **Phase 1: CMS 核心基礎 (2-3週)**
```javascript
const phase1Implementation = {
  backend: [
    "擴展 NeDB 數據庫架構",
    "實現核心 CMS API 端點",
    "S3/R2 媒體存儲整合",
    "基礎工作流程引擎"
  ],
  
  frontend: [
    "CMS 管理界面基礎架構",
    "統一媒體上傳組件",
    "基礎內容編輯器",
    "工作流程狀態顯示"
  ],
  
  deliverables: [
    "統一內容管理系統",
    "媒體存儲和處理",
    "基礎管理界面",
    "權限控制系統"
  ]
}
```

### **Phase 2: 面試系統整合 (2-3週)**
```javascript
const phase2Implementation = {
  integration: [
    "面試相關內容模板",
    "面試預約系統開發",
    "面試工作流程設計",
    "面試官管理功能"
  ],
  
  deliverables: [
    "完整面試預約系統",
    "面試內容管理",
    "面試工作流程",
    "用戶面試體驗"
  ]
}
```

### **Phase 3: VVIP 和活動系統 (4-6週)**
```javascript
const phase3Implementation = {
  vvipSystem: [
    "VVIP介紹服務整合",
    "內容製作工作流程",
    "客戶服務管理",
    "服務品質控制"
  ],
  
  eventSystem: [
    "活動管理系統整合",
    "精彩活動集自動化",
    "SEO優化處理",
    "社群分享功能"
  ]
}
```

---

## 📈 **CMS 效益分析**

### **開發效益**
```javascript
const developmentBenefits = {
  codeReuse: "組件重用率 > 80%",
  developmentSpeed: "新功能開發速度提升 50%",
  maintenanceCost: "維護成本降低 60%",
  consistency: "用戶體驗一致性 100%"
}
```

### **業務效益**
```javascript
const businessBenefits = {
  contentQuality: "統一審核標準提升內容品質",
  operationalEfficiency: "集中化管理提升運營效率",
  scalability: "新業務模組快速整合",
  userExperience: "一致的用戶體驗提升滿意度"
}
```

### **技術效益**
```javascript
const technicalBenefits = {
  architecture: "清晰的分層架構",
  scalability: "水平和垂直擴展能力",
  maintainability: "模組化設計易於維護",
  testability: "統一測試策略和工具"
}
```

---

**🎉 統一CMS架構將為 InfinityMatch 天造地設人成對平台提供強大的內容管理基礎，支撐所有業務模組的高效運營！**

---

*最後更新: 2025-07-14*  
*架構版本: v1.0*  
*狀態: 設計完成，準備實施*
