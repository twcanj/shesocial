# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Installation and Setup
```bash
# Install all dependencies (root, client, and server)
npm run install:all

# Install only client dependencies
cd client && npm install

# Install only server dependencies (when available)
cd server && npm install
```

### Development
```bash
# Start both client and server in development mode
npm run dev

# Start only client (frontend)
npm run dev:client

# Start only server (backend) - when implemented
npm run dev:server
```

### Build and Production
```bash
# Build both client and server
npm run build

# Build only client
npm run build:client

# Build only server (when available)
npm run build:server

# Start production server
npm start
```

### Client-specific Commands (from client/ directory)
```bash
# Development server (runs on localhost:5173)
npm run dev

# Development server with fresh dependency cache (troubleshooting)
npm run dev:fresh

# Clear Vite cache manually (when needed)
npm run clear-cache

# Production build
npm run build

# ESLint code linting
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Project Structure
```
shesocial/
├── client/                    # React frontend (main application)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── db/               # IndexedDB offline database
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API and sync services
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── server/                   # Node.js backend (planned, not implemented)
└── shared/                   # Shared types and utilities (planned)
```

### Technology Stack

**Frontend (Complete)**
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4.17 with luxury design system
- **State Management**: React Hooks + Zustand
- **Database**: IndexedDB (Dexie.js) for offline-first storage
- **PWA**: Service Worker + PWA capabilities with background sync

**Backend (Planned)**
- **Runtime**: Node.js + Express + TypeScript
- **Database**: NeDB (lightweight embedded database)
- **Sync**: Bidirectional sync with IndexedDB
- **Deployment**: Render.com

### Key Features Implemented

1. **Offline-First Architecture**
   - IndexedDB storage with Dexie.js
   - NeDB-compatible document structure
   - Sync queue for offline operations
   - Network status detection

2. **Luxury Design System**
   - Custom Tailwind CSS configuration
   - Luxury color palette (gold, champagne, pearl, rose)
   - Official brand logo with CSS filter optimization for luxury gold theming
   - Glass morphism effects
   - Responsive mobile-first design

3. **Taiwan Localization**
   - Traditional Chinese interface
   - Noto Sans TC + Noto Serif TC fonts
   - Mobile-optimized for Taiwan users

4. **PWA Implementation**
   - Service Worker with background sync
   - Offline-first capabilities
   - App installation support
   - Push notification ready
   - Taiwan-optimized manifest

## Database Architecture

### IndexedDB Structure (client/src/db/offline-db.ts)
- **users**: User profiles with membership tiers
- **events**: Social events with metadata
- **bookings**: User event bookings
- **syncQueue**: Pending sync operations

### TypeScript Types 
**Note**: Types are currently inlined in `authStore.ts` due to browser caching issues during development
Key interfaces:
- `UserProfile`: User data with membership info (inlined in authStore.ts)
- `EventData`: Event details with participant management
- `BookingData`: Event booking records
- `SyncQueueItem`: Offline sync operations

### Membership System
- **regular**: Basic membership (¥600 entry + ¥300/month)
- **vip**: VIP membership (¥1000 entry + ¥300/month)
- **premium_1300**: ¥1300 voucher package
- **premium_2500**: ¥2500 voucher package (can view participants)

## React Hooks (client/src/hooks/useOfflineDB.ts)
- `useOfflineDB()`: Main database hook
- `useUsers()`: User operations
- `useEvents()`: Event operations
- `useBookings()`: Booking operations
- `useNetworkSync()`: Network status and sync
- `useDBStats()`: Database statistics

## Sync Service (client/src/services/sync-service.ts)
- **Bidirectional Sync**: Complete IndexedDB ↔ NeDB synchronization
- **Authentication Integration**: JWT-secured API calls with permission filtering
- **Advanced Conflict Resolution**: Time-based + field-level merging strategies
- **Intelligent Queue Management**: Exponential backoff retry logic with priority
- **Network Adaptation**: Quality detection and adaptive sync behavior
- **Background Sync**: Service Worker integration with priority-based triggers
- **Real-time Monitoring**: Comprehensive sync statistics and progress tracking

## Business Rules (BUSINESS_RULES.md)
- Event scheduling: 6 events per 3-month cycle
- Voucher system: $100 and $200 vouchers for 2-day trips only
- Participant viewing: Only premium_2500 members can view full participant lists
- Video interviews: Required for all new members (30 minutes)

## Design System (client/tailwind.config.js)
- **Colors**: Luxury palette with gold, champagne, pearl themes
- **Typography**: Inter + Noto Sans TC for multilingual support
- **Components**: Custom luxury button, card, and glass effect styles
- **Animations**: Fade-in, slide-up, and pulse-luxury animations

## Development Notes

### Current Status - Core Platform Complete! 🎉
- ✅ Frontend architecture complete
- ✅ IndexedDB offline storage implemented
- ✅ Luxury design system implemented
- ✅ Taiwan localization complete
- ✅ Service Worker PWA implementation complete
- ✅ NeDB backend server implemented and running
- ✅ User authentication system implemented (JWT + bcrypt)
- ✅ Membership tier permissions and role-based access control
- ✅ Complete data synchronization service with CRDT conflict resolution
- ✅ Sync progress UI components with real-time monitoring
- ✅ **Event management frontend complete (CRUD + booking + participant management)**
- ✅ **Development environment stable and cache issues resolved**
- ✅ **Brand identity integrated with luxury logo and color optimization**
- ✅ **Complete navigation system with consistent header across all pages**
- ✅ **Full routing implementation for all main module functions (活動, 會員, 關於)**
- ✅ **Authentication integration with login/register modal system**
- ✅ **Functional authentication forms with validation and error handling**
- ✅ **Complete call-to-action functionality across all pages**
- ❌ Payment integration pending (next phase)

### Next Development Phase (Phase 2)
1. **Payment Integration**: LINE Pay (primary) + ECPay (backup) + Apple/Google Pay
2. **Media Features**: Cloudinary video upload + profile management
3. **Production Deployment**: Render.com + domain + SSL configuration
4. **Analytics & Monitoring**: User behavior tracking + performance monitoring

### File Locations

**Frontend:**
- Main database: `client/src/db/offline-db.ts:22`
- Sync service: `client/src/services/sync-service.ts:55`
- Type definitions: `client/src/types/database.ts:12`
- React hooks: `client/src/hooks/useOfflineDB.ts:9`
- Sync status hook: `client/src/hooks/useSyncStatus.ts`
- PWA utilities: `client/src/utils/pwa-utils.ts:14`
- Service Worker: `client/public/sw.js`
- Brand logo: `client/public/logo.jpeg`
- Vite PWA config: `client/vite.config.ts:9`
- Tailwind config: `client/tailwind.config.js:7`

**Navigation & Pages:**
- Main app routing: `client/src/App.tsx` - Refactored with AuthProvider
- Shared navigation header: `client/src/components/common/NavigationHeader.tsx`
- Events page: `client/src/pages/EventsPage.tsx` - Uses AuthReminder component
- Members page: `client/src/pages/MembersPage.tsx` - Uses ModalTrigger pattern
- About page: `client/src/pages/AboutPage.tsx` - Uses reusable components

**Reusable UI Components:**
- Auth Context Provider: `client/src/contexts/AuthContext.tsx`
- Generic Modal: `client/src/components/ui/Modal.tsx`
- Modal Trigger: `client/src/components/ui/ModalTrigger.tsx`
- CTA Section: `client/src/components/ui/CTASection.tsx`
- Auth Reminder: `client/src/components/ui/AuthReminder.tsx`
- Consultation Modal: `client/src/components/modals/ConsultationModal.tsx`
- Membership Details: `client/src/components/modals/MembershipDetailsModal.tsx`

**Sync Components:**
- Sync status indicator: `client/src/components/sync/SyncStatusIndicator.tsx`
- Sync progress panel: `client/src/components/sync/SyncProgressPanel.tsx`
- Sync components index: `client/src/components/sync/index.ts`

**Backend:**
- Server entry: `server/src/index.ts`
- NeDB setup: `server/src/db/nedb-setup.ts:22`
- API routes: `server/src/routes/api.ts`
- Auth routes: `server/src/routes/auth.ts`
- User model: `server/src/models/User.ts`
- Event model: `server/src/models/Event.ts`
- Booking model: `server/src/models/Booking.ts`
- Controllers: `server/src/controllers/`
- Auth controller: `server/src/controllers/AuthController.ts`
- Auth middleware: `server/src/middleware/auth.ts`
- CORS middleware: `server/src/middleware/cors.ts`

**Authentication:**
- Auth store: `client/src/store/authStore.ts`
- Login form: `client/src/components/auth/LoginForm.tsx` - Complete functional form with validation
- Register form: `client/src/components/auth/RegisterForm.tsx` - Full registration with membership selection
- Auth modal: `client/src/components/auth/AuthModal.tsx` - Modal with login/register switching

### Development Environment
- Client runs on http://localhost:5173
- Server runs on http://localhost:3001
- API base URL: http://localhost:3001/api
- Health check: http://localhost:3001/health
- API documentation: http://localhost:3001

### Authentication Endpoints
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Current user: `GET /api/auth/me`
- Refresh token: `POST /api/auth/refresh`
- Change password: `PUT /api/auth/change-password`
- Logout: `POST /api/auth/logout`

### Key Dependencies

**Frontend:**
- **dexie**: "^4.0.11" - IndexedDB wrapper
- **zustand**: "^5.0.6" - State management
- **react**: "^19.1.0" - UI framework
- **tailwindcss**: "^3.4.17" - Styling
- **typescript**: "~5.8.3" - Type safety
- **vite**: "^7.0.3" - Build tool
- **vite-plugin-pwa**: "^1.0.1" - PWA functionality
- **workbox-webpack-plugin**: "^7.3.0" - Service Worker

**Backend:**
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

### Membership System
**4-Tier Membership Structure:**
- **Regular**: ¥600 entry + ¥300/month (basic access)
- **VIP**: ¥1000 entry + ¥300/month (priority booking)
- **Premium 1300**: ¥1300 voucher package (priority booking + vouchers)
- **Premium 2500**: ¥2500 voucher package (full access + view participants)

**Permission Levels:**
- `viewParticipants`: Only premium_2500 members
- `priorityBooking`: VIP and premium members
- API access varies by membership tier

### Payment Integration (Planned)
- Primary: LINE Pay
- Secondary: Apple Pay, Google Pay
- Backup: ECPay (credit cards)
- Future: Bank transfer

This is a Taiwan-focused luxury social platform with emphasis on offline-first architecture, privacy protection, premium user experience, and secure authentication.

## Key Technical Achievements

### Task 5: Data Synchronization Service ✅ Complete
- **Enhanced Sync Service**: JWT authentication integration with permission-based filtering
- **Bidirectional Sync Logic**: Complete CRDT-style IndexedDB ↔ NeDB synchronization
- **Advanced Conflict Resolution**: Time-based resolution with 1-minute threshold + field-level merging
- **Intelligent Queue Management**: Exponential backoff retry logic (2^retries minutes, max 30min)
- **Network Quality Detection**: Real-time quality assessment (good/slow/offline) with adaptive behavior
- **Background Sync Integration**: Service Worker API integration with priority-based triggers
- **Sync Progress UI**: Comprehensive monitoring components with Traditional Chinese localization
- **Authentication-Aware Sync**: Collection filtering based on user membership permissions

### Sync Features Implemented:
- **Smart Array Merging**: Videos and participants merged without duplicates
- **Priority-Based Queue**: High/medium/low priority processing with different retry limits
- **Error Classification**: Retryable vs non-retryable error detection
- **Real-time Statistics**: Detailed sync metrics, error rates, and performance tracking
- **Luxury UI Components**: Mobile-first sync status indicator and admin panel
- **Permission Control**: VIP+ for users collection, all authenticated for events/bookings

### Task 6: Complete Navigation System ✅ Complete
- **Shared Navigation Header**: Consistent NavigationHeader component across all pages
- **Complete Page Structure**: EventsPage, MembersPage, AboutPage with full functionality
- **Proper Routing**: App.tsx handles all navigation between main module functions
- **Authentication Integration**: Login/register buttons open AuthModal with proper state management
- **Current Page Highlighting**: Navigation shows active page with luxury gold styling
- **Responsive Design**: Mobile-first navigation with consistent luxury theming
- **User Status Display**: Shows logged-in user info and membership tier in header
- **Logout Functionality**: Proper logout handling with state cleanup

### Task 7: Authentication Forms Implementation ✅ Complete
- **Functional Login Form**: Complete LoginForm with email/password validation
- **Comprehensive Register Form**: Full registration with name, email, password, membership selection
- **Form Validation**: Password confirmation, length checks, email validation
- **Error Handling**: User-friendly error messages with proper styling
- **Loading States**: Spinner animations during authentication requests
- **Modal Integration**: Seamless switching between login/register modes
- **Store Integration**: Proper integration with useAuthStore for API calls
- **Luxury Styling**: Consistent luxury design system throughout forms
- **Mobile Responsive**: Optimized forms for mobile-first experience
- **Business Logic**: Membership tier selection and terms acceptance

### Task 8: Call-to-Action Functionality ✅ Complete
- **AboutPage CTA Integration**: "立即加入" and "預約諮詢" buttons fully functional
- **Consultation Booking Modal**: Comprehensive video interview booking system
- **Contact Integration**: Phone dialer and email template functionality
- **MembersPage CTA Integration**: "立即註冊" and "了解更多" buttons operational
- **EventsPage CTA Integration**: Authentication reminder "登入" and "註冊會員" buttons functional
- **Detailed Membership Modal**: Complete membership comparison table and information
- **Business Rules Documentation**: Voucher rules, activity scheduling, application process
- **Recommendation System**: Membership tier recommendations based on user needs
- **Safety Information**: Security guarantees and privacy protection details
- **Multi-contact Options**: Phone, email, and service hour information
- **Seamless Registration Flow**: All CTAs properly integrated with authentication system
- **Universal Modal Integration**: All authentication buttons across platform connect to single modal system

### Task 9: Architecture Refactoring ✅ Complete
- **Centralized Auth Context**: Global authentication state management eliminates prop drilling
- **Reusable Modal System**: Generic Modal component with specific content components
- **Component Composition**: ModalTrigger pattern for flexible modal handling
- **Eliminated Code Duplication**: Single source of truth for authentication and modals
- **Proper Component Architecture**: Separation of concerns and reusable patterns
- **Context Provider Pattern**: AuthProvider wraps entire app with global auth state
- **Clean Component Interfaces**: Removed unnecessary prop passing between components
- **Type Safety**: Proper TypeScript imports and interface definitions
- **Build Optimization**: Successful build after complete refactoring

## Vite Cache Management

### Normal Development (Recommended)
```bash
npm run dev  # Uses Vite's optimized caching for best performance
```

### Cache Troubleshooting (When Needed)
```bash
# Force fresh dependency optimization
npm run dev:fresh

