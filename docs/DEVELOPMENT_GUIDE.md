# InfinityMatch 天造地設人成對 - Development Guide
## Extended Development Procedures

> **Status**: Production Ready - Admin System Fully Operational
> **Last Updated**: 2025-07-19
> **Version**: 3.2

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

## Production Deployment Notes
- Platform is production-ready with **FULLY FUNCTIONAL** admin system
- Complete luxury design system implemented
- Mobile-optimized responsive design
- Enterprise health monitoring active
- **Level-based admin permissions working correctly** - all 403 errors resolved
- Single source of truth for admin routes and middleware