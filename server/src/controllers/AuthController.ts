// Authentication Controller - User registration, login, and session management
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { UserModel } from '../models/User'
import { generateToken, generateRefreshToken, verifyRefreshToken, AuthenticatedRequest } from '../middleware/auth'
import { UserProfile } from '../types/database'

export class AuthController {
  private userModel: UserModel

  constructor(userModel: UserModel) {
    this.userModel = userModel
  }

  // POST /api/auth/register
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, profile, membershipType = 'regular' } = req.body

      // Basic validation
      if (!email || !password || !profile?.name) {
        res.status(400).json({
          success: false,
          error: '電子郵件、密碼和姓名為必填項目',
          message: 'Email, password, and name are required',
          timestamp: Date.now()
        })
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: '電子郵件格式無效',
          message: 'Invalid email format',
          timestamp: Date.now()
        })
        return
      }

      // Validate password strength
      if (password.length < 8) {
        res.status(400).json({
          success: false,
          error: '密碼長度必須至少8個字符',
          message: 'Password must be at least 8 characters long',
          timestamp: Date.now()
        })
        return
      }

      // Check if user already exists
      const existingUser = await this.userModel.findByEmail(email)
      if (existingUser.success) {
        res.status(409).json({
          success: false,
          error: '該電子郵件已被註冊',
          message: 'Email already registered',
          timestamp: Date.now()
        })
        return
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Set membership permissions based on type
      const membershipPermissions = this.getMembershipPermissions(membershipType)

      // Create user data
      const userData: Omit<UserProfile, '_id' | 'createdAt' | 'updatedAt'> = {
        email: email.toLowerCase(),
        password: hashedPassword,
        profile: {
          name: profile.name,
          age: profile.age || 0,
          bio: profile.bio || '',
          interests: profile.interests || [],
          location: profile.location || '台北',
          avatar: profile.avatar,
          videos: [],
          interviewStatus: {
            completed: false,
            duration: 0
          }
        },
        membership: {
          type: membershipType,
          joinDate: new Date(),
          payments: [],
          permissions: membershipPermissions
        }
      }

      // Create user
      const result = await this.userModel.create(userData)

      if (result.success && result.data) {
        // Generate tokens
        const accessToken = generateToken(result.data)
        const refreshToken = generateRefreshToken(result.data._id!)

        // Remove password from response
        const userResponse = { ...result.data }
        delete userResponse.password

        res.status(201).json({
          success: true,
          message: '註冊成功',
          data: {
            user: userResponse,
            accessToken,
            refreshToken,
            expiresIn: '7d'
          },
          timestamp: Date.now()
        })
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({
        success: false,
        error: '註冊失敗，請稍後重試',
        message: 'Registration failed',
        timestamp: Date.now()
      })
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, rememberMe = false } = req.body

      // Basic validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: '電子郵件和密碼為必填項目',
          message: 'Email and password are required',
          timestamp: Date.now()
        })
        return
      }

      // Find user by email
      const userResult = await this.userModel.findByEmail(email.toLowerCase())
      if (!userResult.success || !userResult.data) {
        res.status(401).json({
          success: false,
          error: '電子郵件或密碼錯誤',
          message: 'Invalid email or password',
          timestamp: Date.now()
        })
        return
      }

      const user = userResult.data

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password!)
      if (!passwordMatch) {
        res.status(401).json({
          success: false,
          error: '電子郵件或密碼錯誤',
          message: 'Invalid email or password',
          timestamp: Date.now()
        })
        return
      }

      // Update last login time
      await this.userModel.update(user._id!, {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })

      // Generate tokens
      const accessToken = generateToken(user)
      const refreshToken = generateRefreshToken(user._id!)

      // Remove password from response
      const userResponse = { ...user }
      delete userResponse.password

      res.json({
        success: true,
        message: '登入成功',
        data: {
          user: userResponse,
          accessToken,
          refreshToken,
          expiresIn: rememberMe ? '30d' : '7d'
        },
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        error: '登入失敗，請稍後重試',
        message: 'Login failed',
        timestamp: Date.now()
      })
    }
  }

  // POST /api/auth/refresh
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: '更新令牌為必填項目',
          message: 'Refresh token required',
          timestamp: Date.now()
        })
        return
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken)
      
      // Get user data
      const userResult = await this.userModel.findById(decoded.userId)
      if (!userResult.success || !userResult.data) {
        res.status(401).json({
          success: false,
          error: '無效的更新令牌',
          message: 'Invalid refresh token',
          timestamp: Date.now()
        })
        return
      }

      // Generate new access token
      const newAccessToken = generateToken(userResult.data)

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: '7d'
        },
        timestamp: Date.now()
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        error: '無效的更新令牌',
        message: 'Invalid refresh token',
        timestamp: Date.now()
      })
    }
  }

  // POST /api/auth/logout
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // In a production app, you might want to blacklist the token
      // For now, we'll just return success since JWT is stateless
      
      res.json({
        success: true,
        message: '登出成功',
        timestamp: Date.now()
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '登出失敗',
        message: 'Logout failed',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/auth/me
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: '未認證',
          message: 'Not authenticated',
          timestamp: Date.now()
        })
        return
      }

      const userResult = await this.userModel.findById(req.userId)
      if (!userResult.success || !userResult.data) {
        res.status(404).json({
          success: false,
          error: '用戶不存在',
          message: 'User not found',
          timestamp: Date.now()
        })
        return
      }

      // Remove password from response
      const userResponse = { ...userResult.data }
      delete userResponse.password

      res.json({
        success: true,
        data: userResponse,
        timestamp: Date.now()
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '獲取用戶信息失敗',
        message: 'Failed to get user information',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/auth/change-password
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: '當前密碼和新密碼為必填項目',
          message: 'Current password and new password are required',
          timestamp: Date.now()
        })
        return
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          error: '新密碼長度必須至少8個字符',
          message: 'New password must be at least 8 characters long',
          timestamp: Date.now()
        })
        return
      }

      // Get current user
      const userResult = await this.userModel.findById(req.userId!)
      if (!userResult.success || !userResult.data) {
        res.status(404).json({
          success: false,
          error: '用戶不存在',
          message: 'User not found',
          timestamp: Date.now()
        })
        return
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, userResult.data.password!)
      if (!passwordMatch) {
        res.status(401).json({
          success: false,
          error: '當前密碼錯誤',
          message: 'Current password is incorrect',
          timestamp: Date.now()
        })
        return
      }

      // Hash new password
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

      // Update password
      const updateResult = await this.userModel.update(req.userId!, {
        password: hashedNewPassword,
        updatedAt: new Date()
      })

      if (updateResult.success) {
        res.json({
          success: true,
          message: '密碼更新成功',
          timestamp: Date.now()
        })
      } else {
        res.status(400).json(updateResult)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '密碼更新失敗',
        message: 'Password change failed',
        timestamp: Date.now()
      })
    }
  }

  // Helper method to get membership permissions
  private getMembershipPermissions(membershipType: UserProfile['membership']['type']): UserProfile['membership']['permissions'] {
    switch (membershipType) {
      case 'premium_2500':
        return {
          viewParticipants: true,
          priorityBooking: true
        }
      case 'premium_1300':
        return {
          viewParticipants: false,
          priorityBooking: true
        }
      case 'vip':
        return {
          viewParticipants: false,
          priorityBooking: true
        }
      case 'regular':
      default:
        return {
          viewParticipants: false,
          priorityBooking: false
        }
    }
  }
}