# API Reference

## Base URLs

### Development Environment
- Client: http://localhost:5173
- Server: http://localhost:3001
- API: http://localhost:3001/api
- Health: http://localhost:3001/health

### Production Environment
- **Domain Strategy**: New dedicated domain (planning) | Backup: shesocial.ahexagram.com
- **API Structure**: api.[domain] | Backup: api-shesocial.ahexagram.com
- **Admin Panel**: admin.[domain] (future)
- **CDN**: Cloudflare (DNS management)
- **SSL**: Automatic via Cloudflare
- **Deployment**: Render.com

## Authentication Endpoints

### User Authentication
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Current user**: `GET /api/auth/me`
- **Refresh token**: `POST /api/auth/refresh`
- **Change password**: `PUT /api/auth/change-password`
- **Logout**: `POST /api/auth/logout`

### Admin Authentication (獨立管理系統)
- **Admin login**: `POST /api/admin/auth/login`
- **Admin logout**: `POST /api/admin/auth/logout`
- **Admin profile**: `GET /api/admin/auth/profile`
- **Admin token refresh**: `POST /api/admin/auth/refresh`

## Admin Permission Management Endpoints
- **List permission atoms**: `GET /api/admin/permissions/atoms`
- **Create permission atom**: `POST /api/admin/permissions/atoms`
- **Grouped permissions**: `GET /api/admin/permissions/atoms/grouped`
- **Validate permissions**: `POST /api/admin/permissions/validate`
- **Check user permission**: `GET /api/admin/permissions/check/:permission`
- **List roles**: `GET /api/admin/roles`
- **Create role**: `POST /api/admin/roles`
- **Update role**: `PUT /api/admin/roles/:roleId`
- **Role capabilities**: `GET /api/admin/roles/:roleId/capabilities`
- **Create admin user**: `POST /api/admin/users`
- **Update admin user**: `PUT /api/admin/users/:adminId`
- **Audit logs**: `GET /api/admin/audit/logs`
- **Admin health check**: `GET /api/admin/health`

## Appointment System Endpoints (預約系統 API)

### 時段管理 (客戶管理專責)
- **Create appointment slot**: `POST /api/appointments/slots`
- **Get available slots**: `GET /api/appointments/slots/available`
- **Update slot**: `PUT /api/appointments/slots/:slotId`
- **Delete slot**: `DELETE /api/appointments/slots/:slotId`

### 預約管理 (會員+訪客)
- **Create booking**: `POST /api/appointments/bookings`
- **Get user bookings**: `GET /api/appointments/bookings`
- **Update booking status**: `PUT /api/appointments/bookings/:bookingId/status`
- **Reschedule booking**: `PUT /api/appointments/bookings/:bookingId/reschedule`
- **Cancel booking**: `PUT /api/appointments/bookings/:bookingId/cancel`

### 面試官管理 (客戶管理專責)
- **Create interviewer**: `POST /api/appointments/interviewers`
- **Get interviewers**: `GET /api/appointments/interviewers`
- **Update interviewer**: `PUT /api/appointments/interviewers/:interviewerId`
- **Set availability**: `PUT /api/appointments/interviewers/:interviewerId/availability`

### 統計和管理
- **Get statistics**: `GET /api/appointments/stats`
- **Today's bookings**: `GET /api/appointments/today`
- **Reminder bookings**: `GET /api/appointments/reminders`

## Comprehensive Appointment API
- **Interviewers**: `GET/POST/PUT/DELETE /api/appointments/interviewers`
- **Appointment Slots**: `GET/POST/PUT/DELETE /api/appointments/slots`
- **Appointment Bookings**: `GET/POST/PUT/DELETE /api/appointments/bookings`
- **Availability Check**: `GET /api/appointments/slots/availability`
- **Analytics**: `GET /api/appointments/analytics`
- **Reports**: `GET /api/appointments/reports/export`

## Health & Monitoring Endpoints
- **Health Check**: `GET /health` - Comprehensive system status
- **Database Status**: Included in health endpoint
- **API Documentation**: `GET /` - Full endpoint listing

## Key Dependencies

### Frontend
- **dexie**: "^4.0.11" - IndexedDB wrapper
- **zustand**: "^5.0.6" - State management
- **react**: "^19.1.0" - UI framework
- **tailwindcss**: "^3.4.17" - Styling
- **typescript**: "~5.8.3" - Type safety
- **vite**: "^7.0.3" - Build tool
- **vite-plugin-pwa**: "^1.0.1" - PWA functionality
- **workbox-webpack-plugin**: "^7.3.0" - Service Worker

### Backend
- **nedb**: "^1.8.0" - Lightweight embedded database
- **express**: "^4.21.2" - Web framework
- **cors**: "^2.8.5" - Cross-origin resource sharing
- **helmet**: "^8.1.0" - Security middleware
- **morgan**: "^1.10.0" - HTTP request logger
- **bcrypt**: "^6.0.0" - Password hashing
- **jsonwebtoken**: "^9.0.2" - JWT authentication
- **typescript**: "^5.8.3" - Type safety
- **ts-node**: "^10.9.2" - TypeScript execution
- **nodemon**: "^3.1.10" - Development server