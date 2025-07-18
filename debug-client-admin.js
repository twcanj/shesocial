// Debug script to check localStorage for admin auth data
const fs = require('fs');
const path = require('path');
const os = require('os');

async function debugClientAdmin() {
  try {
    console.log('Debugging client admin auth data...');
    
    // Path to localStorage file
    const localStoragePath = path.join(os.homedir(), '.config/google-chrome/Default/Local Storage/leveldb');
    
    console.log('Looking for localStorage in:', localStoragePath);
    
    // Check if the directory exists
    if (!fs.existsSync(localStoragePath)) {
      console.error(`Local Storage directory not found: ${localStoragePath}`);
      return;
    }
    
    // List files in the directory
    const files = fs.readdirSync(localStoragePath);
    console.log('Files in Local Storage directory:', files);
    
    // Create a test HTML file to check localStorage
    const testHtmlPath = path.join(__dirname, 'debug-admin-storage.html');
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Debug Admin Storage</title>
      <script>
        function checkAdminStorage() {
          const adminAuthData = localStorage.getItem('admin-auth-storage');
          
          if (adminAuthData) {
            try {
              const parsedData = JSON.parse(adminAuthData);
              document.getElementById('result').textContent = JSON.stringify(parsedData, null, 2);
              console.log('Admin auth data:', parsedData);
            } catch (error) {
              document.getElementById('result').textContent = 'Error parsing admin auth data: ' + error.message;
              console.error('Error parsing admin auth data:', error);
            }
          } else {
            document.getElementById('result').textContent = 'No admin auth data found in localStorage';
            console.log('No admin auth data found in localStorage');
          }
        }
      </script>
    </head>
    <body onload="checkAdminStorage()">
      <h1>Debug Admin Storage</h1>
      <pre id="result">Checking localStorage...</pre>
    </body>
    </html>
    `;
    
    fs.writeFileSync(testHtmlPath, htmlContent);
    
    console.log(`Created test HTML file: ${testHtmlPath}`);
    console.log('Open this file in your browser to check localStorage');
    
    // Create a script to manually set localStorage
    const setLocalStoragePath = path.join(__dirname, 'set-admin-storage.html');
    
    const setLocalStorageContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Set Admin Storage</title>
      <script>
        function setAdminStorage() {
          const adminAuthData = {
            state: {
              admin: {
                adminId: '26aeae8f-c34d-4b37-938e-53fffa6da639',
                username: 'admin',
                email: 'admin@infinitymatch.com',
                roleId: '709cffe1-9a5e-47c6-a0f7-3eaefc625142',
                department: 'admin',
                status: 'active',
                permissions: ['*']
              },
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiMjZhZWFlOGYtYzM0ZC00YjM3LTkzOGUtNTNmZmZhNmRhNjM5IiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVJZCI6IjcwOWNmZmUxLTlhNWUtNDdjNi1hMGY3LTNlYWVmYzYyNTE0MiIsImRlcGFydG1lbnQiOiJhZG1pbiIsImlhdCI6MTc1Mjg1ODEwMCwiZXhwIjoxNzUyODg2OTAwfQ.DTE3epuvrjS86oN-vnTp54pfvLxOCOcd12xMKPQfbgk',
              refreshToken: null,
              isAuthenticated: true
            },
            version: 0
          };
          
          localStorage.setItem('admin-auth-storage', JSON.stringify(adminAuthData));
          document.getElementById('result').textContent = 'Admin auth data set in localStorage';
          console.log('Admin auth data set in localStorage');
        }
      </script>
    </head>
    <body>
      <h1>Set Admin Storage</h1>
      <button onclick="setAdminStorage()">Set Admin Storage</button>
      <pre id="result">Click the button to set admin auth data in localStorage</pre>
    </body>
    </html>
    `;
    
    fs.writeFileSync(setLocalStoragePath, setLocalStorageContent);
    
    console.log(`Created set localStorage HTML file: ${setLocalStoragePath}`);
    console.log('Open this file in your browser and click the button to set admin auth data in localStorage');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugClientAdmin();
