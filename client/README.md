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
- Tailwind CSS 3.4.17 完整配置 (已修復兼容性)
- **IndexedDB 離線存儲 (Dexie.js) - 🎉 新完成**
- **離線優先狀態管理 - 🎉 新完成**
- **實時數據庫統計 - 🎉 新完成**
- **網路狀態檢測 - 🎉 新完成**

### 開發中 🔄
- Service Worker + PWA 功能 - 需要配置
- 背景同步服務 - 需要開發

### 計劃中 📋
- 用戶認證界面
- 活動瀏覽和詳情頁面
- 個人資料管理
- 支付流程界面
- VIP 會員功能
- 影片上傳和管理
- 即時通知系統

## 🎉 離線功能測試結果

### ✅ 測試通過項目
- **基本離線操作**: 點擊計數器在離線狀態下正常運作
- **數據持久化**: IndexedDB 成功存儲和讀取數據
- **狀態管理**: React hooks 與離線數據庫完美整合
- **網路檢測**: 在線/離線狀態正確顯示
- **實時統計**: 數據庫使用情況實時更新

### 📊 技術實現
```javascript
const offlineFeatures = {
  database: 'IndexedDB (Dexie.js)',
  dataModel: 'NeDB 兼容文檔結構',
  hooks: 'useOfflineDB, useUsers, useEvents, useBookings',
  sync: '雙向同步架構基礎',
  testing: '✅ 離線功能驗證通過'
}
```

---

*最後更新: 2024-07-08*