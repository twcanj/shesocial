# InfinityMatch 天造地設人成對 - API Reference
## Complete API Documentation

> **Status**: Production Ready
> **Last Updated**: 2025-07-18
> **Version**: 3.2

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

**Session Management:**
- **User Sessions**: 24 hours default
- **Admin Sessions**: 8 hours with auto-refresh
- **JWT Security**: RS256 algorithm with rotation

### Admin Authentication
- **Admin login**: `POST /api/admin/auth/login` (supports email/username)
- **Admin logout**: `POST /api/admin/auth/logout`
- **Admin profile**: `GET /api/admin/auth/profile`
- **Admin token refresh**: `POST /api/admin/auth/refresh`
- **Credentials**: admin@infinitymatch.com / admin123

**Admin Session Details:**
- **Session Duration**: 8 hours
- **Refresh Token**: 24 hours
- **Auto-logout**: On inactivity
- **Permission Validation**: Real-time check

## Admin Permission Management Endpoints

### Permission Management
- **List permission atoms**: `GET /api/admin/permissions/atoms`
- **Create permission atom**: `POST /api/admin/permissions/atoms`
- **Grouped permissions**: `GET /api/admin/permissions/atoms/grouped`
- **Validate permissions**: `POST /api/admin/permissions/validate`
- **Check user permission**: `GET /api/admin/permissions/check/:permission`

### Role Management
- **List roles**: `GET /api/admin/roles`
- **Create role**: `POST /api/admin/roles`
- **Update role**: `PUT /api/admin/roles/:roleId`
- **Role capabilities**: `GET /api/admin/roles/:roleId/capabilities`

### Admin User Management
- **Create admin user**: `POST /api/admin/users`
- **Update admin user**: `PUT /api/admin/users/:adminId`

### Admin Event Management
- **Get all events**: `GET /api/admin/events` (admin:audit required)
- **Get event details**: `GET /api/admin/events/:id` (admin:audit required)
- **Update event status**: `PUT /api/admin/events/:id/status` (admin:edit required)
- **Delete event**: `DELETE /api/admin/events/:id` (admin:delete required)

### System Management
- **Audit logs**: `GET /api/admin/audit/logs`
- **Admin health check**: `GET /api/admin/health`

## Marketing CTA System API

### Marketing Campaign Management
- **Get marketing campaigns**: `GET /api/marketing/campaigns` (marketing:view required)
- **Create marketing campaign**: `POST /api/marketing/campaigns` (marketing:send required)
- **Get campaign details**: `GET /api/marketing/campaigns/:id` (marketing:view required)
- **Update campaign**: `PUT /api/marketing/campaigns/:id` (marketing:send required)
- **Delete campaign**: `DELETE /api/marketing/campaigns/:id` (marketing:send required)
- **Schedule campaign**: `POST /api/marketing/campaigns/:id/schedule` (marketing:schedule required)
- **Cancel scheduled campaign**: `DELETE /api/marketing/campaigns/:id/schedule` (marketing:schedule required)

### Marketing Templates
- **Get marketing templates**: `GET /api/marketing/templates` (marketing:view required)
- **Create template**: `POST /api/marketing/templates` (marketing:templates required)
- **Get template details**: `GET /api/marketing/templates/:id` (marketing:view required)
- **Update template**: `PUT /api/marketing/templates/:id` (marketing:templates required)
- **Delete template**: `DELETE /api/marketing/templates/:id` (marketing:templates required)

### Target Audience Management
- **Get target audiences**: `GET /api/marketing/audiences` (marketing:view required)
- **Create target audience**: `POST /api/marketing/audiences` (marketing:audiences required)
- **Get audience details**: `GET /api/marketing/audiences/:id` (marketing:view required)
- **Update audience**: `PUT /api/marketing/audiences/:id` (marketing:audiences required)
- **Delete audience**: `DELETE /api/marketing/audiences/:id` (marketing:audiences required)

