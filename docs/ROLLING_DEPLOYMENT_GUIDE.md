# Rolling Deployment Guide - Two-Database Migration

## 🚀 Overview

Complete rolling deployment system for migrating from 21-file legacy structure to optimized 2-database architecture.

## 📁 System Components

### Core Services

**DatabaseMigrationService** (`server/src/services/DatabaseMigrationService.ts`)
- Full migration orchestration with progress tracking
- Automatic rollback snapshot creation
- Data validation and integrity checks
- Admin and application data separation

**QueryAdapterService** (`server/src/services/QueryAdapterService.ts`)  
- Seamless transition between legacy and new database structures
- Hybrid mode support (try new, fallback to legacy)
- Adaptive query routing based on data availability
- Performance monitoring during transition

**MigrationValidationService** (`server/src/services/MigrationValidationService.ts`)
- Comprehensive validation framework (data integrity, security, performance)
- Critical issue detection with rollback recommendations
- Business logic validation (admin levels, referential integrity)
- Automated health checks for both database structures

### API Endpoints

**Migration Management** (`/api/migration/*`)
- `GET /plan` - Analyze migration readiness and generate execution plan
- `POST /snapshot` - Create rollback snapshot before migration
- `POST /start` - Start migration process with progress tracking
- `GET /progress` - Real-time migration progress monitoring
- `POST /validate` - Validate migration results and data integrity
- `POST /rollback` - Emergency rollback to previous state
- `POST /stop` - Pause migration process
- `GET /status` - System status (legacy vs new database usage)
- `GET /logs` - Migration logs and audit trail

## 🔄 Migration Process

### Phase 1: Pre-Migration
1. **System Analysis** - Analyze current data and create migration plan
2. **Rollback Preparation** - Create automatic rollback snapshots
3. **Validation Setup** - Configure validation rules and health checks

### Phase 2: Data Migration  
1. **Admin Data Migration** - Migrate admin collections to `admin.db`
2. **Application Data Migration** - Migrate business collections to `application.db`
3. **Real-time Progress** - Track migration progress with detailed logging

### Phase 3: Validation & Rollout
1. **Data Integrity Validation** - Comprehensive validation across all categories
2. **Performance Testing** - Query performance and system load validation
3. **Gradual Rollout** - Use QueryAdapter hybrid mode for safe transition

### Phase 4: Optimization
1. **Query Migration** - Update services to use new database structure
2. **Legacy Cleanup** - Remove legacy files after successful migration
3. **Performance Monitoring** - Ongoing system health monitoring

## 🗄️ Database Architecture

### Legacy Structure (21 Files)
```
server/data/
├── admin-users.db
├── admin-roles.db  
├── permission-atoms.db
├── permission-audit-logs.db
├── users.db
├── events.db
├── bookings.db
├── appointments-slots.db
├── appointment-bookings.db
├── interviewers.db
├── availability-overrides.db
├── appointment-notifications.db
├── startup-records.db
├── health-logs.db
├── sync-queue.db
├── marketing-campaigns.db
├── marketing-templates.db
├── marketing-audiences.db
├── marketing-analytics.db
├── marketing-events.db
└── event-types.db
```

### New Structure (2 Files)
```
server/data/
├── admin.db          # All admin-related data with _collection tags
└── application.db    # All user/business data with _collection tags
```

## 🔧 Usage Examples

### Basic Migration Flow

```typescript
// 1. Create migration service
const migrationService = new DatabaseMigrationService()

// 2. Analyze migration plan
const plan = await migrationService.analyzeMigrationPlan()
console.log(`Migration will process ${plan.estimatedRecords} records`)

// 3. Create rollback snapshot
const snapshotCreated = await migrationService.createRollbackSnapshot()

// 4. Execute migration with progress tracking
const result = await migrationService.executeFullMigration((progress) => {
  console.log(`Progress: ${progress.percentage}% - ${progress.step}`)
})

// 5. Validate results
const validation = await migrationService.validateMigration()
if (!validation.valid) {
  await migrationService.rollback()
}
```

### Query Adapter Usage

