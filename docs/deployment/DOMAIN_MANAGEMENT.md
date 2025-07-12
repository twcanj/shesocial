# SheSocial Domain Management Guide

## ⚠️ **BACKUP SOLUTION** - This document outlines the ahexagram.com subdomain strategy as a fallback option.

**Current Status**: Planning new dedicated domain for SheSocial platform.  
**This Configuration**: Backup deployment option using existing ahexagram.com infrastructure.

---

This document provides comprehensive guidance for managing the SheSocial domain infrastructure under the ahexagram.com ecosystem as a backup deployment strategy.

## 🏗️ Domain Architecture Overview

### **Multi-App Ecosystem Structure**
```
ahexagram.com (Root Domain)
├── zodiac.ahexagram.com          # Existing: Zodiac app
├── fortuneteller.ahexagram.com   # Planned: Fortune teller app
└── shesocial.ahexagram.com       # New: SheSocial luxury platform
    ├── api-shesocial.ahexagram.com    # Backend API
    └── admin-shesocial.ahexagram.com  # Future admin panel
```

### **User Management Strategy**
- **Isolated User Systems**: Each subdomain maintains separate authentication
- **Independent Databases**: No cross-app user data sharing
- **Future Integration**: Optional unified analytics via Cloudflare
- **Security**: JWT tokens scoped to specific subdomains

## 🌐 DNS Configuration (Cloudflare)

### **Required DNS Records**
```dns
# SheSocial Platform Records
Type    Name                    Content                           TTL    Proxy
CNAME   shesocial              shesocial.onrender.com            Auto   ✅
CNAME   api-shesocial          api-shesocial.onrender.com        Auto   ✅
CNAME   admin-shesocial        admin-shesocial.onrender.com      Auto   ✅

# Optional: Redirects and aliases
CNAME   social                 shesocial.ahexagram.com           Auto   ✅
```

### **Cloudflare Page Rules**
```
# Force HTTPS (Security)
Rule: http://shesocial.ahexagram.com/*
Setting: Always Use HTTPS

# Cache static assets (Performance)
Rule: shesocial.ahexagram.com/assets/*
Settings: Cache Level: Cache Everything, Edge Cache TTL: 1 month

# API CORS headers
Rule: api-shesocial.ahexagram.com/*
Settings: Add security headers for API access
```

## 🚀 Render.com Deployment Configuration

### **Frontend Service Setup**
```yaml
# Render.com Frontend Configuration
Name: shesocial-frontend
Type: Static Site
Build Command: npm run build
Publish Directory: client/dist
Custom Domain: shesocial.ahexagram.com

Environment Variables:
- VITE_API_BASE_URL=https://api-shesocial.ahexagram.com
- VITE_APP_DOMAIN=shesocial.ahexagram.com
- NODE_ENV=production
```

### **Backend Service Setup**
```yaml
# Render.com Backend Configuration
Name: shesocial-backend
Type: Web Service
Build Command: npm run build
Start Command: npm start
Custom Domain: api-shesocial.ahexagram.com

Environment Variables:
- NODE_ENV=production
- PORT=10000
- FRONTEND_URL=https://shesocial.ahexagram.com
- CORS_ORIGIN=https://shesocial.ahexagram.com
- JWT_SECRET=your_secure_jwt_secret
- API_BASE_URL=https://api-shesocial.ahexagram.com
```

## 🔧 Local Development Configuration

### **Environment Variables (.env.local)**
```env
# Development Environment
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_DOMAIN=localhost:5173

# Production Environment (for testing)
# VITE_API_BASE_URL=https://api-shesocial.ahexagram.com
# VITE_APP_DOMAIN=shesocial.ahexagram.com
```

### **Hosts File (Optional for Local Testing)**
```
# Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1    local.shesocial.ahexagram.com
127.0.0.1    local.api-shesocial.ahexagram.com
```

## 🔐 SSL Certificate Management

### **Cloudflare SSL Configuration**
- **SSL Mode**: Full (strict) - Recommended for production
- **Always Use HTTPS**: Enabled
- **Automatic HTTPS Rewrites**: Enabled
- **Certificate Authority**: Cloudflare Universal SSL (Free)

### **Certificate Chain**
```
Root: Cloudflare Root CA
Intermediate: Cloudflare Intermediate CA
End-Entity: *.ahexagram.com (covers all subdomains)
```

## 📊 Analytics & Monitoring Setup

