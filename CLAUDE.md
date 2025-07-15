# CLAUDE.md - Essential Development Guide

This file provides guidance to Claude Code (claude.ai/code) when working with the InfinityMatch 天造地設人成對 codebase.

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
- **Client**: http://localhost:5173 (React 19 + TypeScript + Vite)
- **Server**: http://localhost:3001 (Node.js + Express + NeDB)
- **API**: http://localhost:3001/api

## 🏗️ Architecture

### Core Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Dexie.js (IndexedDB)
- **Backend**: Node.js + Express + NeDB + JWT authentication
- **Design**: Zodiac-inspired luxury theme with imperial purple (#663399) and dark gold (#b8860b)
- **Language**: Traditional Chinese (Taiwan localization)

### Key Features
- **4-Tier Membership**: visitor → registered → vip → vvip
- **Offline-First**: IndexedDB with bidirectional sync
- **Admin System**: Atomic permissions with 4 departments
- **Sales-Optimized**: Profile collection before payment
- **Enterprise Health**: Comprehensive monitoring system

## 📋 Business Rules

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

## 🗂️ Documentation Structure

### Core Documentation
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)**: Commands and setup
- **[Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md)**: System design
- **[API Reference](docs/API_REFERENCE.md)**: All endpoints
- **[File Locations](docs/FILE_LOCATIONS.md)**: Complete file reference
- **[Task History](docs/TASK_HISTORY.md)**: Completed achievements

### Business Documentation
- **[Business Rules](docs/business/BUSINESS_RULES.md)**: Core business logic
- **[Admin System](docs/business/ADMIN_SYSTEM_ARCHITECTURE.md)**: Permission architecture
- **[Membership System](docs/business/MEMBERSHIP_SYSTEM_CORRECT.md)**: Tier structure

### Technical Documentation
- **[Mobile Optimization](docs/technical/MOBILE_OPTIMIZATION.md)**: Responsive design
- **[Troubleshooting](docs/technical/TROUBLESHOOTING.md)**: Common issues
- **[Health Monitoring](docs/operations/HEALTH_MONITORING.md)**: System monitoring

## 🎯 Current Status

### ✅ Complete Features
- Enterprise-grade platform with all core features implemented
- Sales-optimized registration flow with CRM integration
- Complete admin dashboard with atomic permissions + **LUXURY STYLING**
- 30-minute interview system with booking management
- Media management with Cloudinary integration
- **Hesocial luxury design system** (WCAG AA compliant) across ALL pages
- Enterprise health monitoring system
- Production-ready deployment configuration
- **Admin & Management pages** fully updated with luxury styling

### 🔄 Next Phase
- LINE Pay integration for Taiwan market
- Advanced media features (video upload)
- Payment processing (Apple Pay, Google Pay)
- LINE Official Account integration

## 🔧 Key Files

### Frontend Core
- `client/src/App.tsx` - Main app with AuthProvider
- `client/src/db/offline-db.ts` - IndexedDB database
- `client/src/services/sync-service.ts` - Bidirectional sync
- `client/src/store/authStore.ts` - Authentication state

### Authentication System (Luxury Styled)
- `client/src/components/auth/AuthModal.tsx` - Modal container with luxury styling
- `client/src/components/auth/LoginForm.tsx` - Login form with luxury inputs
- `client/src/components/auth/RegisterForm.tsx` - Registration form with luxury styling
- `client/src/contexts/AuthContext.tsx` - Authentication context provider

### Backend Core
- `server/src/index.ts` - Server entry point
- `server/src/db/nedb-setup.ts` - Database setup
- `server/src/routes/` - API routes (auth, admin, appointments)
- `server/src/services/StartupHealthCheck.ts` - Health monitoring

### Admin System (Luxury Styled)
- `client/src/pages/AdminDashboard.tsx` - Main admin interface
- `client/src/components/admin/AdminSidebar.tsx` - Navigation with luxury styling
- `client/src/components/admin/AdminOverview.tsx` - System overview dashboard
- `client/src/components/admin/PermissionManagement.tsx` - Atomic permissions
- `client/src/components/admin/RoleManagement.tsx` - Role configuration
- `client/src/hooks/useAdminAuth.ts` - Admin authentication

### Configuration
- `client/tailwind.config.js` - Luxury design system
- `client/vite.config.ts` - Build configuration
- `server/tsconfig.json` - TypeScript configuration

## 💡 Development Notes

### Cache Management
- Use `npm run dev:fresh` for cache issues
- Vite cache located in `node_modules/.vite/`
- Hard refresh: Ctrl+Shift+R

### Authentication
- JWT tokens with bcrypt password hashing
- Separate admin authentication system
- 8-hour token expiry for admin sessions

### Database
- NeDB for backend (11 collections)
- IndexedDB for frontend (offline-first)
- Bidirectional sync with conflict resolution

### Hesocial Luxury Design System
- **Primary Colors**: Luxury gold (#D4AF37) and midnight black (#0C0C0C)
- **Secondary Colors**: Platinum (#E5E4E2) and champagne (#F7E7CE)
- **Text Contrast**: WCAG AA compliant - optimized for dark backgrounds
- **Card System**: luxury-card-selected (golden bg) and luxury-card-outline (golden border)
- **Buttons**: luxury-button (golden bg) and luxury-button-outline (golden border)
- **Admin System**: Complete luxury styling with professional dark theme

---

**Platform Status**: ✅ **Production Ready** - Complete enterprise-grade social platform for Taiwan market

For detailed information, refer to the documentation files listed above. This is a Taiwan-focused luxury social platform emphasizing offline-first architecture, privacy protection, and premium user experience.