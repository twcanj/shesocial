# CLAUDE.md - InfinityMatch Development Guide

Essential guide for the InfinityMatch 天造地設人成對 luxury social platform.

## 🚀 Quick Start

### Development Commands
```bash
# Start development (always build first)
npm run build && npm run dev

# Development with fresh cache (troubleshooting)
npm run dev:fresh

# Health check
curl http://localhost:10000/health
```

### Environment
- **Client**: http://localhost:5173 (React 19 + TypeScript + Vite + React Router)
- **Server**: http://localhost:10000 (Node.js + Express + NeDB)
- **API**: http://localhost:10000/api
- **Marketing CTA System**: http://localhost:10000/api/marketing

## 🏗️ Architecture

### Core Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Dexie.js (IndexedDB) + React Router
- **Backend**: Node.js + Express + NeDB + JWT authentication
- **Design**: Zodiac-inspired luxury theme with imperial purple (#663399) and dark gold (#b8860b)
- **Language**: Traditional Chinese (Taiwan localization)
- **Routing**: URL-based routing with admin separation

### Key Features
- **4-Tier Membership**: visitor → registered → vip → vvip (updated membership structure)
- **Offline-First**: IndexedDB with bidirectional sync
- **Admin System**: Atomic permissions with 4 departments
- **Sales-Optimized**: Profile collection before payment
- **Enterprise Health**: Comprehensive monitoring system
- **Mobile-Optimized**: Responsive design with luxury theme and proper navigation
- **🎯 Marketing CTA System**: Enterprise-grade campaign management with real-time analytics

## 📋 Business Rules

### 🎯 Membership System (4-Tier Structure)

**Updated Membership Types:**
- **visitor**: No registration required
  - Can browse platform freely
  - Limited to viewing 3 activities maximum
  - No account creation needed
  
- **registered**: Free registration
  - Basic account with email/password
  - Can view up to 12 activities
  - Access to basic platform features
  
- **vip**: Paid membership NT$1,300
  - Priority booking for events
  - Enhanced platform features
  - Full event participation access
  
- **vvip**: Premium membership NT$2,500
  - All VIP features plus participant viewing
  - Maximum platform access
  - Premium support and services

### Member Onboarding Flow
1. **Enhanced Registration**: 3-step profile collection
2. **Payment**: Required before feature access
3. **Interview**: 30-minute video verification
4. **Media Upload**: After interview completion
5. **Content Moderation**: Admin approval required

### Activity Limits
- **Visitor**: 3 activities max
- **Registered**: 12 activities max
- **VIP/VVIP**: Unlimited access

## 📚 Documentation

### Essential References
- **[Business Rules](docs/business/BUSINESS_RULES.md)**: Membership & onboarding logic
- **[Appointment Rules](docs/business/APPOINTMENT_BUSINESS_RULES.md)**: Interview & booking system
- **[Admin System](docs/business/ADMIN_SYSTEM_ARCHITECTURE.md)**: Permissions & roles
- **[API Reference](docs/API_REFERENCE.md)**: Complete endpoint documentation
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)**: Extended development procedures
- **[Troubleshooting](docs/technical/TROUBLESHOOTING.md)**: Common issues & solutions
- **[Marketing CTA System](docs/marketing/MARKETING_CTA_SYSTEM.md)**: Campaign management & analytics

## 🎯 Current Status

### ✅ Complete Features
- Enterprise-grade platform with all core features implemented
- Sales-optimized registration flow with CRM integration
- Complete admin dashboard with atomic permissions + **LUXURY STYLING**
- **Complete Appointment/Booking System** with enterprise-grade features
- 30-minute interview system with booking management
- Media management with Cloudinary integration
- **Hesocial luxury design system** (WCAG AA compliant) across ALL pages
- Enterprise health monitoring system
- Production-ready deployment configuration
- **Admin & Management pages** fully updated with luxury styling
- **🎯 Marketing CTA System**: Enterprise campaign management with real-time analytics

