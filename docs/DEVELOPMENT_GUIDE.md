# InfinityMatch 天造地設人成對 - Development Guide
## Extended Development Procedures

> **Status**: Production Ready
> **Last Updated**: 2025-07-16
> **Version**: 3.0

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

## Production Deployment Notes
- Platform is production-ready
- Complete luxury design system implemented
- Mobile-optimized responsive design
- Enterprise health monitoring active