```typescript
// Initialize with hybrid mode for safe transition
const queryAdapter = new QueryAdapterService({
  mode: 'hybrid',
  preferNew: true,
  fallbackEnabled: true
})

// Adaptive queries automatically select best database
const user = await queryAdapter.findUser({ userId: 'user123' })
const events = await queryAdapter.adaptiveQuery('events', 'find', { status: 'active' })

// Switch to new database after validation
queryAdapter.updateConfig({ mode: 'new' })
```

### API Management

```bash
# Check migration readiness
curl -X GET "http://localhost:10000/api/migration/plan" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

# Start migration process
curl -X POST "http://localhost:10000/api/migration/start" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

# Monitor progress
curl -X GET "http://localhost:10000/api/migration/progress" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

# Validate results
curl -X POST "http://localhost:10000/api/migration/validate" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

# Emergency rollback if needed
curl -X POST "http://localhost:10000/api/migration/rollback" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

## ✅ Validation Framework

### Validation Categories

**Critical Issues** (Block deployment)
- Data corruption or missing records
- Admin user integrity (must have Level 1 admin)
- Security vulnerabilities (password hashes, etc.)

**Warnings** (Monitor closely)
- Performance degradation
- Missing collection tags
- Referential integrity issues

**Info** (Tracking only)  
- Migration timestamps
- Record counts and statistics
- System configuration changes

### Validation Results

```typescript
interface ValidationReport {
  overall: boolean                    // Safe to proceed
  criticalIssues: ValidationResult[]  // Must fix before deployment
  warnings: ValidationResult[]       // Monitor after deployment
  info: ValidationResult[]           // Informational only
  recommendations: string[]          // Action items
}
```

## 🔄 Rollback Strategy

### Automatic Rollback
- Pre-migration snapshots created automatically
- One-click rollback via API endpoint
- Preserves all legacy database files
- Rollback validation ensures clean restore

### Emergency Procedures
1. **API Rollback** - `POST /api/migration/rollback`
2. **Manual Rollback** - Copy files from `rollback/snapshot-*` directory
3. **Service Restart** - Restart application to clear caches

## 📊 Monitoring & Health Checks

### System Status Monitoring
```typescript
// Get real-time system status
const status = await queryAdapter.getSystemStats()
console.log('Legacy records:', status.legacy)
console.log('New records:', status.new)
console.log('Current mode:', status.mode)

// Health check both structures
const health = await queryAdapter.healthCheck()
console.log('Legacy healthy:', health.legacy)
console.log('New healthy:', health.new)
```

### Performance Metrics
- Query response times
- Database size optimization
- Memory usage comparison
- Concurrent operation handling

## 🔐 Security Considerations

### Access Control
- Migration APIs require Level 1 admin permissions (`system` permission)
- Rollback snapshots stored securely with metadata
- Migration logs include admin audit trail

### Data Protection
- Password hash validation during migration
- Encrypted snapshot storage
- Secure rollback procedures
- Admin session validation

## 🎯 Production Deployment Steps

### Step 1: Pre-Deployment
1. Schedule maintenance window (optional for large datasets)
2. Notify stakeholders of migration timeline
3. Verify admin access and rollback procedures

### Step 2: Migration Execution
1. Create rollback snapshot
2. Start migration with progress monitoring
3. Validate results before proceeding
4. Switch to hybrid mode for gradual transition

### Step 3: Post-Migration
1. Monitor system performance and health
2. Update applications to use new database structure
3. Remove legacy files after validation period
4. Document lessons learned and optimizations

## 📋 Troubleshooting

### Common Issues

**Migration Failures**
- Check disk space for snapshot creation
- Verify admin permissions and authentication  
- Review migration logs for specific errors

**Performance Issues**
- Large datasets may require maintenance window
- Monitor memory usage during migration
- Consider chunked migration for very large collections

**Validation Failures**
- Review validation report for specific issues
- Use rollback if critical issues detected
- Manual data fixes may be required for warnings

### Recovery Procedures
1. **Immediate rollback** for critical failures
2. **Hybrid mode** for gradual issue resolution
3. **Manual fixes** for non-critical validation warnings
4. **Re-migration** after resolving underlying issues

## 🚀 Next Steps

After successful migration:
1. Update all services to use QueryAdapter or direct new database access
2. Remove legacy database files
3. Update backup and maintenance procedures  
4. Monitor long-term performance improvements
5. Document optimizations and lessons learned

---

**System Status**: Ready for rolling deployment with comprehensive safety measures and monitoring.