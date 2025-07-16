# InfinityMatch 天造地設人成對 - API Reference
## Complete API Documentation

> **Status**: Production Ready
> **Last Updated**: 2025-07-16
> **Version**: 3.0

---

## Base URLs

### Development Environment
- Client: http://localhost:5173
- Server: http://localhost:10000
- API: http://localhost:10000/api
- Health: http://localhost:10000/health

### Production Environment
- **Domain**: TBD (planning phase)
- **Deployment**: Render.com
- **CDN**: Cloudflare
- **SSL**: Automatic

## Authentication Endpoints

### User Authentication
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Current user**: `GET /api/auth/me`
- **Refresh token**: `POST /api/auth/refresh`
- **Change password**: `PUT /api/auth/change-password`
- **Logout**: `POST /api/auth/logout`

### Admin Authentication
- **Admin login**: `POST /api/admin/auth/login` (supports email/username)
- **Admin logout**: `POST /api/admin/auth/logout`
- **Admin profile**: `GET /api/admin/auth/profile`
- **Admin token refresh**: `POST /api/admin/auth/refresh`
- **Credentials**: admin@infinitymatch.com / admin123

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

## Appointment System API

### Appointment Slots
- **Create slot**: `POST /api/appointments/slots` (VIP+ only)
- **Get available slots**: `GET /api/appointments/slots/available`
- **Get slot details**: `GET /api/appointments/slots/:slotId`
- **Update slot**: `PUT /api/appointments/slots/:slotId` (VIP+ only)
- **Delete slot**: `DELETE /api/appointments/slots/:slotId` (VIP+ only)

### Bookings
- **Create booking**: `POST /api/appointments/bookings` (authenticated)
- **Get user bookings**: `GET /api/appointments/bookings`
- **Get booking details**: `GET /api/appointments/bookings/:bookingId`
- **Update booking status**: `PUT /api/appointments/bookings/:bookingId/status` (VIP+ only)
- **Reschedule booking**: `PUT /api/appointments/bookings/:bookingId/reschedule`
- **Cancel booking**: `PUT /api/appointments/bookings/:bookingId/cancel`

### Interviewers
- **Get active interviewers**: `GET /api/appointments/interviewers`
- **Create interviewer**: `POST /api/appointments/interviewers` (VVIP only)

### Analytics
- **Get appointment statistics**: `GET /api/appointments/stats` (VIP+ only)

## Events API

### Event Management
- **Get all events**: `GET /api/events`
- **Get event details**: `GET /api/events/:eventId`
- **Create event**: `POST /api/events` (admin only)
- **Update event**: `PUT /api/events/:eventId` (admin only)
- **Delete event**: `DELETE /api/events/:eventId` (admin only)

### Event Bookings
- **Book event**: `POST /api/events/:eventId/book` (VIP+ only)
- **Get event participants**: `GET /api/events/:eventId/participants` (VVIP only)
- **Cancel booking**: `DELETE /api/events/:eventId/book`

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
- **@seald-io/nedb**: "^4.1.2" - Embedded database
- **express**: "^4.21.2" - Web framework
- **cors**: "^2.8.5" - Cross-origin resource sharing
- **helmet**: "^8.1.0" - Security middleware
- **morgan**: "^1.10.0" - HTTP request logger
- **bcrypt**: "^6.0.0" - Password hashing
- **jsonwebtoken**: "^9.0.2" - JWT authentication
- **uuid**: "^11.1.0" - UUID generation
- **typescript**: "^5.8.3" - Type safety