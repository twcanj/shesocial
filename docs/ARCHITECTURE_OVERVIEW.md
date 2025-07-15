# Architecture Overview

## Project Structure
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
├── server/                   # Node.js backend
└── shared/                   # Shared types and utilities
```

## Technology Stack

### Frontend (Complete)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4.17 with luxury design system
- **State Management**: React Hooks + Zustand
- **Database**: IndexedDB (Dexie.js) for offline-first storage
- **PWA**: Service Worker + PWA capabilities with background sync

### Backend (Complete)
- **Runtime**: Node.js + Express + TypeScript
- **Database**: NeDB @seald-io/nedb v4.1.2 (lightweight embedded database)
- **Sync**: Bidirectional sync with IndexedDB
- **Authentication**: JWT + bcrypt password hashing
- **Deployment**: Render.com

## Key Features Implemented

### 1. Offline-First Architecture
- IndexedDB storage with Dexie.js
- NeDB-compatible document structure
- Sync queue for offline operations
- Network status detection

### 2. Zodiac-Inspired Mystical Design System
- Custom Tailwind CSS configuration with zodiac color palette
- Imperial purple (#663399) and dark gold (#b8860b) luxury theme
- WCAG AA compliant text contrast for excellent readability
- Official brand logo with CSS filter optimization for luxury theming
- Advanced glass morphism effects with mystical gradients
- Responsive mobile-first design with hamburger navigation
- Mobile-optimized touch targets and spacing
- Zodiac sign-inspired membership tier gradients

### 3. Taiwan Localization
- Traditional Chinese interface
- Noto Sans TC + Noto Serif TC fonts
- Mobile-optimized for Taiwan users

### 4. PWA Implementation
- Service Worker with background sync
- Offline-first capabilities
- App installation support
- Push notification ready
- Taiwan-optimized manifest

### 5. Member Media Management System
- Cloudinary integration for photo/video hosting
- Member upload interface with drag-and-drop
- Admin moderation dashboard with approval workflow
- Category-based media organization (profile, lifestyle, activity photos)
- File validation, progress tracking, and error handling

### 6. Interview & Verification System
- 30-minute video interview booking for new members
- Multi-interviewer support with availability scheduling
- Application form with membership type selection
- Interview status tracking and completion verification
- Admin interface for interview management

## Database Architecture

### NeDB Backend Storage (server/src/db/nedb-setup.ts)
- **Persistent file-based storage** in `/server/data/` directory
- **11 database collections** with .db files for R2 sync readiness
- **Real-time health monitoring** via `/health` endpoint
- **R2 Integration Ready**: `syncToR2()` and `restoreFromR2()` methods prepared
- **Collections**: users, events, bookings, appointments_slots, appointment_bookings, interviewers, availability_overrides, appointment_notifications, syncQueue, startup_records, health_logs

### IndexedDB Frontend Storage (client/src/db/offline-db.ts)
- **users**: User profiles with membership tiers
- **events**: Social events with metadata
- **bookings**: User event bookings
- **syncQueue**: Pending sync operations

### Enhanced Database Collections (server/src/types/database.ts)
- **media**: Cloudinary media assets with moderation status
- **interviews**: Interview sessions and scheduling
- **admins**: Admin users with role-based permissions
- **moderationQueue**: Content moderation workflow management

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

## Membership System (4-Tier)
- **visitor**: Browsing only (can see 3 activities maximum)
- **registered**: Free registration (can see 12 activities maximum)  
- **vip**: Paid membership NT$1,300 (can participate in events after 2-month wait + voucher benefits)
- **vvip**: Premium paid membership NT$2,500 (can view participants + maximum voucher benefits)

## Design System (client/tailwind.config.js)
- **Colors**: Mystical zodiac palette with imperial purple and dark gold themes
- **Primary Colors**: Imperial purple scale (#faf8ff to #3d1f5c) with #663399 as main brand color
- **Secondary Colors**: Warm ivory to dark gold (#fffef7 to #b8860b) with excellent text contrast
- **Text Contrast**: WCAG AA compliant - all text readable on white backgrounds
- **Luxury Colors**: Imperial purple, dark gold, crimson red, deep blue for mystical elegance
- **Tier Colors**: Zodiac sign-inspired gradients for membership levels (Taurus, Leo, Libra, Scorpio)
- **Typography**: Inter + Noto Sans TC for multilingual support with dark charcoal (#1a1a1a) text
- **Components**: Zodiac-inspired luxury buttons with sliding gradient overlays, mystical glass cards, 3D hover effects
- **Animations**: Fade-in, slide-up, mystical glow, card flip, and gradient shift animations