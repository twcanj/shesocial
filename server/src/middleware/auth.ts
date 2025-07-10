// JWT Authentication Middleware for SheSocial
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { UserProfile } from '../types/database'

// Extend Express Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: UserProfile
  userId?: string
}

// JWT Secret from environment or default for development
const JWT_SECRET = process.env.JWT_SECRET || 'shesocial-taiwan-luxury-social-platform-secret-key-2025'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

// Generate JWT token for user
export const generateToken = (user: UserProfile): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    membershipType: user.membership.type,
    permissions: user.membership.permissions
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'shesocial.tw',
    audience: 'shesocial-users'
  })
}

// Verify JWT token and extract user info
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'shesocial.tw',
      audience: 'shesocial-users'
    })
    return decoded as JwtPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Middleware to authenticate requests
export const authenticateToken = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: '需要認證令牌',
        message: 'Access token required',
        timestamp: Date.now()
      })
      return
    }

    const decoded = verifyToken(token)
    
    // Add user info to request object
    req.userId = (decoded as any).userId
    req.user = {
      _id: (decoded as any).userId,
      email: (decoded as any).email,
      membership: {
        type: (decoded as any).membershipType,
        permissions: (decoded as any).permissions
      }
    } as UserProfile

    next()
  } catch (error) {
    res.status(403).json({
      success: false,
      error: '無效的認證令牌',
      message: 'Invalid or expired token',
      timestamp: Date.now()
    })
  }
}

// Middleware to check specific membership levels
export const requireMembership = (...allowedTypes: UserProfile['membership']['type'][]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '需要登入',
        message: 'Authentication required',
        timestamp: Date.now()
      })
      return
    }

    const userMembershipType = req.user.membership.type
    
    if (!allowedTypes.includes(userMembershipType)) {
      res.status(403).json({
        success: false,
        error: '會員權限不足',
        message: `Required membership: ${allowedTypes.join(' or ')}, current: ${userMembershipType}`,
        timestamp: Date.now()
      })
      return
    }

    next()
  }
}

// Middleware to check specific permissions
export const requirePermission = (permission: keyof UserProfile['membership']['permissions']) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '需要登入',
        message: 'Authentication required',
        timestamp: Date.now()
      })
      return
    }

    const hasPermission = req.user.membership.permissions[permission]
    
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: '權限不足',
        message: `Permission '${permission}' required`,
        timestamp: Date.now()
      })
      return
    }

    next()
  }
}

// Middleware for premium member features
export const requirePremium = requireMembership('premium_1300', 'premium_2500')

// Middleware for VIP and premium features
export const requireVipOrPremium = requireMembership('vip', 'premium_1300', 'premium_2500')

// Middleware to check if user can view participants
export const requireParticipantViewPermission = requirePermission('viewParticipants')

// Middleware to check if user has priority booking
export const requirePriorityBooking = requirePermission('priorityBooking')

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = verifyToken(token)
      req.userId = (decoded as any).userId
      req.user = {
        _id: (decoded as any).userId,
        email: (decoded as any).email,
        membership: {
          type: (decoded as any).membershipType,
          permissions: (decoded as any).permissions
        }
      } as UserProfile
    }

    next()
  } catch (error) {
    // Continue without authentication if token is invalid
    next()
  }
}

// Refresh token functionality
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'shesocial.tw',
    audience: 'shesocial-refresh'
  })
}

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'shesocial.tw',
      audience: 'shesocial-refresh'
    })
    return decoded as JwtPayload
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: '登入嘗試次數過多，請稍後再試',
    message: 'Too many authentication attempts, please try again later',
    timestamp: Date.now()
  }
}

export default {
  generateToken,
  verifyToken,
  authenticateToken,
  requireMembership,
  requirePermission,
  requirePremium,
  requireVipOrPremium,
  requireParticipantViewPermission,
  requirePriorityBooking,
  optionalAuth,
  generateRefreshToken,
  verifyRefreshToken,
  authRateLimit
}