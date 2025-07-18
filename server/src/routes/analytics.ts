// CTA Analytics API Routes
// Real-time analytics and tracking endpoints for marketing campaigns

import express from 'express'
import CTAAnalyticsService from '../services/CTAAnalyticsService'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth'
import { requireMarketingPermission, logAdminAction } from '../middleware/adminAuth'

const router = express.Router()
const analyticsService = new CTAAnalyticsService()

// ==================== PUBLIC TRACKING ENDPOINTS ====================

// Track CTA impression (public endpoint for frontend)
router.post('/track/impression', async (req, res) => {
  try {
    const { campaignId, userId, context } = req.body
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      })
    }

    await analyticsService.trackImpression(campaignId, userId, context)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error tracking impression:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to track impression'
    })
  }
})

// Track CTA click (public endpoint for frontend)
router.post('/track/click', async (req, res) => {
  try {
    const { campaignId, userId, context } = req.body
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      })
    }

    await analyticsService.trackClick(campaignId, userId, context)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to track click'
    })
  }
})

// Track CTA conversion (public endpoint for frontend)
router.post('/track/conversion', async (req, res) => {
  try {
    const { campaignId, userId, context } = req.body
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      })
    }

    await analyticsService.trackConversion(campaignId, userId, context)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error tracking conversion:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to track conversion'
    })
  }
})

// Track CTA dismissal (public endpoint for frontend)
router.post('/track/dismiss', async (req, res) => {
  try {
    const { campaignId, userId, context } = req.body
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      })
    }

    await analyticsService.trackDismiss(campaignId, userId, context)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error tracking dismiss:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to track dismiss'
    })
  }
})

// ==================== AUTHENTICATED ANALYTICS ENDPOINTS ====================

// All analytics viewing requires authentication
router.use(authenticateToken)

// Get user's own interaction analytics (for authenticated users)
router.get('/user/interactions', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      })
    }

    // Get user's interaction history
    const db = require('../db/nedb-setup').default.getInstance().getDatabases()
    const userEvents = await new Promise<any[]>((resolve, reject) => {
      db.marketing_events.find({ userId }, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    const interactions = userEvents.map(event => ({
      eventType: event.eventType,
      campaignId: event.campaignId,
      timestamp: event.timestamp,
      ctaText: event.eventData.ctaText,
      ctaAction: event.eventData.ctaAction,
      placement: event.eventData.placement
    }))

    res.json({
      success: true,
      data: {
        totalInteractions: interactions.length,
        interactions: interactions.slice(0, 50) // Last 50 interactions
      }
    })
  } catch (error) {
    console.error('Error getting user interactions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user interactions'
    })
  }
})

// ==================== ADMIN ANALYTICS ENDPOINTS ====================

// All admin analytics require marketing permissions
router.use(requireMarketingPermission('read'))

// Get campaign metrics
router.get('/campaigns/:campaignId/metrics', async (req, res) => {
  try {
    const { campaignId } = req.params
    const { from, to } = req.query
    
    const dateRange = from && to ? {
      from: new Date(from as string),
      to: new Date(to as string)
    } : undefined

    const metrics = await analyticsService.getCampaignMetrics(campaignId, dateRange)
    
    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Campaign metrics not found'
      })
    }

    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Error getting campaign metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get campaign metrics'
    })
  }
})

// Get real-time campaign analytics
router.get('/campaigns/:campaignId/realtime', async (req, res) => {
  try {
    const { campaignId } = req.params
    
    const analytics = await analyticsService.getRealTimeAnalytics(campaignId)
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Real-time analytics not found'
      })
    }

    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error getting real-time analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get real-time analytics'
    })
  }
})

// Get A/B test results
router.get('/campaigns/:campaignId/ab-test', async (req, res) => {
  try {
    const { campaignId } = req.params
    
    const results = await analyticsService.getABTestResults(campaignId)
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'A/B test results not found'
      })
    }

    res.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Error getting A/B test results:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get A/B test results'
    })
  }
})