### **Cloudflare Analytics**
- Track traffic patterns across all subdomains
- Monitor performance metrics
- Security threat analysis
- Bandwidth usage optimization

### **Domain-Specific Tracking**
```javascript
// Subdomain analytics separation
const analyticsConfig = {
  'shesocial.ahexagram.com': 'SheSocial Platform Metrics',
  'zodiac.ahexagram.com': 'Zodiac App Metrics',
  'fortuneteller.ahexagram.com': 'Fortune Teller Metrics'
}
```

## 🛡️ Security Configuration

### **CORS Headers (API)**
```javascript
// server/src/middleware/cors.ts
const corsOptions = {
  origin: [
    'https://shesocial.ahexagram.com',
    'http://localhost:5173' // Development only
  ],
  credentials: true,
  optionsSuccessStatus: 200
}
```

### **Content Security Policy**
```http
Content-Security-Policy: 
  default-src 'self' https://shesocial.ahexagram.com;
  api-src 'self' https://api-shesocial.ahexagram.com;
  img-src 'self' data: https:;
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
```

## 🔄 Deployment Workflow

### **Step 1: DNS Configuration**
1. Login to Cloudflare dashboard
2. Navigate to ahexagram.com DNS settings
3. Add CNAME records for shesocial and api-shesocial
4. Enable proxy (orange cloud) for all records

### **Step 2: Render.com Setup**
1. Connect GitHub repository to Render.com
2. Create frontend static site service
3. Create backend web service
4. Configure custom domains
5. Set environment variables

### **Step 3: Domain Verification**
1. Verify DNS propagation: `dig shesocial.ahexagram.com`
2. Test SSL certificate: `curl -I https://shesocial.ahexagram.com`
3. Verify API connectivity: `curl https://api-shesocial.ahexagram.com/health`

### **Step 4: Production Testing**
1. Test user registration flow
2. Verify JWT authentication across domains
3. Check CORS configuration
4. Monitor performance metrics

## 🚨 Troubleshooting Guide

### **Common Issues & Solutions**

#### **DNS Propagation Delays**
```bash
# Check DNS propagation status
dig shesocial.ahexagram.com
nslookup shesocial.ahexagram.com

# Clear local DNS cache (Mac)
sudo dscacheutil -flushcache

# Clear local DNS cache (Windows)
ipconfig /flushdns
```

#### **SSL Certificate Issues**
- Ensure Cloudflare proxy is enabled (orange cloud)
- Check SSL mode is set to "Full (strict)"
- Verify Render.com has valid SSL configuration

#### **CORS Errors**
- Verify frontend domain matches CORS_ORIGIN
- Check API base URL configuration
- Ensure credentials are properly configured

#### **Render.com Deployment Failures**
```bash
# Check build logs in Render.com dashboard
# Common fixes:
npm run build  # Test build locally first
npm run start  # Verify start command works
```

## 📈 Future Expansion Considerations

### **Additional Subdomains**
- **cdn.ahexagram.com**: Static asset CDN
- **assets.ahexagram.com**: Media file storage
- **docs.ahexagram.com**: API documentation

### **Cross-App Integration (Future)**
- Unified SSO across all subdomains
- Shared user analytics dashboard
- Common notification system
- Integrated payment processing

### **Performance Optimization**
- Implement subdomain-specific caching strategies
- Optimize Cloudflare settings per application type
- Monitor and adjust based on traffic patterns

## 📞 Support & Maintenance

### **Domain Management Contacts**
- **Domain Registrar**: Google Domains
- **DNS Management**: Cloudflare
- **Hosting**: Render.com
- **SSL Provider**: Cloudflare (Universal SSL)

### **Regular Maintenance Tasks**
- [ ] Monthly SSL certificate verification
- [ ] Quarterly DNS record audit
- [ ] Performance metrics review
- [ ] Security configuration updates

---

**Last Updated**: 2025-07-12  
**Next Review**: 2025-08-12  
**Maintainer**: SheSocial Development Team

---

## Quick Reference Commands

```bash
# DNS Verification
dig shesocial.ahexagram.com

# SSL Certificate Check
openssl s_client -connect shesocial.ahexagram.com:443 -servername shesocial.ahexagram.com

# API Health Check
curl https://api-shesocial.ahexagram.com/health

# Local Development Start
npm run build && npm run dev

# Production Environment Test
VITE_API_BASE_URL=https://api-shesocial.ahexagram.com npm run dev
```