### 🔄 Next Phase
- LINE Pay integration for Taiwan market
- Advanced media features (video upload)
- Payment processing (Apple Pay, Google Pay)
- LINE Official Account integration

### 🚀 Production Status
- Complete enterprise platform with luxury styling
- 4-tier membership system with payment integration
- Enterprise appointment system (1,380 slots, 9 interviewers)
- Admin dashboard with atomic permissions
- Mobile-optimized responsive design
- JWT authentication with secure session management
- **Marketing CTA System**: 5 database collections, 20+ API endpoints, real-time tracking

## 🔧 Key Files

### Frontend Core
- `client/src/App.tsx` - Main app with React Router and AuthProvider
- `client/src/config/api.ts` - Centralized API configuration
- `client/src/db/offline-db.ts` - IndexedDB database
- `client/src/services/sync-service.ts` - Bidirectional sync
- `client/src/store/authStore.ts` - Authentication state

### Authentication System (Luxury Styled)
- `client/src/components/auth/AuthModal.tsx` - Modal container with luxury styling
- `client/src/components/auth/LoginForm.tsx` - Login form with luxury inputs
- `client/src/components/auth/RegisterForm.tsx` - Registration form with luxury styling and fixed dropdown contrast
- `client/src/contexts/AuthContext.tsx` - Authentication context provider
- `client/src/components/common/NavigationHeader.tsx` - Navigation with mobile profile button (fixed)
- `client/src/components/common/NavigationHeaderRouter.tsx` - React Router compatible navigation
- `client/src/pages/ProfilePage.tsx` - Profile page with proper navigation handling (fixed)
- `client/src/pages/HomePage.tsx` - Home page component with React Router navigation

### Admin System (Complete)
- `client/src/pages/AdminLoginPage.tsx` - Dedicated admin login page
- `client/src/pages/AdminDashboard.tsx` - Main admin interface
- `client/src/hooks/useAdminAuth.ts` - Admin authentication hook
- `server/src/routes/admin.ts` - Admin API routes with email/username login support

### Appointment/Booking System (Complete)
- `client/src/components/interview/InterviewBooking.tsx` - Interview booking interface (updated to use new API)
- `server/src/routes/appointments.ts` - Complete appointment system API routes
- `server/src/controllers/AppointmentController.ts` - Appointment management controller
- `server/src/models/AppointmentSlot.ts` - Appointment slot model with conflict detection
- `server/src/models/AppointmentBooking.ts` - Booking model with status management
- `server/src/models/Interviewer.ts` - Interviewer management with availability
- `server/src/types/appointments.ts` - TypeScript types for appointment system

### Marketing CTA System (Complete)
- `server/src/models/Marketing.ts` - Marketing data models and types
- `server/src/controllers/MarketingController.ts` - Campaign management controller
- `server/src/services/CTAAnalyticsService.ts` - Real-time analytics service
- `server/src/services/CTAContentService.ts` - Dynamic content management
- `server/src/routes/marketing.ts` - Marketing campaign API routes
- `server/src/routes/analytics.ts` - Analytics tracking API routes
- `server/src/middleware/adminAuth.ts` - Admin authentication middleware
- `client/src/components/ui/CTASection.tsx` - Reusable CTA component (luxury styled)

### Backend Core
- `server/src/index.ts` - Server entry point
- `server/src/db/nedb-setup.ts` - Database setup (21 collections)
- `server/src/routes/` - API routes (auth, admin, appointments, marketing, analytics)
- `server/src/services/StartupHealthCheck.ts` - Health monitoring

### Configuration
- `client/tailwind.config.js` - Luxury design system
- `client/vite.config.ts` - Build configuration
- `server/tsconfig.json` - TypeScript configuration

## 💡 Development Notes

### 🛠️ Development Setup

#### Troubleshooting
```bash
# Cache issues
npm run dev:fresh

# Full rebuild
npm run build

# Hard refresh browser
Ctrl+Shift+R
```

