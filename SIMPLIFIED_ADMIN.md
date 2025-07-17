# Simplified Admin System Proposal

## Problem
Currently there are **too many admin users** created from multiple conflicting sources:
- 4 different admin users (superadmin, sysadmin, operations, customer)
- Complex permission system with 58 atomic permissions
- 4 department-based roles
- Over-engineered for a simple social platform

## Recommended Solution: Single Admin User

### Single Admin Approach
```javascript
// Simple admin user
{
  email: 'admin@infinitymatch.tw',
  password: 'Admin2025!',
  role: 'admin',
  permissions: ['*'] // All permissions
}
```

### Benefits
- **Simplicity**: One admin account to manage
- **Security**: Fewer accounts = fewer attack vectors
- **Maintenance**: Easier to maintain and understand
- **Sufficient**: For a social platform, one admin is usually enough

### Implementation
1. Keep only the superadmin user
2. Remove the complex permission system
3. Simplify the database schema
4. Remove unnecessary roles and departments

## Current State vs Proposed

### Current (Over-engineered)
- 4 admin users
- 58 permission atoms
- 4 roles with complex hierarchies
- Multiple departments
- Complex audit system

### Proposed (Simple)
- 1 admin user
- Basic permissions (admin vs user)
- Simple role system
- Easy to understand and maintain

## Question for User
**Which approach would you prefer?**
1. **Simple**: One admin user with all permissions
2. **Current**: Keep the complex 4-user system
3. **Hybrid**: Simplified version with 2 users (admin + moderator)