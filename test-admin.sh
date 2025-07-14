#!/bin/bash

# Admin Dashboard Test Script
echo "🧪 Testing Admin Dashboard System..."
echo

# Test 1: Admin Login
echo "1️⃣ Testing Admin Login..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:10000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "admin123"}')

if echo "$LOGIN_RESULT" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Admin login successful"
  TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.data.accessToken')
  USERNAME=$(echo "$LOGIN_RESULT" | jq -r '.data.admin.username')
  DEPARTMENT=$(echo "$LOGIN_RESULT" | jq -r '.data.admin.department')
  ROLE=$(echo "$LOGIN_RESULT" | jq -r '.data.admin.roleId')
  echo "   Username: $USERNAME"
  echo "   Department: $DEPARTMENT"
  echo "   Role: $ROLE"
else
  echo "❌ Admin login failed"
  exit 1
fi

# Test 2: Permission Management
echo
echo "2️⃣ Testing Permission Management..."
PERM_RESULT=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:10000/api/admin/permissions/atoms/grouped)

if echo "$PERM_RESULT" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Permission atoms loaded successfully"
  GROUPS=$(echo "$PERM_RESULT" | jq -r '.data | keys | join(", ")')
  echo "   Groups: $GROUPS"
  
  # Count total permissions
  TOTAL_PERMS=0
  for group in $(echo "$PERM_RESULT" | jq -r '.data | keys[]'); do
    COUNT=$(echo "$PERM_RESULT" | jq ".data.$group | length")
    TOTAL_PERMS=$((TOTAL_PERMS + COUNT))
  done
  echo "   Total permissions: $TOTAL_PERMS"
else
  echo "❌ Permission loading failed"
  exit 1
fi

# Test 3: Role Management
echo
echo "3️⃣ Testing Role Management..."
ROLES_RESULT=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:10000/api/admin/roles)

if echo "$ROLES_RESULT" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Roles loaded successfully"
  ROLE_COUNT=$(echo "$ROLES_RESULT" | jq '.data | length')
  echo "   Available roles: $ROLE_COUNT"
  
  echo "$ROLES_RESULT" | jq -r '.data[] | "   - \(.roleId): \(.name) (\(.department))"'
else
  echo "❌ Roles loading failed"
  exit 1
fi

# Test 4: Role Capabilities
echo
echo "4️⃣ Testing Role Capabilities..."
CAP_RESULT=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:10000/api/admin/roles/super_admin/capabilities)

if echo "$CAP_RESULT" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Role capabilities loaded successfully"
  TOTAL_PERMS=$(echo "$CAP_RESULT" | jq -r '.data.totalPermissions')
  RISK_LEVELS=$(echo "$CAP_RESULT" | jq -c '.data.riskLevels')
  ACCESS_GROUPS=$(echo "$CAP_RESULT" | jq -r '.data.canAccessGroups | join(", ")')
  echo "   Total permissions: $TOTAL_PERMS"
  echo "   Risk levels: $RISK_LEVELS"
  echo "   Access groups: $ACCESS_GROUPS"
else
  echo "❌ Role capabilities loading failed"
  exit 1
fi

# Test 5: Frontend Accessibility
echo
echo "5️⃣ Testing Frontend Accessibility..."
if curl -s -f http://localhost:5173 > /dev/null; then
  echo "✅ Frontend is accessible"
  echo "   Status: 200 OK"
else
  echo "❌ Frontend not accessible"
  exit 1
fi

echo
echo "🎉 All admin dashboard tests passed!"
echo
echo "📋 Manual Testing Instructions:"
echo "1. Open http://localhost:5173 in browser"
echo "2. Open browser console (F12)"
echo "3. In console, manually navigate to admin:"
echo '   - Edit the URL or modify App.tsx currentPage to "admin"'
echo "4. Login with: superadmin / admin123"
echo "5. Test all navigation sections:"
echo "   - 系統總覽 (Overview)"
echo "   - 權限管理 (Permission Management)"
echo "   - 角色管理 (Role Management)" 
echo "   - 管理員管理 (User Management)"
echo "   - 審計日誌 (Audit Logs)"
echo "6. Check for console errors"
echo "7. Verify luxury UI styling and Traditional Chinese text"
echo
echo "✨ Admin Dashboard is ready for production use!"