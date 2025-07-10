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

### TypeScript Types (client/src/types/database.ts)
Key interfaces:
- `UserProfile`: User data with membership info
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
- Vite PWA config: `client/vite.config.ts:9`
- Tailwind config: `client/tailwind.config.js:7`

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
- Login form: `client/src/components/auth/LoginForm.tsx`
- Register form: `client/src/components/auth/RegisterForm.tsx`
- Auth modal: `client/src/components/auth/AuthModal.tsx`

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

## Reminders and Notes
- Next time allow me to start server
- Authentication system complete with JWT + bcrypt security
- 4-tier membership system with role-based permissions implemented
- Data synchronization service complete with enterprise-grade features
- Project status: 5/6 tasks complete (83% done)