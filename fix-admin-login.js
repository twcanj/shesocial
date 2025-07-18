// Fix admin login endpoint
const fs = require('fs');
const path = require('path');

// Path to the admin.ts file
const adminTsPath = path.join(__dirname, 'server/src/routes/admin.ts');

// Read the file
const adminTsContent = fs.readFileSync(adminTsPath, 'utf8');

// Find the login endpoint
const loginEndpointRegex = /router\.post\('\/auth\/login', async \(req, res\) => \{([\s\S]*?)}\)\)/;
const loginEndpointMatch = adminTsContent.match(loginEndpointRegex);

if (!loginEndpointMatch) {
  console.error('Login endpoint not found in admin.ts');
  process.exit(1);
}

// Extract the login endpoint content
const loginEndpointContent = loginEndpointMatch[0];

// Check if the login endpoint is returning permissions
if (loginEndpointContent.includes('permissions: permissions')) {
  console.log('Login endpoint already includes permissions');
  process.exit(0);
}

// Fix the login endpoint to include permissions
const fixedLoginEndpointContent = loginEndpointContent.replace(
  /res\.json\(\{[\s\S]*?success: true,[\s\S]*?data: \{[\s\S]*?admin: \{([\s\S]*?)},[\s\S]*?accessToken,[\s\S]*?refreshToken,[\s\S]*?expiresIn: ADMIN_JWT_EXPIRES_IN[\s\S]*?}\)\)/,
  (match, adminProps) => {
    // Check if permissions are already included
    if (adminProps.includes('permissions:')) {
      return match;
    }
    
    // Add permissions to the admin object
    const fixedAdminProps = adminProps + ',\n          permissions: permissions';
    
    return match.replace(adminProps, fixedAdminProps);
  }
);

// Replace the login endpoint in the file
const fixedAdminTsContent = adminTsContent.replace(loginEndpointRegex, fixedLoginEndpointContent);

// Write the fixed file
fs.writeFileSync(adminTsPath, fixedAdminTsContent);

console.log('Admin login endpoint fixed to include permissions');

// Rebuild the server
console.log('Rebuilding the server...');
const { execSync } = require('child_process');
execSync('cd server && npm run build', { stdio: 'inherit' });

console.log('Server rebuilt successfully');
