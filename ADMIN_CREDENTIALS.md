# Admin System Credentials

## Login Method
All admin users must login using their **email address** (not username) and password.

## Admin Users

### 1. Super Admin (Executive)
- **Email**: `superadmin@infinitymatch.tw`
- **Password**: `SuperAdmin2025!`
- **Role**: super_admin
- **Department**: executive
- **Real Name**: 張執行長
- **Employee ID**: CEO-001
- **Permissions**: All permissions (wildcard `*`)

### 2. System Admin (Technical)
- **Email**: `sysadmin@infinitymatch.tw`
- **Password**: `SysAdmin2025!`
- **Role**: system_admin
- **Department**: technical
- **Real Name**: 李技術長
- **Employee ID**: CTO-002
- **Permissions**: All permissions (wildcard `*`)

### 3. Operations Admin (Operations)
- **Email**: `operations@infinitymatch.tw`
- **Password**: `Operations2025!`
- **Role**: operation_admin
- **Department**: operations
- **Real Name**: 王營運經理
- **Employee ID**: OPS-003
- **Permissions**: Content management, events, users view, appointments, interviewers

### 4. Customer Admin (Members)
- **Email**: `customer@infinitymatch.tw`
- **Password**: `Customer2025!`
- **Role**: customer_admin
- **Department**: members
- **Real Name**: 陳客戶經理
- **Employee ID**: CSM-004
- **Permissions**: User management, interviews, payments, VIP services, appointments

## API Endpoints

### Admin Authentication
- **Login**: `POST /api/admin/auth/login`
  ```json
  {
    "email": "superadmin@infinitymatch.tw",
    "password": "SuperAdmin2025!"
  }
  ```

- **Logout**: `POST /api/admin/auth/logout`
- **Refresh Token**: `POST /api/admin/auth/refresh`
- **Get Profile**: `GET /api/admin/auth/profile`

### Admin Management
- **Events**: `GET /api/admin/events` (requires `admin:audit` permission)
- **Permissions**: `GET /api/admin/permissions/atoms`
- **Roles**: `GET /api/admin/roles`
- **Users**: `GET /api/admin/users`
- **Audit Logs**: `GET /api/admin/audit/logs`

## Database Collections
- `admin_users`: Admin user accounts
- `admin_roles`: Role definitions
- `permission_atoms`: Individual permission definitions
- `permission_audit_logs`: Audit trail

## Permission System
- **58 permission atoms** across 8 functional groups
- **4 department-based roles** with hierarchical permissions
- **Atomic permission validation** with dependency checking
- **Audit logging** for all admin actions

## Session Management
- **Access Token**: 8-hour expiry
- **Refresh Token**: 24-hour expiry
- **JWT-based authentication** separate from user system
- **Permission-based API access control**