#### Testing
```bash
# Health check
curl http://localhost:10000/health

# Admin login test
curl -X POST http://localhost:10000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infinitymatch.com","password":"admin123"}'

# Marketing CTA system test
curl -X GET "http://localhost:10000/api/marketing/cta/personalized?membershipType=visitor&pageRoute=/"

# CTA tracking test
curl -X POST http://localhost:10000/api/analytics/track/impression \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"test-campaign","context":{"placement":"homepage"}}'
```

### 🗄️ Data Architecture
- **Backend**: NeDB (21 collections) with JWT authentication
- **Frontend**: IndexedDB with bidirectional sync
- **Authentication**: 8-hour admin sessions, secure password hashing
- **Offline Support**: Full offline-first architecture
- **Marketing System**: 5 dedicated collections for campaign management

### Appointment System Architecture
**Database Collections:**
- `appointments_slots`: 1,380 appointment slots with time conflict detection
- `appointment_bookings`: User booking records with status management
- `interviewers`: 9 active interviewers with availability scheduling
- `availability_overrides`: Dynamic availability modifications
- `appointment_notifications`: Automated reminder system

**Appointment Types:**
- `consultation`: Pre-registration consultations (public access)
- `member_interview`: 30-minute member verification interviews (authenticated)

**Interview Types:**
- `video_call`: Video conferences (primary method)
- `phone_call`: Phone interviews (backup option)
- `in_person`: Face-to-face meetings (premium option)

**Booking Flow:**
1. User selects available slot from calendar
2. System checks capacity and conflicts
3. Booking created with pending status
4. Email confirmation sent
5. Interviewer receives notification
6. Status updated to confirmed/completed

### Marketing CTA System Architecture
**Database Collections:**
- `marketing_campaigns`: Campaign management with targeting and analytics
- `marketing_templates`: Reusable CTA templates with variable processing
- `marketing_audiences`: Dynamic and static audience segmentation
- `marketing_analytics`: Real-time performance metrics and insights
- `marketing_events`: User interaction tracking (impressions, clicks, conversions)

**Campaign Features:**
- **Personalized Content**: Dynamic CTAs based on user membership and behavior
- **Real-time Analytics**: Impression, click, and conversion tracking
- **A/B Testing**: Multiple variants with statistical analysis
- **Audience Targeting**: Advanced segmentation with behavioral filters
- **Template System**: Reusable templates with variable substitution

**API Endpoints:**
- **Public**: `/api/marketing/cta/*` - Content delivery and tracking
- **Analytics**: `/api/analytics/*` - Performance monitoring
- **Management**: `/api/marketing/*` - Campaign administration

### 🌐 Routing Structure

**Regular User Routes:**
- `/` - Home page with login/registration
- `/events` - Events listing and booking
- `/members` - Member information and management
- `/about` - About page and consultation booking
- `/pricing` - Membership pricing and payment
- `/profile` - User profile management

**Admin Routes:**
- `/admin_login` - Admin login page (email + password)
- `/admin/dashboard` - Main admin dashboard (after login)
- `/admin/events` - Manage ongoing events
- `/admin/interviews` - Manage interviews and scheduling
- `/admin/reports` - Manage successful held events

**Admin Credentials:**
- **Email**: `admin@infinitymatch.com`
- **Password**: `admin123`
- **Login URL**: `http://localhost:5173/admin_login`

### API Endpoints (Updated)
**Authentication:**
- `POST /api/auth/register` - Registration with new membership types (registered, vip, vvip)
- `POST /api/auth/login` - Login with JWT token
- `GET /api/auth/me` - Get current user profile

**Admin Authentication:**
- `POST /api/admin/auth/login` - Admin login (accepts email or username)
- `POST /api/admin/auth/logout` - Admin logout
- `POST /api/admin/auth/refresh` - Refresh admin token
- `GET /api/admin/auth/profile` - Get admin profile