### Marketing Analytics
- **Get campaign analytics**: `GET /api/marketing/analytics/campaigns` (marketing:analytics required)
- **Get campaign performance**: `GET /api/marketing/analytics/campaigns/:id` (marketing:analytics required)
- **Get audience response**: `GET /api/marketing/analytics/audience-response` (marketing:analytics required)
- **Get conversion metrics**: `GET /api/marketing/analytics/conversions` (marketing:analytics required)
- **Get optimal send times**: `GET /api/marketing/analytics/optimal-times` (marketing:analytics required)

### Event Marketing Triggers
- **Get event marketing status**: `GET /api/marketing/events/:eventId/status` (marketing:view required)
- **Get urgency level**: `GET /api/marketing/events/:eventId/urgency` (marketing:view required)
- **Trigger marketing campaign**: `POST /api/marketing/events/:eventId/trigger` (marketing:send required)
- **Get eligible events**: `GET /api/marketing/events/eligible` (marketing:view required)

## Appointment System API

### Appointment Slots
- **Create slot**: `POST /api/appointments/slots` (VIP+ only)
- **Get available slots**: `GET /api/appointments/slots/available`
- **Get slot details**: `GET /api/appointments/slots/:slotId`
- **Update slot**: `PUT /api/appointments/slots/:slotId` (VIP+ only)
- **Delete slot**: `DELETE /api/appointments/slots/:slotId` (VIP+ only)

### Bookings
- **Create booking**: `POST /api/appointments/bookings` (authenticated or guest)
- **Get user bookings**: `GET /api/appointments/bookings`
- **Get booking details**: `GET /api/appointments/bookings/:bookingId`
- **Update booking status**: `PUT /api/appointments/bookings/:bookingId/status` (VIP+ only)
- **Reschedule booking**: `PUT /api/appointments/bookings/:bookingId/reschedule`
- **Cancel booking**: `PUT /api/appointments/bookings/:bookingId/cancel`

**Guest Booking Support:**
- Visitors can book consultation appointments without registration
- Email verification required for guest booking access
- Guest bookings include contact information collection

### Interviewers
- **Get active interviewers**: `GET /api/appointments/interviewers`
- **Get interviewer details**: `GET /api/appointments/interviewers/:interviewerId`
- **Create interviewer**: `POST /api/appointments/interviewers` (VVIP only)
- **Update interviewer**: `PUT /api/appointments/interviewers/:interviewerId` (owner or VVIP)
- **Set availability**: `PUT /api/appointments/interviewers/:interviewerId/availability`
- **Get top performers**: `GET /api/appointments/interviewers/top-performers` (VIP+ only)

### Analytics & System
- **Get appointment statistics**: `GET /api/appointments/stats` (VIP+ only)
- **Get today's bookings**: `GET /api/appointments/today` (VIP+ only)
- **Get reminder notifications**: `GET /api/appointments/reminders` (VVIP only)

## User Management API

### User Operations
- **Get users**: `GET /api/users` (VIP+ only)
- **Get user count**: `GET /api/users/count` (authenticated)
- **Get user by ID**: `GET /api/users/:id` (authenticated)
- **Get user by email**: `GET /api/users/email/:email` (authenticated)
- **Create user**: `POST /api/users` (public - registration)
- **Update user**: `PUT /api/users/:id` (authenticated)
- **Update membership**: `PUT /api/users/:id/membership` (VIP+ only)
- **Delete user**: `DELETE /api/users/:id` (VIP+ only)
- **Search users**: `POST /api/users/search` (viewParticipants permission)

### Registration & Onboarding
- **Complete registration**: `POST /api/users/complete-registration` (authenticated)
- **Get recommendation**: `GET /api/users/recommendation` (authenticated)

### Sync Operations
- **Get modified users**: `GET /api/users/sync/:timestamp` (authenticated)
- **Bulk sync**: `POST /api/sync` (system)

## Events API

### Event Management
- **Get all events**: `GET /api/events` (public)
- **Get event count**: `GET /api/events/count` (authenticated)
- **Get upcoming events**: `GET /api/events/upcoming` (public)
- **Get event details**: `GET /api/events/:eventId` (public)
- **Get events by user**: `GET /api/events/user/:userId` (authenticated)
- **Create event**: `POST /api/events` (VIP+ only)
- **Update event**: `PUT /api/events/:eventId` (VIP+ only)
- **Update event status**: `PUT /api/events/:id/status` (VIP+ only)
- **Publish event**: `PUT /api/events/:id/publish` (VIP+ only)
- **Cancel event**: `PUT /api/events/:id/cancel` (VIP+ only)
- **Delete event**: `DELETE /api/events/:eventId` (VIP+ only)
- **Search events**: `POST /api/events/search` (public)

