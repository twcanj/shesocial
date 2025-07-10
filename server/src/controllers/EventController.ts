// Event Controller - API endpoints for event operations
import { Request, Response } from 'express'
import { EventModel } from '../models/Event'
import { EventFilters } from '../types/database'

export class EventController {
  private eventModel: EventModel

  constructor(eventModel: EventModel) {
    this.eventModel = eventModel
  }

  // GET /api/events
  async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.eventModel.findAll(page, limit)
      
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

  // GET /api/events/:id
  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const result = await this.eventModel.findById(id)
      
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

  // POST /api/events
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData = req.body
      
      // Basic validation
      if (!eventData.name || !eventData.metadata?.date) {
        res.status(400).json({
          success: false,
          error: 'Event name and date are required',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.eventModel.create(eventData)
      
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

  // PUT /api/events/:id
  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData = req.body

      const result = await this.eventModel.update(id, updateData)
      
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

  // DELETE /api/events/:id
  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const result = await this.eventModel.delete(id)
      
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

  // POST /api/events/search
  async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const filters: EventFilters = req.body
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.eventModel.search(filters, page, limit)
      
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

  // GET /api/events/upcoming
  async getUpcomingEvents(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.eventModel.getUpcoming(page, limit)
      
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

  // POST /api/events/:id/participants
  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { userId } = req.body

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.eventModel.addParticipant(id, userId)
      
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

  // DELETE /api/events/:id/participants/:userId
  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params

      const result = await this.eventModel.removeParticipant(id, userId)
      
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

  // GET /api/events/user/:userId
  async getEventsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      const result = await this.eventModel.getByUser(userId)
      
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

  // PUT /api/events/:id/status
  async updateEventStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
          timestamp: Date.now()
        })
        return
      }

      const result = await this.eventModel.updateStatus(id, status)
      
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

  // PUT /api/events/:id/publish
  async publishEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.eventModel.publish(id)
      
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

  // PUT /api/events/:id/cancel
  async cancelEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.eventModel.cancel(id)
      
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

  // GET /api/events/count
  async getEventCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.eventModel.count()
      
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

  // GET /api/events/sync/:timestamp
  async getModifiedEvents(req: Request, res: Response): Promise<void> {
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

      const result = await this.eventModel.getModifiedSince(timestamp)
      
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