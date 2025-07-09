# SheSocial 前端

基於 React 19 + TypeScript + Tailwind CSS 的奢華社交平台前端應用。

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```
應用將在 http://localhost:5173/ 運行

### 構建生產版本
```bash
npm run build
```

## 🎨 設計系統

### 奢華色彩方案
- **主色**: 金色 (#d4af37) 到橙色 (#f18444) 漸變
- **輔助色**: 灰色系 (#f8f9fa 到 #202124)
- **奢華色**: 香檳色 (#f7e7ce), 珍珠色 (#faf0e6), 玫瑰金 (#f4c2c2)

### 組件系統
- **按鈕**: `.btn-luxury`, `.btn-luxury-outline`, `.btn-luxury-ghost`
- **卡片**: `.card-luxury`, `.card-luxury-hover`
- **輸入框**: `.input-luxury`
- **徽章**: `.badge-luxury`, `.badge-luxury-outline`
- **導航**: `.nav-luxury`
- **玻璃效果**: `.glass`

## 📱 響應式設計

### 斷點
- **手機**: < 640px (優先設計)
- **平板**: 640px - 1024px
- **桌面**: > 1024px

### 特色
- 手機優先設計 (90% 台灣用戶使用手機)
- 觸控友好的按鈕和互動元素
- 快速載入針對 4G/5G 網路優化

## 🌏 國際化

### 支援語言
- **主要**: 繁體中文 (台灣)
- **次要**: 英文 (外籍人士)
- **未來**: 日文 (觀光客)

### 字體
- **主要**: Inter + Noto Sans TC
- **標題**: Noto Serif TC
- **等寬**: JetBrains Mono

## 🎯 核心功能

### 已實現 ✅
- 奢華設計系統和組件庫 (.btn-luxury, .card-luxury, .glass)
- 響應式導航和頁面布局 (mobile-first)
- 台灣本地化界面 (繁體中文 + Noto Sans TC)
- 互動式示範和動畫 (fade-in, slide-up)
- 玻璃形態效果和奢華色彩方案
- React 19 + TypeScript + Vite 基礎架構
- Tailwind CSS 4.x 完整配置

### 開發中 🔄
- IndexedDB 離線存儲 (Dexie.js) - 需要實現
- Service Worker + PWA 功能 - 需要配置
- 背景同步服務 - 需要開發
- 離線優先狀態管理 - 需要架構

### 計劃中 📋
- 用戶認證界面
- 活動瀏覽和詳情頁面
- 個人資料管理
- 支付流程界面
- VIP 會員功能
- 影片上傳和管理
- 即時通知系統

## 🚧 架構缺口分析

### 缺少的依賴包
```bash
# 需要安裝的離線優先依賴
npm install dexie zustand workbox-webpack-plugin
npm install vite-plugin-pwa
npm install --save-dev @types/dexie
```

### 缺少的目錄結構
```
src/
├── db/           # IndexedDB 設置 (缺少)
├── services/     # API 和同步服務 (缺少)
├── hooks/        # 自定義 Hooks (缺少)
├── types/        # TypeScript 類型 (缺少)
├── utils/        # 工具函數 (缺少)
├── components/   # 可重用組件 (缺少)
└── pages/        # 頁面組件 (缺少)
```

### 需要實現的功能
- [ ] IndexedDB 數據庫層 (與 NeDB 結構對應)
- [ ] Service Worker 配置
- [ ] 背景同步隊列
- [ ] 離線狀態檢測
- [ ] 數據衝突解決
- [ ] PWA 清單文件

---

*最後更新: 2024-07-08*