// Get demographic breakdown
router.get('/campaigns/:campaignId/demographics', async (req, res) => {
  try {
    const { campaignId } = req.params
    
    const demographics = await analyticsService.getDemographicBreakdown(campaignId)
    
    if (!demographics) {
      return res.status(404).json({
        success: false,
        error: 'Demographic breakdown not found'
      })
    }

    res.json({
      success: true,
      data: demographics
    })
  } catch (error) {
    console.error('Error getting demographic breakdown:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get demographic breakdown'
    })
  }
})

// Get overall marketing analytics dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const { from, to } = req.query
    const dateRange = {
      from: from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: to ? new Date(to as string) : new Date()
    }

    const db = require('../db/nedb-setup').default.getInstance().getDatabases()

    // Get all active campaigns
    const campaigns = await new Promise<any[]>((resolve, reject) => {
      db.marketing_campaigns.find({ status: 'active' }, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    // Get events in date range
    const events = await new Promise<any[]>((resolve, reject) => {
      db.marketing_events.find({
        timestamp: { $gte: dateRange.from, $lte: dateRange.to }
      }, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    // Calculate overall metrics
    const totalImpressions = events.filter(e => e.eventType === 'impression').length
    const totalClicks = events.filter(e => e.eventType === 'click').length
    const totalConversions = events.filter(e => e.eventType === 'conversion').length
    const totalRevenue = events
      .filter(e => e.eventType === 'conversion')
      .reduce((sum, e) => sum + (e.eventData.conversionValue || 0), 0)

    const overallCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0
    const overallCR = totalClicks > 0 ? totalConversions / totalClicks : 0

    // Top performing campaigns
    const campaignMetrics = await Promise.all(
      campaigns.map(async campaign => {
        const metrics = await analyticsService.getCampaignMetrics(campaign.campaignId, dateRange)
        return {
          campaignId: campaign.campaignId,
          name: campaign.name,
          status: campaign.status,
          type: campaign.type,
          ...metrics
        }
      })
    )

    const topCampaigns = campaignMetrics
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 10)

    // Daily breakdown
    const dailyBreakdown = {}
    events.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0]
      
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = { impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }

      const data = dailyBreakdown[date]
      
      if (event.eventType === 'impression') data.impressions++
      else if (event.eventType === 'click') data.clicks++
      else if (event.eventType === 'conversion') {
        data.conversions++
        data.revenue += event.eventData.conversionValue || 0
      }
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          totalImpressions,
          totalClicks,
          totalConversions,
          totalRevenue,
          overallCTR,
          overallCR,
          avgRevenuePerConversion: totalConversions > 0 ? totalRevenue / totalConversions : 0
        },
        topCampaigns,
        dailyBreakdown,
        dateRange
      }
    })
  } catch (error) {
    console.error('Error getting analytics dashboard:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics dashboard'
    })
  }
})

// Export analytics data
router.get('/export', requireMarketingPermission('read'), logAdminAction('export_analytics'), async (req, res) => {
  try {
    const { campaignId, format = 'json', from, to } = req.query
    
    const dateRange = {
      from: from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: to ? new Date(to as string) : new Date()
    }

    const db = require('../db/nedb-setup').default.getInstance().getDatabases()
    
    let query: any = {
      timestamp: { $gte: dateRange.from, $lte: dateRange.to }
    }
    
    if (campaignId) {
      query.campaignId = campaignId
    }

    const events = await new Promise<any[]>((resolve, reject) => {
      db.marketing_events.find(query, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'eventId,campaignId,userId,eventType,timestamp,ctaText,ctaAction,conversionValue,deviceType,placement'
      const csvRows = events.map(event => [
        event.eventId,
        event.campaignId,
        event.userId || '',
        event.eventType,
        event.timestamp.toISOString(),
        event.eventData.ctaText || '',
        event.eventData.ctaAction || '',
        event.eventData.conversionValue || 0,
        event.eventData.deviceType || '',
        event.eventData.placement || ''
      ].join(','))

      const csvContent = [csvHeaders, ...csvRows].join('\n')
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.csv"`)
      res.send(csvContent)
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: {
          events,
          totalEvents: events.length,
          dateRange,
          exportedAt: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error exporting analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics'
    })
  }
})

export default router