// Debug frontend login - test the exact same request the frontend makes
const testFrontendLogin = async () => {
  const API_BASE_URL = 'http://localhost:10000/api/admin'
  const API_ENDPOINT = '/auth/login'
  
  const credentials = {
    username: 'superadmin',
    password: 'SuperAdmin2025!'
  }
  
  console.log('🧪 Testing frontend login simulation...')
  console.log(`URL: ${API_BASE_URL}${API_ENDPOINT}`)
  console.log(`Credentials: ${JSON.stringify(credentials)}`)
  
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const data = await response.json()
    console.log('Response data:', data)
    
    if (!response.ok) {
      console.log('❌ Request failed:', data.error)
    } else {
      console.log('✅ Request succeeded')
    }
    
  } catch (error) {
    console.error('❌ Request error:', error)
  }
}

testFrontendLogin()