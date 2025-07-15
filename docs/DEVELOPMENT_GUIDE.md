# Development Guide

## Quick Start Commands

### Installation and Setup
```bash
# Install all dependencies (root, client, and server)
npm run install:all

# Install only client dependencies
cd client && npm install

# Install only server dependencies
cd server && npm install
```

### Development
```bash
# IMPORTANT: Always test build before starting server
npm run build

# Start both client and server in development mode
npm run dev

# Start only client (frontend)
npm run dev:client

# Start only server (backend)
npm run dev:server

# Check system health (includes database status)
curl http://localhost:10000/health
```

### Build and Production
```bash
# Build both client and server
npm run build

# Build only client
npm run build:client

# Build only server
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
- Client runs on http://localhost:5173
- Server runs on http://localhost:3001
- API base URL: http://localhost:3001/api
- Health check: http://localhost:3001/health
- API documentation: http://localhost:3001

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

## Key Development Notes
- Development environment is stable and working correctly
- Vite cache is properly configured for optimal development experience
- Authentication system complete with JWT + bcrypt security
- 4-tier membership system with role-based permissions implemented
- Data synchronization service complete with enterprise-grade features