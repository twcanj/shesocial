// Script to modify the admin.ts file to add more debugging
const fs = require('fs');
const path = require('path');

async function modifyAdminTs() {
  try {
    console.log('Modifying admin.ts file to add more debugging...');
    
    // Path to the admin.ts file
    const adminTsPath = path.join(__dirname, 'server/src/routes/admin.ts');
    
    // Check if the file exists
    if (!fs.existsSync(adminTsPath)) {
      console.error(`Admin.ts file not found: ${adminTsPath}`);
      return;
    }
    
    // Read the file
    const adminTsContent = fs.readFileSync(adminTsPath, 'utf8');
    
    // Add debugging to the login endpoint
    const loginEndpointRegex = /router\.post\('\/auth\/login', async \(req, res\) => \{([\s\S]*?)}\)\)/;
    const loginEndpointMatch = adminTsContent.match(loginEndpointRegex);
    
    if (!loginEndpointMatch) {
      console.error('Login endpoint not found in admin.ts');
      return;
    }
    
    const loginEndpointContent = loginEndpointMatch[1];
    const debuggedLoginEndpointContent = loginEndpointContent.replace(
      /try \{([\s\S]*?)const \{ email, password \} = req\.body/,
      `try {
      console.log('🔍 Admin login endpoint called')
      console.log('📦 Request body:', req.body)
      const { email, password } = req.body`
    ).replace(
      /if \(!adminUser\) \{([\s\S]*?)return res\.status\(401\)\.json\(\{ error: 'Invalid credentials' \}\)/,
      `if (!adminUser) {
      console.log('❌ Admin user not found:', email)
      return res.status(401).json({ error: 'Invalid credentials' })`
    ).replace(
      /const isValidPassword = await bcrypt\.compare\(password, adminUser\.passwordHash\)/,
      `console.log('🔑 Checking password for:', adminUser.username)
      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash)
      console.log('🔐 Password valid:', isValidPassword)`
    ).replace(
      /if \(!isValidPassword\) \{([\s\S]*?)return res\.status\(401\)\.json\(\{ error: 'Invalid credentials' \}\)/,
      `if (!isValidPassword) {
      console.log('❌ Invalid password for:', adminUser.username)
      return res.status(401).json({ error: 'Invalid credentials' })`
    ).replace(
      /if \(adminUser\.status !== 'active'\) \{([\s\S]*?)return res\.status\(403\)\.json\(\{ error: 'Admin account is suspended or inactive' \}\)/,
      `if (adminUser.status !== 'active') {
      console.log('❌ Admin account is not active:', adminUser.status)
      return res.status(403).json({ error: 'Admin account is suspended or inactive' })`
    ).replace(
      /const permissions = await adminPermissionService\.getUserPermissions\(adminUser\.adminId\)/,
      `console.log('🔍 Getting permissions for admin:', adminUser.adminId)
      const permissions = await adminPermissionService.getUserPermissions(adminUser.adminId)
      console.log('📋 Admin permissions:', permissions)`
    ).replace(
      /res\.json\(\{([\s\S]*?)}\)\)/,
      `const response = {
        success: true,
        data: {
          admin: {
            adminId: adminUser.adminId,
            username: adminUser.username,
            email: adminUser.email,
            profile: adminUser.profile,
            roleId: adminUser.roleId,
            department: adminUser.profile.department,
            status: adminUser.status,
            permissions: permissions
          },
          accessToken,
          refreshToken,
          expiresIn: ADMIN_JWT_EXPIRES_IN
        }
      }
      
      console.log('✅ Login successful for:', adminUser.username)
      console.log('📦 Response data:', JSON.stringify(response, null, 2))
      
      res.json(response)
    })`
    );
    
    // Replace the login endpoint in the file
    const debuggedAdminTsContent = adminTsContent.replace(
      loginEndpointRegex,
      `router.post('/auth/login', async (req, res) => {${debuggedLoginEndpointContent}})`
    );
    
    // Write the modified file
    fs.writeFileSync(adminTsPath, debuggedAdminTsContent);
    
    console.log('Admin.ts file modified successfully');
    
    // Rebuild the server
    console.log('Rebuilding the server...');
    const { execSync } = require('child_process');
    execSync('cd server && npm run build', { stdio: 'inherit' });
    
    console.log('Server rebuilt successfully');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

modifyAdminTs();
