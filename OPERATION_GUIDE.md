# InfinityMatch 天造地設人成對 - Operation Guide

## Admin User List

### 第一層：最高權限層 (Top-Level Administrators)

#### 1. 總管理員 (Super Admin)
- **Email**: `admin@infinitymatch.com`
- **Password**: `admin123`
- **Real Name**: 總管理員
- **Employee ID**: CEO-001
- **Department**: Executive
- **Role**: Super Admin
- **Permissions**: All permissions (*)
- **Session Timeout**: 8 hours
- **Description**: 業務最高決策權，擁有所有權限

#### 2. 系統維護員 (System Admin)
- **Email**: `sysadmin@infinitymatch.tw`
- **Password**: `SysAdmin2025!`
- **Real Name**: 李技術長
- **Employee ID**: CTO-002
- **Department**: Technical
- **Role**: System Admin
- **Permissions**: All permissions (*)
- **Session Timeout**: 8 hours
- **Description**: 技術最高權限，負責系統安全和穩定運行

---

### 第二層：日常營運層 (Operations Level)

#### 3. 日常營運 (Operations Admin)
- **Email**: `operations@infinitymatch.tw`
- **Password**: `Operations2025!`
- **Real Name**: 王營運經理
- **Employee ID**: OPS-003
- **Department**: Operations
- **Role**: Operations Admin
- **Permissions**: 18 permissions (content management, events, basic user view, appointments, interviewers)
- **Session Timeout**: 6 hours
- **Description**: 日常營運：內容營運、活動管理，包含預約系統和面試官基本管理權限

#### 4. 客戶管理 (Customer Admin)
- **Email**: `customer@infinitymatch.tw`
- **Password**: `Customer2025!`
- **Real Name**: 陳客戶經理
- **Employee ID**: CSM-004
- **Department**: Members
- **Role**: Customer Admin
- **Permissions**: Full customer management (users, interviews, interviewers, appointments, payments, VIP services)
- **Session Timeout**: 6 hours
- **Description**: 客戶管理：面試流程、面試官維護、預約時段、付費用戶、VIP服務專責管理

---

## Access Information

### Login Method
- Use **EMAIL** to login (not username)
- All logins are processed through `/api/admin/auth/login`

### Admin System Architecture
- **2層4類權限架構** (2-layer 4-category permission structure)
- **Atomic Permission System**: 58 granular permissions across 8 functional groups
- **Role-Based Access Control**: 4 department-based roles
- **Independent Authentication**: Separate JWT system from user authentication

### Security Features
- JWT tokens with 8-hour expiry (top level) / 6-hour expiry (operations level)
- bcrypt password hashing with salt rounds = 12
- Permission-based access control
- Audit logging for all admin operations

---

## System Status
- **Total Admin Users**: 4
- **Permission Atoms**: 58
- **Admin Roles**: 4
- **Database Collections**: admin_users, admin_roles, permission_atoms, permission_audit_logs

---

*Last Updated: 2025-07-17*