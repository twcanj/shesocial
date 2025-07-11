# Render.com Deployment Guide for SheSocial

## Prerequisites
1. GitHub repository with latest code
2. Render.com account
3. Domain registration (shesocial.tw) - for Step 2

## Step 1: Deploy to Render.com

### 1.1 Connect Repository
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Blueprint"
3. Connect GitHub repository: `yanggf/shesocial`
4. Select `render.yaml` configuration

### 1.2 Environment Variables (Auto-configured in render.yaml)
The following environment variables will be automatically set:

**Backend (shesocial-server):**
- `NODE_ENV=production`
- `PORT=10000`
- `JWT_SECRET` (auto-generated)
- `JWT_EXPIRES_IN=7d`
- `CORS_ORIGIN=https://shesocial.onrender.com`
- `CLIENT_URL=https://shesocial.onrender.com`

**Frontend (shesocial-client):**
- `VITE_API_URL=https://shesocial-server.onrender.com/api`
- `VITE_APP_ENV=production`

### 1.3 Deployment URLs
After deployment, you'll get:
- **Frontend**: `https://shesocial.onrender.com`
- **Backend**: `https://shesocial-server.onrender.com`
- **API**: `https://shesocial-server.onrender.com/api`
- **Health Check**: `https://shesocial-server.onrender.com/health`

## Step 2: Custom Domain Setup (shesocial.tw)

### 2.1 Domain Configuration
1. In Render dashboard → shesocial-client service
2. Go to "Settings" → "Custom Domains"
3. Add domain: `shesocial.tw`
4. Add subdomain: `www.shesocial.tw`

### 2.2 DNS Configuration
Update DNS records with your domain registrar:

```
# A Records
@ (root)     A     75.2.60.5
www          A     75.2.60.5

# CNAME Records (alternative)
@            CNAME  shesocial.onrender.com
www          CNAME  shesocial.onrender.com
```

### 2.3 SSL Certificate
- Render automatically provisions Let's Encrypt SSL certificates
- HTTPS will be automatically enforced
- Certificate auto-renewal included

## Step 3: Update Environment Variables

### 3.1 Update render.yaml
Update CORS and CLIENT_URL in render.yaml:
```yaml
envVars:
  - key: CORS_ORIGIN
    value: https://shesocial.tw
  - key: CLIENT_URL
    value: https://shesocial.tw
```

### 3.2 Update Frontend API URL
```yaml
envVars:
  - key: VITE_API_URL
    value: https://api.shesocial.tw/api  # If using subdomain
```

## Step 4: Subdomain for API (Optional)

### 4.1 Create API Subdomain
1. Add custom domain to backend service: `api.shesocial.tw`
2. Update DNS:
```
api          CNAME  shesocial-server.onrender.com
```

### 4.2 Update Frontend Configuration
Update VITE_API_URL to use custom domain:
```
VITE_API_URL=https://api.shesocial.tw/api
```

## Step 5: Monitoring & Health Checks

### 5.1 Health Check Endpoints
- **Backend Health**: `https://shesocial.tw/api/health`
- **Frontend**: `https://shesocial.tw`

### 5.2 Monitoring Setup
1. Enable Render health checks
2. Set up alerts for service failures
3. Monitor database performance

## Step 6: Database Persistence

### 6.1 Data Directory
- NeDB files stored in `/server/data/`
- Persistent disk attached automatically
- Backup strategy needed for production

### 6.2 Backup Strategy (Optional)
- Set up automated database backups
- Consider external storage (Cloudflare R2)

## Step 7: Performance Optimization

### 7.1 CDN Setup (Optional)
- Enable Render CDN for static assets
- Consider Cloudflare for additional caching

### 7.2 Service Plans
- **Starter Plan**: Free tier (0.1 CPU, 512MB RAM)
- **Standard Plan**: $7/month (0.5 CPU, 512MB RAM)
- **Pro Plan**: $25/month (1 CPU, 2GB RAM)

## Deployment Commands

### Local Testing Before Deployment
```bash
# Test production build locally
npm run build
npm start

# Test environment variables
NODE_ENV=production PORT=10000 npm start
```

### Manual Deployment Trigger
```bash
# Push to main branch triggers auto-deployment
git push origin main

# Or trigger manual deploy in Render dashboard
```

## Troubleshooting

### Common Issues
1. **Build Failures**: Check build logs in Render dashboard
2. **Environment Variables**: Verify all required vars are set
3. **CORS Errors**: Update CORS_ORIGIN after domain setup
4. **Database Issues**: Check NeDB file permissions

### Debug Commands
```bash
# Check service logs
curl https://shesocial-server.onrender.com/health

# Test API endpoints
curl https://shesocial-server.onrender.com/api/users
```

## Security Checklist

- [ ] JWT_SECRET properly generated
- [ ] HTTPS enforced (automatic)
- [ ] CORS properly configured
- [ ] Helmet security headers enabled
- [ ] Environment variables secured
- [ ] Database access restricted

## Cost Estimation

### Render.com Costs
- **Static Site (Frontend)**: Free
- **Web Service (Backend)**: $7-25/month depending on plan
- **Custom Domain**: Free
- **SSL Certificate**: Free
- **Total**: $7-25/month

### Additional Costs
- Domain registration: ~$10-15/year
- Optional: CDN/monitoring services

This deployment configuration provides a production-ready setup for SheSocial with automatic SSL, custom domain support, and scalable infrastructure.