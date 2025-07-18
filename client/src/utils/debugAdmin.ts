// Debug utility for admin permissions
import { useAdminAuthStore } from '../hooks/useAdminAuth';

// This will run when the module is imported
console.log('🔍 Debug Admin Permissions');

// Check if we're in development mode
if (process.env.NODE_ENV === 'development') {
  // Get the admin auth store
  const adminStore = useAdminAuthStore.getState();
  
  console.log('📋 Admin Auth Store:', {
    isAuthenticated: adminStore.isAuthenticated,
    admin: adminStore.admin,
    hasToken: !!adminStore.accessToken
  });
  
  // Check permissions
  if (adminStore.admin?.permissions) {
    console.log('🔑 Admin Permissions:', adminStore.admin.permissions);
    
    // Check specific permissions
    const permissionsToCheck = [
      'events:view',
      'events:create',
      'events:edit',
      'events:showcase',
      'interviews:view',
      'appointments:view',
      'admin:permissions',
      'admin:create',
      'admin:audit'
    ];
    
    console.log('🧪 Permission Checks:');
    permissionsToCheck.forEach(permission => {
      const hasPermission = adminStore.hasPermission(permission);
      console.log(`- ${permission}: ${hasPermission ? '✅' : '❌'}`);
    });
  } else {
    console.log('❌ No admin permissions found');
  }
  
  // Add a global debug function
  (window as any).debugAdminPermissions = () => {
    const currentStore = useAdminAuthStore.getState();
    console.log('📋 Current Admin Auth Store:', {
      isAuthenticated: currentStore.isAuthenticated,
      admin: currentStore.admin,
      hasToken: !!currentStore.accessToken
    });
    
    if (currentStore.admin?.permissions) {
      console.log('🔑 Current Admin Permissions:', currentStore.admin.permissions);
      
      // Check specific permissions
      const permissionsToCheck = [
        'events:view',
        'events:create',
        'events:edit',
        'events:showcase',
        'interviews:view',
        'appointments:view',
        'admin:permissions',
        'admin:create',
        'admin:audit'
      ];
      
      console.log('🧪 Current Permission Checks:');
      permissionsToCheck.forEach(permission => {
        const hasPermission = currentStore.hasPermission(permission);
        console.log(`- ${permission}: ${hasPermission ? '✅' : '❌'}`);
      });
    } else {
      console.log('❌ No admin permissions found');
    }
  };
  
  console.log('🔧 Debug function added to window: debugAdminPermissions()');
}