# Manual cache clearing
npm run clear-cache

# Hard browser refresh
Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### Understanding Vite Behavior
- **Module Duplication in Sources Tab**: Normal - shows both source files and transformed modules
- **Dependency Cache**: Located in `node_modules/.vite/` - auto-invalidated on dependency changes
- **Production Builds**: Automatic content hashing for cache busting (`assets/[name]-[hash].js`)

## Reminders and Notes
- Development environment is stable and working correctly
- Vite cache is properly configured for optimal development experience
- Brand logo integrated with CSS filter optimization for luxury theming
- Authentication system complete with JWT + bcrypt security
- 4-tier membership system with role-based permissions implemented
- Data synchronization service complete with enterprise-grade features
- **Navigation system complete with consistent header across all pages**
- **Full routing system implemented for all main module functions**
- **Authentication modal system integrated with navigation**
- **Complete authentication forms with validation and error handling**
- **Login/register functionality fully operational**
- **All call-to-action buttons across pages fully functional**
- **Universal authentication modal system integrated across all pages**
- **Comprehensive consultation booking and membership information systems**
- **Reusable component architecture with proper separation of concerns**
- **Eliminated prop drilling through centralized context management**
- Project status: Core platform complete and ready for Phase 2 development

## Brand Assets
### Logo Implementation
- **Logo File**: `client/public/logo.jpeg` - Official SheSocial logo with heart-shaped couple silhouettes
- **Header Integration**: 48x48px with luxury gold CSS filter treatment
- **Favicon**: Logo set as browser favicon and PWA icon
- **Color Optimization**: CSS filters applied to match luxury gold theme
  ```css
  filter: brightness-0 invert sepia saturate-[3] hue-rotate-[25deg] brightness-[1.2]
  ```
- **Alternative Options**: SVG conversion recommended for perfect scaling and easy color changes

## Recent Development Logs

### Vite and Dependencies Challenges
- Experienced Vite v7.0.3 build issues
- Error in `src/types/database.ts`: No matching export for `UserProfile`
- Build failure in `src/store/authStore.ts`
- Two versions of `offline-dbs.ts` detected
- Successful dependency optimization for react-dom/client, dexie, zustand