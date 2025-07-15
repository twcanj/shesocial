# File Locations Reference

## Frontend Files

### Core Application
- **Main app routing**: `client/src/App.tsx` - Centralized AuthProvider with conditional page rendering
- **Main database**: `client/src/db/offline-db.ts:22`
- **Sync service**: `client/src/services/sync-service.ts:55`
- **Type definitions**: `client/src/types/database.ts:12`

### React Hooks
- **Main database hook**: `client/src/hooks/useOfflineDB.ts:9`
- **Sync status hook**: `client/src/hooks/useSyncStatus.ts`
- **Activity limits hook**: `client/src/hooks/useActivityLimits.ts` - Membership viewing limits management
- **Admin auth hook**: `client/src/hooks/useAdminAuth.ts` - Admin authentication state management

### PWA & Configuration
- **PWA utilities**: `client/src/utils/pwa-utils.ts:14`
- **Service Worker**: `client/public/sw.js`
- **Brand logo**: `client/public/logo.jpeg`
- **Vite PWA config**: `client/vite.config.ts:9`
- **Tailwind config**: `client/tailwind.config.js:7`

### Navigation & Pages
- **Shared navigation header**: `client/src/components/common/NavigationHeader.tsx` - Mobile hamburger menu + responsive design
- **Events page**: `client/src/pages/EventsPage.tsx` - Uses AuthReminder component
- **Members page**: `client/src/pages/MembersPage.tsx` - Navigation to pricing page instead of modal
- **About page**: `client/src/pages/AboutPage.tsx` - Uses reusable components
- **Pricing page**: `client/src/pages/PricingPage.tsx` - Comprehensive membership plans with shareable URL
- **Profile page**: `client/src/pages/ProfilePage.tsx` - Comprehensive member profile with tabs

### Reusable UI Components
- **Auth Context Provider**: `client/src/contexts/AuthContext.tsx` - Centralized auth state management
- **Generic Modal**: `client/src/components/ui/Modal.tsx` - ESC key support, accessibility features
- **Modal Trigger**: `client/src/components/ui/ModalTrigger.tsx` - Reusable modal state management
- **CTA Section**: `client/src/components/ui/CTASection.tsx` - Consistent CTA patterns
- **Auth Reminder**: `client/src/components/ui/AuthReminder.tsx` - Authentication prompts
- **Activity Limit Prompt**: `client/src/components/ui/ActivityLimitPrompt.tsx` - Membership upgrade prompts

### Authentication Components
- **Auth store**: `client/src/store/authStore.ts`
- **Login form**: `client/src/components/auth/LoginForm.tsx` - Complete functional form with validation
- **Register form**: `client/src/components/auth/RegisterForm.tsx` - Full registration with membership selection
- **Auth modal**: `client/src/components/auth/AuthModal.tsx` - Modal with login/register switching

### Modals
- **Consultation Modal**: `client/src/components/modals/ConsultationModal.tsx`
- **Membership Details**: `client/src/components/modals/MembershipDetailsModal.tsx` - Replaced by pricing page

### Media Management Components
- **Media Upload**: `client/src/components/media/MediaUpload.tsx` - Cloudinary integration with drag-and-drop
- **Media Gallery**: `client/src/components/media/MediaGallery.tsx` - Member media management interface
- **Admin Moderation**: `client/src/components/admin/ModerationDashboard.tsx` - Content review dashboard

### Interview System Components
- **Interview Booking**: `client/src/components/interview/InterviewBooking.tsx` - 30-minute interview scheduling

### Admin Dashboard Components
- **Admin Dashboard main page**: `client/src/pages/AdminDashboard.tsx` - Main admin interface with section routing
- **Admin Sidebar**: `client/src/components/admin/AdminSidebar.tsx` - Department-based navigation with color coding
- **Admin Overview**: `client/src/components/admin/AdminOverview.tsx` - System statistics and health monitoring
- **Permission Management**: `client/src/components/admin/PermissionManagement.tsx` - Atomic permission management UI
- **Role Management**: `client/src/components/admin/RoleManagement.tsx` - Role capabilities analysis and editing
- **User Management**: `client/src/components/admin/UserManagement.tsx` - Admin user management (placeholder)
- **Audit Log Viewer**: `client/src/components/admin/AuditLogViewer.tsx` - Operation logging interface (placeholder)

