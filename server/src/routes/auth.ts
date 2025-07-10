// Authentication Routes
import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserModel } from '../models/User'
import { authenticateToken } from '../middleware/auth'
import NeDBSetup from '../db/nedb-setup'

// Initialize database and models
const dbSetup = new NeDBSetup()
const databases = dbSetup.getDatabases()
const userModel = new UserModel(databases.users)

// Initialize controller
const authController = new AuthController(userModel)

const router = Router()

// Public routes
router.post('/register', authController.register.bind(authController))
router.post('/login', authController.login.bind(authController))
router.post('/refresh', authController.refreshToken.bind(authController))

// Protected routes
router.post('/logout', authenticateToken, authController.logout.bind(authController))
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController))
router.put('/change-password', authenticateToken, authController.changePassword.bind(authController))

export default router