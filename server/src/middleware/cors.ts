// CORS Middleware Configuration
import cors from 'cors'

const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // React dev server
    'https://shesocial.tw',  // Production domain
    'https://www.shesocial.tw'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Client-Version'
  ],
  maxAge: 86400 // 24 hours
}

export default cors(corsOptions)