# InfinityMatch 天造地設人成對 - Development Guide
## Extended Development Procedures

> **Status**: Production Ready - Admin System + Two-Database Architecture (Step 1)
> **Last Updated**: 2025-07-19  
> **Version**: 3.3

> **Note**: Core development commands are in CLAUDE.md. This guide covers extended procedures.

---

## Extended Commands

### Installation
```bash
# Install all dependencies
npm run install:all

# Individual installations
cd client && npm install
cd server && npm install
```

### Testing & Quality
```bash
# Type checking (server)
cd server && npm run typecheck

# Linting (server)
cd server && npm run lint
cd server && npm run lint:fix

# Linting (client)
cd client && npm run lint
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

### Health Monitoring Commands
```bash
# Check system health (basic)
curl http://localhost:10000/health

# Check system health with database logging
curl http://localhost:10000/health?log=true

# Monitor startup health logs
# Database collections: startup_records, health_logs
```

## Development Environment
- **Client**: http://localhost:5173 (React 19 + Vite)
- **Server**: http://localhost:10000 (Node.js + Express)
- **API**: http://localhost:10000/api
- **Health**: http://localhost:10000/health
- **Admin**: http://localhost:5173/admin_login

## Cache Management (Vite)

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

## Development Workflows

### React Router Development
- URL-based navigation system implemented
- Admin routes separated from user routes
- Mobile-responsive navigation with hamburger menu
- Profile management with proper state handling

### Authentication Development
- JWT tokens with 8-hour admin sessions
- Separate admin authentication system
- Email/username login support for admins
- Secure password hashing with bcrypt
- **Level-based admin permission system**: Level 1 (top-level) bypass all checks, Level 2 (general) use permission-based access

### Appointment System Development
- Enterprise-grade booking system
- 1,380 appointment slots with conflict detection
- 9 interviewers with availability management
- Real-time booking status updates

### Database Development
- NeDB with 11 collections
- IndexedDB for offline-first frontend
- Bidirectional sync with conflict resolution
- Automated health monitoring

## Admin System Architecture (Latest Updates)

### Level-Based Permission System
- **Level 1 Admins**: `super_admin`, `system_admin` - Bypass ALL permission checks
- **Level 2 Admins**: `operation_admin`, `premium_admin` - Permission-based access control
- **JWT Integration**: Admin level included in JWT tokens for middleware validation
- **Frontend Control**: Navigation permissions handled at sidebar level, module pages have no permission checks

### Admin Access Credentials
```
Super Admin:
  Email: admin@infinitymatch.com
  Password: admin123
  Level: 1 (Full Access)
  
System Admin:
  Email: system@infinitymatch.com  
  Password: admin123
  Level: 1 (Full Access)
  
Operation Admin:
  Email: operation@infinitymatch.com
  Password: admin123
  Level: 2 (Permission-based)
  
Premium Admin:
  Email: premium@infinitymatch.com
  Password: admin123
  Level: 2 (Permission-based)
```

### Recent Architecture Changes (2025-07-19)
- ✅ Migrated from type-based to level-based permission checking
- ✅ Removed all frontend permission checks from admin module pages
- ✅ Fixed admin.level field propagation from backend to frontend
- ✅ Updated JWT middleware to use level-based authorization
- ✅ Complete admin navigation access for Level 1 admins
- ✅ **CRITICAL FIX**: Resolved 403 errors by implementing level-based bypass in admin routes middleware
- ✅ Removed duplicate admin-simple.ts routes file for single source of truth
- ✅ **SECURITY ENHANCEMENT**: Replaced JWT claims with real-time database lookups for admin permissions
- ✅ **DATABASE ARCHITECTURE**: Implemented incremental two-database migration (Step 1 complete)

### Troubleshooting Admin Issues

**Common Issue: 403 Forbidden Errors for Admin APIs**
- **Symptom**: Console shows `GET /api/admin/system/stats 403 (Forbidden)`
- **Root Cause**: JWT token missing level field or middleware not checking level properly
- **Solution**: Logout and login again to get fresh JWT token with level field
- **Prevention**: Ensure both frontend auth store and backend middleware use level-based checking

**Admin Permission Debugging**
```javascript
// In browser console, check admin auth state:
window.debugAdminPermissions() // If debug function is available

