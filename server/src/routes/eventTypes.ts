// Event Types API Routes
// API endpoints for managing event categories/types lookup table

import express, { Request, Response } from 'express'
import { EventTypeModel } from '../models/EventType'
import NeDBSetup from '../db/nedb-setup'

const router = express.Router()

// Get all active event types (public endpoint for dropdown)
router.get('/', async (req: Request, res: Response) => {
  try {
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    const result = await eventTypeModel.findAllActive()

    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    res.json({
      success: true,
      data: result.data || []
    })
  } catch (error) {
    console.error('Failed to fetch event types:', error)
    res.status(500).json({ error: 'Failed to fetch event types' })
  }
})

// Get specific event type by typeId
router.get('/:typeId', async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    const result = await eventTypeModel.findByTypeId(typeId)

    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    if (!result.data) {
      return res.status(404).json({ error: 'Event type not found' })
    }

    res.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Failed to fetch event type:', error)
    res.status(500).json({ error: 'Failed to fetch event type' })
  }
})

// Admin endpoints (protected by admin authentication)

// Get all event types (including inactive - for admin management)
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    const result = await eventTypeModel.findAll()

    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    res.json({
      success: true,
      data: result.data || []
    })
  } catch (error) {
    console.error('Failed to fetch all event types:', error)
    res.status(500).json({ error: 'Failed to fetch all event types' })
  }
})

// Create new event type (admin only)
router.post('/admin', async (req: Request, res: Response) => {
  try {
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    const {
      typeId,
      name,
      displayName,
      description,
      color,
      icon,
      sortOrder,
      metadata
    } = req.body

    // Validation
    if (!typeId || !name || !displayName) {
      return res.status(400).json({ error: 'typeId, name, and displayName are required' })
    }

    const eventTypeData = {
      typeId,
      name,
      displayName,
      description,
      color,
      icon,
      isActive: true,
      sortOrder: sortOrder || 999,
      metadata,
      createdBy: 'admin' // In real implementation, get from JWT token
    }

    const result = await eventTypeModel.create(eventTypeData)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.status(201).json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Failed to create event type:', error)
    res.status(500).json({ error: 'Failed to create event type' })
  }
})

// Update event type (admin only)
router.put('/admin/:typeId', async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    const updates = {
      ...req.body,
      lastModifiedBy: 'admin' // In real implementation, get from JWT token
    }

    // Remove fields that shouldn't be updated directly
    delete updates.typeId
    delete updates.createdAt
    delete updates.createdBy

    const result = await eventTypeModel.update(typeId, updates)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Failed to update event type:', error)
    res.status(500).json({ error: 'Failed to update event type' })
  }
})

// Delete event type (soft delete - admin only)
router.delete('/admin/:typeId', async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    const result = await eventTypeModel.delete(typeId)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({
      success: true,
      message: 'Event type deactivated successfully'
    })
  } catch (error) {
    console.error('Failed to delete event type:', error)
    res.status(500).json({ error: 'Failed to delete event type' })
  }
})

// Reorder event types (admin only)
router.put('/admin/reorder', async (req: Request, res: Response) => {
  try {
    const { typeOrders } = req.body

    if (!Array.isArray(typeOrders)) {
      return res.status(400).json({ error: 'typeOrders must be an array' })
    }

    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    const result = await eventTypeModel.reorder(typeOrders)

    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }

    res.json({
      success: true,
      message: 'Event types reordered successfully'
    })
  } catch (error) {
    console.error('Failed to reorder event types:', error)
    res.status(500).json({ error: 'Failed to reorder event types' })
  }
})

// Initialize default event types (setup endpoint)
router.post('/admin/initialize', async (req: Request, res: Response) => {
  try {
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    const result = await eventTypeModel.initializeDefaultTypes()

    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    res.json({
      success: true,
      message: 'Default event types initialized successfully'
    })
  } catch (error) {
    console.error('Failed to initialize event types:', error)
    res.status(500).json({ error: 'Failed to initialize event types' })
  }
})

// Get event type suggestions based on keywords
router.get('/suggestions/:keyword', async (req: Request, res: Response) => {
  try {
    const { keyword } = req.params
    const databases = NeDBSetup.getInstance().getDatabases()
    const eventTypeModel = new EventTypeModel(databases.event_types)

    // Get all active event types and filter by keyword
    const result = await eventTypeModel.findAllActive()

    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    const filtered = (result.data || []).filter(eventType => 
      eventType.name.includes(keyword) || 
      eventType.displayName.includes(keyword) ||
      (eventType.description && eventType.description.includes(keyword))
    )

    res.json({
      success: true,
      data: filtered
    })
  } catch (error) {
    console.error('Failed to get event type suggestions:', error)
    res.status(500).json({ error: 'Failed to get event type suggestions' })
  }
})

export default router