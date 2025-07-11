# SheSocial 故障排除指南

## 前端開發環境問題

### 1. Vite 啟動失敗 - PWA 插件錯誤

**錯誤訊息:**
```
Cannot find package 'vite-plugin-pwa'
```

**解決方案:**
PWA 功能已暫時停用，因為 `vite-plugin-pwa` 尚未支援 Vite 7.x。

**修復步驟:**
1. 檢查 `vite.config.ts` 中 PWA 插件是否已註解
2. 如果需要 PWA 功能，可考慮降級到 Vite 6.x

### 2. PostCSS 配置錯誤

**錯誤訊息:**
```
Loading PostCSS Plugin failed: Cannot find module 'postcss-selector-parser'
```

**解決方案:**
```bash
cd client
npm install postcss-selector-parser
```

### 3. Tailwind CSS 4.x 配置問題

**錯誤訊息:**
```
It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin
```

**解決方案:**
1. 安裝新的 PostCSS 插件:
```bash
npm install --save-dev @tailwindcss/postcss
```

2. 更新 `postcss.config.js`:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

## 後端開發環境問題

### 1. 端口衝突

**錯誤訊息:**
```
EADDRINUSE: address already in use :::3001
```

**解決方案:**
```bash
# 查找佔用端口的進程
lsof -i :3001

# 終止進程
kill -9 <PID>
```

### 2. 數據庫連接問題

**錯誤訊息:**
```
Database connection failed
```

**解決方案:**
1. 檢查 `.env` 文件配置
2. 確認 NeDB 數據庫文件權限
3. 重新啟動後端服務

## 依賴管理問題

### 1. 依賴版本衝突

**解決方案:**
```bash
# 清除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json
npm install

# 或使用 legacy peer deps
npm install --legacy-peer-deps
```

### 2. 缺失依賴

**解決方案:**
```bash
# 重新安裝所有依賴
npm run install:all

# 或分別安裝
cd client && npm install
cd ../server && npm install
```

## 開發工具問題

### 1. TypeScript 編譯錯誤

**解決方案:**
1. 檢查 `tsconfig.json` 配置
2. 重新啟動 TypeScript 服務
3. 清除編譯緩存

### 2. ESLint 配置問題

**解決方案:**
1. 檢查 `.eslintrc` 配置
2. 更新 ESLint 規則
3. 重新啟動編輯器

## 常用修復命令

```bash
# 完全重置開發環境
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json
npm run install:all

# 清除 Vite 緩存
cd client
rm -rf .vite
npm run dev

# 重新啟動所有服務
npm run dev
```

## 獲取幫助

如果遇到其他問題，請：

1. 檢查 GitHub Issues
2. 查看項目文檔
3. 聯繫開發團隊

**聯繫方式:**
- 郵件: contact@shesocial.tw
- LINE: @shesocial
