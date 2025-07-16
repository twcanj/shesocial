// User Controller - API endpoints for user operations
import { Request, Response } from 'express'
import { UserModel } from '../models/User'
import { UserSearchFilters } from '../types/database'

export class UserController {
  private userModel: UserModel

  constructor(userModel: UserModel) {
    this.userModel = userModel
  }

  // GET /api/users
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.userModel.findAll(page, limit)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/users/:id
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const result = await this.userModel.findById(id)

      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/users/email/:email
  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params
      const result = await this.userModel.findByEmail(email)

      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // POST /api/users
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body

      // Basic validation
      if (!userData.email || !userData.profile?.name) {
        res.status(400).json({
          success: false,
          error: 'Email and name are required',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.userModel.create(userData)

      if (result.success) {
        res.status(201).json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/users/:id
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData = req.body

      const result = await this.userModel.update(id, updateData)

      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // DELETE /api/users/:id
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const result = await this.userModel.delete(id)

      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // POST /api/users/search
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const filters: UserSearchFilters = req.body
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.userModel.search(filters, page, limit)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // PUT /api/users/:id/membership
  async updateMembership(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const membershipData = req.body

      const result = await this.userModel.updateMembership(id, membershipData)

      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/users/count
  async getUserCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userModel.count()

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }

  // GET /api/users/sync/:timestamp
  async getModifiedUsers(req: Request, res: Response): Promise<void> {
    try {
      const timestamp = parseInt(req.params.timestamp)

      if (isNaN(timestamp)) {
        res.status(400).json({
          success: false,
          error: 'Invalid timestamp',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.userModel.getModifiedSince(timestamp)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      })
    }
  }
}