**Appointment System (Complete):**
- `GET /api/appointments/slots/available` - Get available appointment slots
- `POST /api/appointments/slots` - Create appointment slots (VIP+ only)
- `GET /api/appointments/slots/:slotId` - Get slot details
- `PUT /api/appointments/slots/:slotId` - Update slot (VIP+ only)
- `DELETE /api/appointments/slots/:slotId` - Delete slot (VIP+ only)
- `POST /api/appointments/bookings` - Create booking (authenticated)
- `GET /api/appointments/bookings` - Get user bookings
- `GET /api/appointments/bookings/:bookingId` - Get booking details
- `PUT /api/appointments/bookings/:bookingId/status` - Update booking status (VIP+ only)
- `PUT /api/appointments/bookings/:bookingId/reschedule` - Reschedule booking
- `PUT /api/appointments/bookings/:bookingId/cancel` - Cancel booking
- `GET /api/appointments/interviewers` - Get active interviewers
- `POST /api/appointments/interviewers` - Create interviewer (VVIP only)
- `GET /api/appointments/stats` - Get appointment statistics (VIP+ only)

**Marketing CTA System (Complete):**
- `GET /api/marketing/cta/personalized` - Get personalized CTA content (public)
- `GET /api/marketing/cta/placement/:placement` - Get CTA for specific placement (public)
- `GET /api/marketing/cta/should-show` - Check CTA frequency rules (public)
- `GET /api/marketing/cta/ab-test/:campaignId` - Get A/B test variants (public)
- `GET /api/marketing/campaigns` - Get campaigns (admin)
- `POST /api/marketing/campaigns` - Create campaign (admin)
- `PUT /api/marketing/campaigns/:campaignId` - Update campaign (admin)
- `DELETE /api/marketing/campaigns/:campaignId` - Delete campaign (admin)
- `GET /api/marketing/templates` - Get templates (admin)
- `POST /api/marketing/templates` - Create template (admin)
- `POST /api/marketing/templates/:templateId/process` - Process template with variables (admin)
- `GET /api/marketing/templates/system` - Get system templates (admin)
- `GET /api/marketing/audiences` - Get audiences (admin)
- `POST /api/marketing/audiences` - Create audience (admin)
- `POST /api/marketing/audiences/:audienceId/refresh` - Refresh audience stats (admin)

**Marketing Analytics (Complete):**
- `POST /api/analytics/track/impression` - Track CTA impression (public)
- `POST /api/analytics/track/click` - Track CTA click (public)
- `POST /api/analytics/track/conversion` - Track CTA conversion (public)
- `POST /api/analytics/track/dismiss` - Track CTA dismissal (public)
- `GET /api/analytics/campaigns/:campaignId/metrics` - Get campaign metrics (admin)
- `GET /api/analytics/campaigns/:campaignId/realtime` - Get real-time analytics (admin)
- `GET /api/analytics/campaigns/:campaignId/ab-test` - Get A/B test results (admin)
- `GET /api/analytics/campaigns/:campaignId/demographics` - Get demographic breakdown (admin)
- `GET /api/analytics/dashboard` - Get marketing dashboard (admin)
- `GET /api/analytics/export` - Export analytics data (admin)

**Membership Access Control:**
- **visitor**: No API access (browse only)
- **registered**: Basic API access for profile and events
- **vip**: Enhanced API access with priority features
- **vvip**: Full API access including participant viewing

**Protected Routes:**
- `requireMembership('vip', 'vvip')` - VIP and VVIP access only
- `requirePermission('viewParticipants')` - VVIP only
- `requirePermission('priorityBooking')` - VIP and VVIP

### Design System
- **Luxury Theme**: Gold (#D4AF37) and midnight black (#0C0C0C)
- **WCAG AA Compliant**: Optimized contrast for accessibility
- **Component System**: Consistent luxury styling across all interfaces

---

**Platform Status**: ✅ **Production Ready** - Complete enterprise-grade social platform for Taiwan market

---

**Platform Summary**: Enterprise-grade luxury social platform for Taiwan market with complete appointment system, 4-tier membership structure, marketing CTA system, and production-ready deployment.

**Key Documentation**: See docs/ folder for detailed business rules, API reference, and troubleshooting guides.