### Event Participation
- **Add participant**: `POST /api/events/:id/participants` (authenticated)
- **Remove participant**: `DELETE /api/events/:id/participants/:userId` (authenticated)

### Event Sync
- **Get modified events**: `GET /api/events/sync/:timestamp` (authenticated)

## Booking Management API

### Booking Operations
- **Get bookings**: `GET /api/bookings` (VIP+ only)
- **Get booking count**: `GET /api/bookings/count` (authenticated)
- **Get revenue stats**: `GET /api/bookings/revenue` (VIP+ only)
- **Get booking details**: `GET /api/bookings/:id` (authenticated)
- **Get bookings by user**: `GET /api/bookings/user/:userId` (authenticated)
- **Get bookings by event**: `GET /api/bookings/event/:eventId` (viewParticipants permission)
- **Get booking by user+event**: `GET /api/bookings/user/:userId/event/:eventId` (authenticated)
- **Get bookings by status**: `GET /api/bookings/status/:status` (VIP+ only)
- **Get bookings by payment**: `GET /api/bookings/payment-status/:paymentStatus` (VIP+ only)
- **Get booking count by status**: `GET /api/bookings/count/status/:status` (authenticated)

### Booking Management
- **Create booking**: `POST /api/bookings` (authenticated)
- **Update booking**: `PUT /api/bookings/:id` (authenticated)
- **Update booking status**: `PUT /api/bookings/:id/status` (authenticated)
- **Update payment status**: `PUT /api/bookings/:id/payment` (authenticated)
- **Confirm booking**: `PUT /api/bookings/:id/confirm` (authenticated)
- **Cancel booking**: `PUT /api/bookings/:id/cancel` (authenticated)
- **Complete booking**: `PUT /api/bookings/:id/complete` (authenticated)
- **Mark as paid**: `PUT /api/bookings/:id/paid` (authenticated)
- **Apply voucher**: `PUT /api/bookings/:id/voucher` (authenticated)
- **Delete booking**: `DELETE /api/bookings/:id` (authenticated)

### Booking Sync
- **Get modified bookings**: `GET /api/bookings/sync/:timestamp` (authenticated)

## System & Maintenance Endpoints

### Health & Monitoring
- **Health Check**: `GET /health` - Comprehensive system status
- **API Health**: `GET /api/health` - API service status
- **Database Stats**: `GET /api/stats` - Database statistics
- **API Documentation**: `GET /` - Full endpoint listing

### Database Maintenance
- **Insert test data**: `POST /api/seed` - Development only
- **Compact databases**: `POST /api/compact` - Admin maintenance
- **Create backup**: `POST /api/backup` - Admin maintenance

### Membership Access Control

**Access Levels:**
- **visitor**: Browse only, 3 activity limit
- **registered**: Basic API access, 12 activity limit  
- **vip**: Enhanced API access, priority features
- **vvip**: Full API access, participant viewing

**Permission Requirements:**
- `requireMembership('vip', 'vvip')` - VIP and VVIP access only
- `requirePermission('viewParticipants')` - VVIP only
- `requirePermission('priorityBooking')` - VIP and VVIP

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

## API Status Summary

**✅ Production Ready Features:**
- Complete authentication system (user + admin)
- 4-tier membership with access control
- Enterprise appointment/booking system
- Admin dashboard with atomic permissions
- Guest booking support for consultations
- Real-time health monitoring
- Database maintenance and backup
- Comprehensive audit logging
- Marketing CTA System with campaign management

**📊 Total Endpoints:** 100+ endpoints across 7 major API groups
**🔐 Security:** JWT with refresh tokens, RBAC permissions
**💾 Database:** 11 collections with real-time sync
**🚀 Performance:** Health score 100/100, enterprise-grade

*Last Updated: 2025-07-18 - Added Marketing CTA System API endpoints*