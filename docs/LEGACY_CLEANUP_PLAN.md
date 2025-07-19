# Legacy Database Cleanup Plan

## 🎯 Overview

Safe cleanup strategy for legacy database files after successful migration to 2-database structure.

## 📊 Current Status

**Migration Completed**: ✅ All data migrated to optimized structure  
**System Mode**: Hybrid (using new database with legacy fallback)  
**Performance**: Improved query performance with 2-database structure  
**Validation**: All integrity checks passed

## 🗄️ Database Structure Comparison

### Legacy Structure (23 files)
```
admin-roles.db (1 KB)
admin-users.db (2 KB) 
admin.db (6 KB) ← NEW
application.db (2 KB) ← NEW
appointment-bookings.db (1 KB)
appointment-notifications.db (1 KB)
appointments-slots.db (1 KB)
availability-overrides.db (0 KB)
bookings.db (1 KB)
event-types.db (4 KB)
events.db (1 KB)
health-logs.db (17 KB)
interviewers.db (1 KB)
marketing-analytics.db (1 KB)
marketing-audiences.db (1 KB)
marketing-campaigns.db (1 KB)
marketing-events.db (1 KB)
marketing-templates.db (1 KB)
permission-atoms.db (4 KB)
permission-audit-logs.db (1 KB)
startup-records.db (19 KB)
sync-queue.db (0 KB)
users.db (1 KB)
```

### New Structure (2 files)
```
admin.db (6 KB) - All admin data with collection tags
application.db (2 KB) - All business data with collection tags
```

## 🔄 Cleanup Phases

### Phase 1: Validation Period (Recommended: 7-30 days)
**Status**: 🔄 Current Phase  
**Action**: Monitor system stability in hybrid mode  
**Files**: Keep all legacy files as backup  
**Mode**: Hybrid (new database preferred, legacy fallback)

**Monitoring Checklist**:
- [ ] Admin login functionality
- [ ] Event management operations
- [ ] Appointment system functionality
- [ ] Marketing CTA system
- [ ] Performance metrics within acceptable range
- [ ] No critical errors in logs

### Phase 2: Full Activation (After validation)
**Action**: Switch to new database only  
**API**: `POST /api/migration/activate {"mode":"new"}`  
**Files**: Keep legacy files for emergency rollback  
**Mode**: New database only

**Pre-activation Checklist**:
- [ ] All Phase 1 monitoring passed
- [ ] Performance improvements verified
- [ ] No rollback incidents during validation period
- [ ] Stakeholder approval for full activation

### Phase 3: Legacy Archive (30-90 days after activation)
**Action**: Move legacy files to archive directory  
**Location**: `server/data/archive/YYYY-MM-DD/`  
**Files**: Move but don't delete legacy files  
**Mode**: New database only with archived rollback

### Phase 4: Final Cleanup (90+ days after activation)
**Action**: Remove archived legacy files  
**Approval**: Requires stakeholder sign-off  
**Files**: Permanently delete legacy database files  
**Mode**: New database only

## 🛡️ Safety Measures

### Rollback Capabilities
```bash
# Emergency rollback to legacy (Phase 1-2)
curl -X POST "http://localhost:10000/api/migration/rollback-activation" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Manual rollback (Phase 3)
# Restore files from archive/YYYY-MM-DD/ to data/
# Restart service

# Data recovery (Phase 4)
# Restore from off-site backups if available
```

### Validation Commands
```bash
# Check current system status
curl -X GET "http://localhost:10000/api/migration/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Check database configuration  
curl -X GET "http://localhost:10000/api/migration/config" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# System health check
curl -X GET "http://localhost:10000/health"

# Admin functionality test
curl -X POST "http://localhost:10000/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infinitymatch.com","password":"admin123"}'
```

## 📈 Performance Monitoring

### Key Metrics to Track
- **Query Response Time**: Should improve with consolidated structure
- **Memory Usage**: Should decrease with fewer file handles
- **Database Size**: Significant reduction from 23 files to 2 files
- **Concurrent Operations**: Better performance with optimized structure

