// Simple test server to check basic functionality
import express from 'express'

const app = express()
const PORT = 3001

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'SheSocial API Test Server', status: 'running' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() })
})

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`)
})