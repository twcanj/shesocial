# 系統健康監控文檔

## 🏥 健康檢查 API

### 概述
InfinityMatch 平台提供全面的健康監控端點，用於實時監控系統狀態、資料庫健康、和基礎設施指標。

### 端點
```
GET /health
```

**特點**:
- ✅ 無需身份驗證（公開端點）
- ✅ 專為負載均衡器設計
- ✅ 包含完整資料庫狀態
- ✅ R2 雲端同步準備狀態
- ✅ 實時記憶體和性能指標

## 📊 回應結構

### 完整回應範例
```json
{
  "success": true,
  "message": "SheSocial Backend is healthy",
  "timestamp": 1752545736248,
  "environment": "development",
  "version": "1.0.0",
  "uptime": 71.988724576,
  "memory": {
    "used": 148,
    "total": 150, 
    "rss": 240
  },
  "database": {
    "status": "connected",
    "dataPath": "/home/yanggf/a/shesocial/server/data",
    "collections": {
      "users": 6,
      "events": 0,
      "bookings": 0,
      "syncQueue": 0,
      "appointments_slots": 920,
      "appointment_bookings": 0,
      "interviewers": 6,
      "availability_overrides": 0,
      "appointment_notifications": 0
    },
    "files": [
      {
        "name": "appointments-slots.db",
        "size": 508,
        "modified": "2025-07-15T02:14:27.032Z"
      },
      {
        "name": "users.db",
        "size": 7,
        "modified": "2025-07-15T02:14:27.024Z"
      },
      {
        "name": "interviewers.db", 
        "size": 9,
        "modified": "2025-07-15T02:14:27.024Z"
      }
    ],
    "totalFiles": 9,
    "r2Ready": true
  }
}
```

### 錯誤回應範例
```json
{
  "success": false,
  "message": "Health check failed",
  "error": "Database connection error",
  "timestamp": 1752545736248
}
```

## 🔍 監控指標詳解

### 伺服器健康指標
| 欄位 | 類型 | 描述 | 單位 |
|------|------|------|------|
| `success` | boolean | 系統整體健康狀態 | - |
| `uptime` | number | 伺服器運行時間 | 秒 |
| `environment` | string | 運行環境 | dev/prod |
| `version` | string | API 版本號 | semver |

### 記憶體監控
| 欄位 | 類型 | 描述 | 單位 |
|------|------|------|------|
| `memory.used` | number | 已使用堆記憶體 | MB |
| `memory.total` | number | 總堆記憶體 | MB |
| `memory.rss` | number | 常駐記憶體大小 | MB |

### 資料庫健康監控
| 欄位 | 類型 | 描述 |
|------|------|------|
| `database.status` | string | 連線狀態 (connected/error) |
| `database.dataPath` | string | 資料庫檔案路徑 |
| `database.collections` | object | 各集合記錄數量 |
| `database.files` | array | 資料庫檔案詳情 |
| `database.totalFiles` | number | 資料庫檔案總數 |
| `database.r2Ready` | boolean | R2 雲端同步準備狀態 |

### 資料庫集合監控
```javascript
// 重要集合及其用途
{
  "users": 6,                    // 平台用戶數
  "appointments_slots": 920,     // 可預約時段數
  "interviewers": 6,             // 面試官數量
  "appointment_bookings": 0,     // 已預約數量
  "events": 0,                   // 活動數量
  "bookings": 0                  // 活動預約數量
}
```

### 檔案系統監控
```javascript
// 每個資料庫檔案資訊
{
  "name": "appointments-slots.db",
  "size": 508,                   // KB
  "modified": "2025-07-15T02:14:27.032Z"
}
```

## 🚨 監控警報設定

### 關鍵警報指標
1. **系統健康**
   - `success !== true` - 系統故障
   - `uptime < 60` - 頻繁重啟

2. **記憶體警報**  
   - `memory.used > 500` MB - 記憶體使用過高
   - `memory.rss > 1000` MB - 記憶體洩漏風險

3. **資料庫警報**
   - `database.status !== "connected"` - 資料庫連線問題
   - `collections.users === 0` - 用戶資料遺失
   - `collections.appointments_slots < 100` - 預約時段不足

4. **檔案系統警報**
   - `totalFiles !== 9` - 資料庫檔案遺失
   - 任何檔案 `size === "error"` - 檔案系統問題

### Prometheus 監控範例
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'infinitymatch-health'
    static_configs:
      - targets: ['localhost:10000']
    metrics_path: '/health'
    scrape_interval: 30s
```

### Grafana 儀表板指標
```javascript
// 記憶體使用率
memory_usage_percent = (memory.used / memory.total) * 100

// 資料庫檔案總大小
total_db_size = sum(database.files[].size)

// 預約系統使用率  
appointment_utilization = (appointment_bookings / appointments_slots) * 100
```

## 🔧 運維操作

### 健康檢查腳本
```bash
#!/bin/bash
# health-check.sh
HEALTH_URL="http://localhost:10000/health"
RESPONSE=$(curl -s $HEALTH_URL)
SUCCESS=$(echo $RESPONSE | jq -r '.success')

if [ "$SUCCESS" != "true" ]; then
  echo "❌ Health check failed"
  echo $RESPONSE | jq
  exit 1
else
  echo "✅ System healthy"
  echo $RESPONSE | jq '.database.collections'
fi
```

### 負載均衡器配置
```nginx
# nginx.conf
upstream infinitymatch_backend {
    server localhost:10000;
    # 健康檢查配置
}

location /health {
    proxy_pass http://infinitymatch_backend/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Docker 健康檢查
```dockerfile
# Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1
```

## 📈 容量規劃

### 資料庫成長監控
```javascript
// 監控關鍵集合成長趨勢
const growthMetrics = {
  "daily_new_users": "users 集合每日新增",
  "appointment_slots_created": "每日新增預約時段", 
  "appointment_bookings_rate": "預約完成率",
  "file_size_growth": "資料庫檔案大小成長"
}
```

### R2 同步準備狀態
- `r2Ready: true` - 檔案儲存系統準備完成
- 所有 `.db` 檔案可直接上傳至 R2
- `syncToR2()` 和 `restoreFromR2()` 方法已準備

## 🎯 最佳實踐

### 監控頻率
- **負載均衡器**: 每 10 秒檢查一次
- **監控系統**: 每 30 秒收集指標  
- **警報系統**: 即時觸發
- **容量規劃**: 每日匯總分析

### 警報策略
1. **即時警報**: 系統故障、資料庫連線問題
2. **預警通知**: 記憶體使用率 > 80%、預約時段不足
3. **每日報告**: 系統使用統計、容量趨勢

### 資料備份
- 利用 `database.files` 資訊規劃備份
- 監控檔案修改時間判斷備份需求
- R2 同步狀態確保雲端備份就緒

---

**文檔版本**: v1.0  
**最後更新**: 2025-07-15  
**系統架構**: NeDB 持久化儲存 + R2 雲端同步  
**監控策略**: 全方位系統健康監控