// Or manually check:
JSON.parse(localStorage.getItem('admin-auth-storage'))
```

**Architecture Notes**
- Level 1 admins bypass ALL permission checks (both frontend navigation and backend API)
- Level 2 admins use permission-based access control
- Single admin routes file: `/server/src/routes/admin.ts` (admin-simple.ts removed)
- Frontend permission checks removed from module pages (handled at navigation level)
- **Security**: JWT tokens only used for identity - all permissions checked via real-time database lookups
- **Database**: Two-database architecture implemented incrementally alongside legacy collections

## Database Architecture Evolution

### Current State: Two-Database Implementation (Step 1 Complete)

**Legacy Structure (Still Active):**
```
data/
├── users.db (431 bytes)
├── events.db (829 bytes) 
├── admin-users.db (2,864 bytes)
├── admin-roles.db (654 bytes)
├── permission-atoms.db (3,876 bytes)
├── appointment-bookings.db (446 bytes)
├── marketing-campaigns.db (624 bytes)
└── [21 total individual database files]
```

**New Two-Database Structure (Ready for Migration):**
```
data/
├── admin.db (624 bytes) - All admin-related data
└── application.db (625 bytes) - All user/business data
```

**Migration Status:**
- ✅ **Step 1**: Foundation established - both structures coexist
- 🔄 **Step 2**: Data migration utilities (pending)
- 🔄 **Step 3**: Migrate admin data to admin.db (pending)
- 🔄 **Step 4**: Migrate application data to application.db (pending)
- 🔄 **Step 5**: Update queries to use new structure (pending)
- 🔄 **Step 6**: Remove legacy collections (pending)

**Access Methods:**
```typescript
// Legacy access (current)
const db = NeDBSetup.getInstance().getDatabases()
const adminUsers = db.admin_users

// New access (ready for use)
const twoDB = NeDBSetup.getInstance().getTwoDatabases()
const adminDB = twoDB.admin  // All admin data with collection field
const appDB = twoDB.application  // All user/business data with collection field
```

**Benefits of Completed Migration:**
- 🔒 **Security Isolation**: Admin data completely separated from application data
- 📈 **Performance**: Reduced file handle overhead (21 files → 2 files)
- 🔧 **Operational**: Simplified backup/restore strategies
- 🚀 **Scalability**: Easier to migrate to different database systems per use case

### Developer Handover Summary

**What Works Right Now (Production Ready):**
- ✅ **Admin Login**: `admin@infinitymatch.com` / `admin123` - Full access to all modules
- ✅ **Event Management**: Create, edit, delete events via admin dashboard
- ✅ **Permission System**: Level 1 admins bypass all checks, Level 2 use permissions
- ✅ **Real-time Security**: All admin permissions checked fresh from database (not JWT)
- ✅ **API Endpoints**: All admin APIs return 200 OK (403 errors resolved)
- ✅ **Database Persistence**: Data survives server restarts (not in-memory)

**Current Database State:**
```bash
# Both systems work simultaneously:
Legacy: 21 individual .db files (current production system)
New: 2 consolidated .db files (ready for migration)

# No data loss risk - both are persistent file-based storage
```

**For Next Developer:**

**If you want to continue two-database migration:**
1. **Step 2**: Create data migration utilities in `server/src/db/migrate-to-two-db.ts`
2. **Step 3**: Migrate admin data (admin_users, admin_roles, permission_atoms, permission_audit_logs)
3. **Step 4**: Migrate application data (users, events, bookings, appointments, marketing, health)
4. **Step 5**: Update all database queries to use `getTwoDatabases()` instead of `getDatabases()`
5. **Step 6**: Remove legacy database files and old interface

**If you want to keep current system:**
- Everything works perfectly as-is
- 21 separate database files provide good modularity
- No changes needed - system is production-ready

**Critical Files Modified (For Reference):**
- `server/src/db/nedb-setup.ts` - Added two-database structure alongside legacy
- `server/src/routes/admin.ts` - Uses real-time database lookups for permissions
- `server/src/middleware/adminAuth.ts` - Level-based permission checking
- All admin frontend components - Removed permission checks (handled at navigation)

**Architecture Decision Rationale:**
The two-database approach was requested for cleaner operational separation:
- **admin.db**: Security-critical admin operations only  
- **application.db**: All user/business data
- **Benefit**: Clear backup strategies, security boundaries, easier scaling

**No Breaking Changes:**
- All existing APIs work unchanged
- All frontend components work unchanged  
- All database queries work unchanged
- Migration is additive, not destructive

## Production Deployment Notes
- Platform is production-ready with **FULLY FUNCTIONAL** admin system
- Complete luxury design system implemented
- Mobile-optimized responsive design
- Enterprise health monitoring active
- **Level-based admin permissions working correctly** - all 403 errors resolved
- **Real-time database permission checking** - more secure than JWT claims
- **Two-database architecture foundation** - ready for incremental migration