### Current Performance Baseline
- **Query Time**: 1ms (improved from legacy)
- **Memory Usage**: 211KB per operation
- **System Health**: All systems operational
- **Error Rate**: 0% (no critical issues)

## 🗑️ Cleanup Execution Scripts

### Phase 3: Archive Legacy Files
```bash
#!/bin/bash
# Archive legacy database files

DATE=$(date +%Y-%m-%d)
ARCHIVE_DIR="/home/yanggf/a/shesocial/server/data/archive/$DATE"
DATA_DIR="/home/yanggf/a/shesocial/server/data"

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# Move legacy files (keep new structure)
cd "$DATA_DIR"
mv admin-roles.db "$ARCHIVE_DIR/"
mv admin-users.db "$ARCHIVE_DIR/"
mv appointment-*.db "$ARCHIVE_DIR/"
mv availability-overrides.db "$ARCHIVE_DIR/"
mv bookings.db "$ARCHIVE_DIR/"
mv event-types.db "$ARCHIVE_DIR/"
mv events.db "$ARCHIVE_DIR/"
mv health-logs.db "$ARCHIVE_DIR/"
mv interviewers.db "$ARCHIVE_DIR/"
mv marketing-*.db "$ARCHIVE_DIR/"
mv permission-*.db "$ARCHIVE_DIR/"
mv startup-records.db "$ARCHIVE_DIR/"
mv sync-queue.db "$ARCHIVE_DIR/"
mv users.db "$ARCHIVE_DIR/"

# Keep admin.db and application.db
echo "Legacy files archived to: $ARCHIVE_DIR"
echo "Active files: admin.db, application.db"
```

### Phase 4: Final Cleanup
```bash
#!/bin/bash
# Final cleanup - remove archived files
# ⚠️ IRREVERSIBLE OPERATION ⚠️

ARCHIVE_BASE="/home/yanggf/a/shesocial/server/data/archive"

# List archives for confirmation
echo "Available archives:"
ls -la "$ARCHIVE_BASE"

read -p "Enter archive date to delete (YYYY-MM-DD): " DATE
read -p "⚠️ This will permanently delete $ARCHIVE_BASE/$DATE. Continue? (yes/NO): " CONFIRM

if [ "$CONFIRM" = "yes" ]; then
    rm -rf "$ARCHIVE_BASE/$DATE"
    echo "Archive $DATE permanently deleted"
else
    echo "Cleanup cancelled"
fi
```

## 📋 Cleanup Checklist

### Phase 1 Validation (Current)
- [x] Migration completed successfully
- [x] Hybrid mode activated
- [x] Admin functionality verified
- [x] System health monitoring active
- [ ] 7-day stability period completed
- [ ] Performance metrics within targets
- [ ] No critical errors reported

### Phase 2 Full Activation
- [ ] Validation period completed successfully
- [ ] Stakeholder approval obtained
- [ ] Full activation executed
- [ ] Post-activation testing completed
- [ ] Performance improvements verified

### Phase 3 Legacy Archive
- [ ] 30+ days in new mode without issues
- [ ] Archive script prepared and tested
- [ ] Rollback procedures documented
- [ ] Archive execution completed

### Phase 4 Final Cleanup
- [ ] 90+ days with archived legacy files
- [ ] No rollback incidents during archive period
- [ ] Final stakeholder approval
- [ ] Permanent deletion executed

## 🔐 Access Control

**Cleanup Operations Require**:
- Level 1 Admin permissions (`system` permission)
- Stakeholder approval for Phase 3+
- Documentation of cleanup activities
- Verification of rollback procedures

## 📞 Emergency Procedures

### If Issues Arise
1. **Immediate**: Use API rollback endpoint
2. **Manual**: Restore files from archive
3. **Critical**: Contact system administrator
4. **Data Loss**: Restore from off-site backups

### Contact Information
- **System Admin**: Available through admin dashboard
- **Technical Lead**: Check HANDOVER.md for current contact
- **Emergency**: Use rollback procedures first, then escalate

---

**Current Recommendation**: Continue Phase 1 validation for at least 7 days before proceeding to Phase 2 full activation.

**Space Savings**: Migration from 23 files to 2 files represents significant optimization while maintaining full functionality and safety.