### Sync Components
- **Sync status indicator**: `client/src/components/sync/SyncStatusIndicator.tsx`
- **Sync progress panel**: `client/src/components/sync/SyncProgressPanel.tsx`
- **Sync components index**: `client/src/components/sync/index.ts`

## Backend Files

### Core Server
- **Server entry**: `server/src/index.ts`
- **NeDB setup**: `server/src/db/nedb-setup.ts:22`

### API Routes
- **API routes**: `server/src/routes/api.ts`
- **Auth routes**: `server/src/routes/auth.ts`
- **Admin routes**: `server/src/routes/admin.ts` - Atomic permission management API
- **Appointment routes**: `server/src/routes/appointments.ts` - 預約系統完整 API (425行)

### Models
- **User model**: `server/src/models/User.ts`
- **Event model**: `server/src/models/Event.ts`
- **Booking model**: `server/src/models/Booking.ts`
- **Admin Permission model**: `server/src/models/AdminPermission.ts` - 2層4類權限架構
- **Appointment models**: `server/src/models/AppointmentSlot.ts`, `server/src/models/AppointmentBooking.ts`, `server/src/models/Interviewer.ts`

### Controllers
- **Controllers directory**: `server/src/controllers/`
- **Auth controller**: `server/src/controllers/AuthController.ts`
- **Appointment controller**: `server/src/controllers/AppointmentController.ts` - 預約系統控制器 (578行)

### Services
- **Admin Permission service**: `server/src/services/AdminPermissionService.ts` - Permission validation and management
- **Startup Health Check service**: `server/src/services/StartupHealthCheck.ts` - Enterprise health monitoring

### Middleware
- **Auth middleware**: `server/src/middleware/auth.ts` - JWT + 2層4類權限驗證
- **CORS middleware**: `server/src/middleware/cors.ts`

## Documentation Files

### Core Documentation
- **Main project guide**: `CLAUDE.md`
- **Architecture overview**: `docs/ARCHITECTURE_OVERVIEW.md`
- **Development guide**: `docs/DEVELOPMENT_GUIDE.md`
- **API reference**: `docs/API_REFERENCE.md`
- **File locations**: `docs/FILE_LOCATIONS.md`

### Business Documentation
- **Business rules**: `docs/business/BUSINESS_RULES.md`
- **Admin system architecture**: `docs/business/ADMIN_SYSTEM_ARCHITECTURE.md`
- **Membership system**: `docs/business/MEMBERSHIP_SYSTEM_CORRECT.md`
- **Content management**: `docs/business/CONTENT_MANAGEMENT_ARCHITECTURE.md`

### Technical Documentation
- **Mobile optimization**: `docs/technical/MOBILE_OPTIMIZATION.md`
- **Troubleshooting**: `docs/technical/TROUBLESHOOTING.md`
- **CMS architecture**: `docs/technical/CMS_ARCHITECTURE.md`

### Deployment Documentation
- **Domain strategy**: `docs/deployment/DOMAIN_STRATEGY.md`
- **Domain management**: `docs/deployment/DOMAIN_MANAGEMENT.md`
- **Production config**: Planning new dedicated domain

### Operations Documentation
- **Health monitoring**: `docs/operations/HEALTH_MONITORING.md`

## TypeScript Types
**Note**: Types are currently inlined in `authStore.ts` due to browser caching issues during development

### Key Interfaces
- `UserProfile`: User data with membership info (inlined in authStore.ts)
- `EventData`: Event details with participant management
- `BookingData`: Event booking records
- `SyncQueueItem`: Offline sync operations

## Brand Assets

### Logo Implementation
- **Logo File**: `client/public/logo.jpeg` - Official InfinityMatch 天造地設人成對 logo with heart-shaped couple silhouettes
- **Header Integration**: 48x48px with luxury gold CSS filter treatment
- **Favicon**: Logo set as browser favicon and PWA icon
- **Color Optimization**: CSS filters applied to match luxury gold theme