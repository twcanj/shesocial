# SheSocial 奢華社交活動平台

台灣高端社交活動平台，專注於隱私保護、會員分級和優質體驗。

## 🚀 快速開始

### 安裝依賴
```bash
npm run install:all
```

### 開發模式
```bash
npm run dev
```
前端將在 http://localhost:5173/ 運行  
後端將在 http://localhost:3001/ 運行

### 構建部署
```bash
npm run build
npm start
```

## 📁 項目結構

```
shesocial/
├── client/                 # React 前端
│   ├── src/
│   │   ├── components/     # 可重用組件
│   │   ├── pages/         # 頁面組件
│   │   ├── hooks/         # 自定義 Hooks
│   │   ├── services/      # API 服務
│   │   ├── utils/         # 工具函數
│   │   └── types/         # TypeScript 類型定義
│   └── public/
├── server/                 # Node.js 後端
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 數據模型
│   │   ├── routes/        # API 路由
│   │   ├── middleware/    # 中間件
│   │   ├── services/      # 業務邏輯
│   │   └── utils/         # 工具函數
│   └── dist/
├── shared/                 # 共享類型和工具
└── docs/                   # 文檔
```

## 🛠️ 技術架構

### 前端架構
- **框架**: React 19 + TypeScript + Vite
- **樣式**: Tailwind CSS 4.x + 自定義奢華設計系統
- **狀態管理**: React Hooks + CRDT (Yjs) 本地同步
- **離線支持**: NeDB 瀏覽器存儲 + PWA
- **特色**: 台灣本地化 + 手機優先設計

### 後端架構
- **運行時**: Node.js + Express + TypeScript
- **數據庫**: CRDT (Yjs) + NeDB 輕量存儲
- **支付**: LINE Pay (主要) + ECPay (備用)
- **媒體**: Cloudinary 圖片/影片處理
- **存儲**: Cloudflare R2 持久化

### 部署策略
- **平台**: Render.com 免費層
- **域名**: 自定義域名 + SSL
- **監控**: 基本日誌 + 錯誤追蹤
- **備份**: 自動 R2 同步備份

## 🎯 核心特色

- 🔄 **離線優先**: 捷運隧道也能使用
- 💳 **台灣支付**: LINE Pay 主要支付方式
- 📱 **行動優先**: 90% 手機用戶優化
- 🔒 **隱私保護**: CRDT 衝突解決 + 數據加密
- 💎 **奢華體驗**: 高端用戶專屬功能

## 📊 開發進度

查看 [CONCISE_IMPLEMENTATION_PLAN.md](./CONCISE_IMPLEMENTATION_PLAN.md) 了解詳細開發計劃。

### 已完成 ✅
- [x] 項目結構設置 (client/, server/, shared/)
- [x] React 19 + TypeScript + Tailwind CSS 前端
- [x] 奢華設計系統 (luxury color palette, components)
- [x] 台灣本地化界面 (繁體中文)
- [x] 響應式設計 (mobile-first)
- [x] 環境配置 (.env.example)

### 進行中 🔄
- [ ] Node.js + Express + TypeScript 後端
- [ ] CRDT (Yjs) + NeDB 架構概念驗證

### 待完成 📋
- [ ] 用戶認證系統
- [ ] LINE Pay 支付整合
- [ ] 活動 CRUD 操作
- [ ] Cloudinary 媒體上傳
- [ ] Render.com 部署配置

## 🌟 主要功能

### 用戶功能
- 註冊/登入 (email + LINE Login)
- 個人資料管理
- 活動瀏覽和報名
- 影片自我介紹
- VIP 會員專屬功能

### 管理功能
- 活動創建和管理
- 用戶審核系統
- 支付記錄查看
- 數據分析報表

## 🔧 環境配置

複製 `.env.example` 到 `.env` 並配置：

```env
NODE_ENV=development
PORT=3001
LINE_PAY_CHANNEL_ID=your_line_pay_channel_id
LINE_PAY_CHANNEL_SECRET=your_line_pay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_SECRET=your_jwt_secret
```

## 📱 支持的支付方式

1. **LINE Pay** (主要)
2. **Apple Pay / Google Pay**
3. **ECPay** (信用卡)
4. **銀行轉帳** (未來)

## 🎨 設計系統

基於 Tailwind CSS 的奢華風格設計系統，支持：
- 深色/淺色主題
- 響應式設計
- 無障礙設計
- 台灣本地化

## 🧪 測試

```bash
# 運行測試
npm test

# 測試覆蓋率
npm run test:coverage
```

## 🚀 部署

### Render.com 部署
1. 連接 GitHub 倉庫
2. 設置環境變數
3. 自動部署

### 本地 Docker 部署
```bash
docker-compose up -d
```

## 📄 許可證

MIT License - 查看 [LICENSE](./LICENSE) 文件了解詳情。

## 🤝 貢獻

歡迎提交 Issues 和 Pull Requests！

## 📞 聯繫

- 郵件: contact@shesocial.tw
- LINE: @shesocial
- 網站: https://shesocial.tw