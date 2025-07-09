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
- Bidirectional sync between IndexedDB and NeDB
- Conflict resolution strategies
- Background sync with Service Worker
- Offline queue management

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

### Current Status
- ✅ Frontend architecture complete
- ✅ IndexedDB offline storage implemented
- ✅ Luxury design system implemented
- ✅ Taiwan localization complete
- ✅ Service Worker PWA implementation complete
- ❌ Backend server not implemented
- ❌ Payment integration pending

### Next Development Priorities
1. Implement NeDB backend server
2. Complete sync service integration
3. Implement payment systems (LINE Pay, ECPay)
4. Add user authentication
5. Deploy to Render.com

### File Locations
- Main database: `client/src/db/offline-db.ts:22`
- Sync service: `client/src/services/sync-service.ts:55`
- Type definitions: `client/src/types/database.ts:12`
- React hooks: `client/src/hooks/useOfflineDB.ts:9`
- PWA utilities: `client/src/utils/pwa-utils.ts:14`
- Service Worker: `client/public/sw.js`
- Vite PWA config: `client/vite.config.ts:9`
- Tailwind config: `client/tailwind.config.js:7`

### Development Environment
- Client runs on http://localhost:5173
- Server (planned) will run on http://localhost:3001
- API base URL: http://localhost:3001/api

### Key Dependencies
- **dexie**: "^4.0.11" - IndexedDB wrapper
- **zustand**: "^5.0.6" - State management
- **react**: "^19.1.0" - UI framework
- **tailwindcss**: "^3.4.17" - Styling
- **typescript**: "~5.8.3" - Type safety
- **vite**: "^7.0.3" - Build tool
- **vite-plugin-pwa**: "^1.0.1" - PWA functionality
- **workbox-webpack-plugin**: "^7.3.0" - Service Worker

### Payment Integration (Planned)
- Primary: LINE Pay
- Secondary: Apple Pay, Google Pay
- Backup: ECPay (credit cards)
- Future: Bank transfer

This is a Taiwan-focused luxury social platform with emphasis on offline-first architecture, privacy protection, and premium user experience.