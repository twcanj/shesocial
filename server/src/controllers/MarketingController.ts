// Marketing CTA System Controller
// Enterprise-grade marketing campaign management for luxury social platform

import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth'
import { v4 as uuidv4 } from 'uuid'
import NeDBSetup from '../db/nedb-setup'
import { MarketingCampaign, MarketingTemplate, MarketingAudience, MarketingAnalytics, MarketingEvent } from '../models/Marketing'
import { UserProfile } from '../types/database'

export class MarketingController {
  private db = NeDBSetup.getInstance().getDatabases()

  // ==================== CAMPAIGNS ====================

  async getCampaigns(req: Request, res: Response) {
    try {
      const { status, type, createdBy, limit = 50, offset = 0 } = req.query
      
      // Build query
      const query: any = {}
      if (status) query.status = status
      if (type) query.type = type
      if (createdBy) query.createdBy = createdBy

      const campaigns = await new Promise<MarketingCampaign[]>((resolve, reject) => {
        this.db.marketing_campaigns
          .find(query)
          .sort({ createdAt: -1 })
          .skip(Number(offset))
          .limit(Number(limit))
          .exec((err, docs) => {
            if (err) reject(err)
            else resolve(docs)
          })
      })

      const total = await new Promise<number>((resolve, reject) => {
        this.db.marketing_campaigns.count(query, (err, count) => {
          if (err) reject(err)
          else resolve(count)
        })
      })

      res.json({
        success: true,
        data: campaigns,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total
        }
      })
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch campaigns'
      })
    }
  }

  async createCampaign(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description, type, targeting, content, schedule, abTesting } = req.body
      const adminId = req.userId || 'system'

      // Validate required fields
      if (!name || !type || !targeting || !content || !schedule) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, type, targeting, content, schedule'
        })
      }

      const campaign: MarketingCampaign = {
        campaignId: uuidv4(),
        name,
        description: description || '',
        type,
        status: 'draft',
        targeting,
        content,
        schedule,
        abTesting,
        analytics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          costPerClick: 0,
          costPerConversion: 0,
          clickThroughRate: 0,
          conversionRate: 0,
          lastUpdated: new Date()
        },
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const created = await new Promise<MarketingCampaign>((resolve, reject) => {
        this.db.marketing_campaigns.insert(campaign, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })

      res.json({
        success: true,
        data: created
      })
    } catch (error) {
      console.error('Error creating campaign:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create campaign'
      })
    }
  }

  async updateCampaign(req: AuthenticatedRequest, res: Response) {
    try {
      const { campaignId } = req.params
      const updates = req.body
      const adminId = req.userId || 'system'

      // Remove read-only fields
      delete updates.campaignId
      delete updates.createdBy
      delete updates.createdAt
      delete updates.analytics

      updates.updatedAt = new Date()

      const updated = await new Promise<MarketingCampaign>((resolve, reject) => {
        this.db.marketing_campaigns.update(
          { campaignId },
          { $set: updates },
          { returnUpdatedDocs: true },
          (err, numReplaced, doc) => {
            if (err) reject(err)
            else if (numReplaced === 0) reject(new Error('Campaign not found'))
            else resolve(doc)
          }
        )
      })

      res.json({
        success: true,
        data: updated
      })
    } catch (error) {
      console.error('Error updating campaign:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update campaign'
      })
    }
  }

  async deleteCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params

      const deleted = await new Promise<number>((resolve, reject) => {
        this.db.marketing_campaigns.remove({ campaignId }, (err, numRemoved) => {
          if (err) reject(err)
          else resolve(numRemoved)
        })
      })

      if (deleted === 0) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        })
      }

      res.json({
        success: true,
        message: 'Campaign deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting campaign:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete campaign'
      })
    }
  }

  // ==================== TEMPLATES ====================

  async getTemplates(req: Request, res: Response) {
    try {
      const { category, type, isActive, limit = 50, offset = 0 } = req.query
      
      const query: any = {}
      if (category) query.category = category
      if (type) query.type = type
      if (isActive !== undefined) query['settings.isActive'] = isActive === 'true'

      const templates = await new Promise<MarketingTemplate[]>((resolve, reject) => {
        this.db.marketing_templates
          .find(query)
          .sort({ createdAt: -1 })
          .skip(Number(offset))
          .limit(Number(limit))
          .exec((err, docs) => {
            if (err) reject(err)
            else resolve(docs)
          })
      })

      const total = await new Promise<number>((resolve, reject) => {
        this.db.marketing_templates.count(query, (err, count) => {
          if (err) reject(err)
          else resolve(count)
        })
      })

      res.json({
        success: true,
        data: templates,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total
        }
      })
    } catch (error) {
      console.error('Error fetching templates:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates'
      })
    }
  }

  async createTemplate(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description, category, type, content, variables } = req.body
      const adminId = req.userId || 'system'

      if (!name || !category || !type || !content) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, category, type, content'
        })
      }

      const template: MarketingTemplate = {
        templateId: uuidv4(),
        name,
        description: description || '',
        category,
        type,
        content,
        variables: variables || [],
        settings: {
          isActive: true,
          isSystem: false,
          usage: {
            totalCampaigns: 0
          }
        },
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const created = await new Promise<MarketingTemplate>((resolve, reject) => {
        this.db.marketing_templates.insert(template, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })

      res.json({
        success: true,
        data: created
      })
    } catch (error) {
      console.error('Error creating template:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create template'
      })
    }
  }

  // ==================== AUDIENCES ====================

  async getAudiences(req: Request, res: Response) {
    try {
      const { type, limit = 50, offset = 0 } = req.query
      
      const query: any = {}
      if (type) query.type = type

      const audiences = await new Promise<MarketingAudience[]>((resolve, reject) => {
        this.db.marketing_audiences
          .find(query)
          .sort({ createdAt: -1 })
          .skip(Number(offset))
          .limit(Number(limit))
          .exec((err, docs) => {
            if (err) reject(err)
            else resolve(docs)
          })
      })

      const total = await new Promise<number>((resolve, reject) => {
        this.db.marketing_audiences.count(query, (err, count) => {
          if (err) reject(err)
          else resolve(count)
        })
      })

      res.json({
        success: true,
        data: audiences,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total
        }
      })
    } catch (error) {
      console.error('Error fetching audiences:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audiences'
      })
    }
  }

  async createAudience(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description, type, criteria, members } = req.body
      const adminId = req.userId || 'system'

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, type'
        })
      }

      // Calculate initial stats
      let totalMembers = 0
      let membershipBreakdown = { visitor: 0, registered: 0, vip: 0, vvip: 0 }

      if (type === 'static' && members) {
        totalMembers = members.length
        members.forEach((member: any) => {
          membershipBreakdown[member.membershipType]++
        })
      } else if (type === 'dynamic' && criteria) {
        // For dynamic audiences, calculate based on criteria
        totalMembers = await this.calculateDynamicAudienceSize(criteria)
        membershipBreakdown = await this.calculateDynamicAudienceBreakdown(criteria)
      }

      const audience: MarketingAudience = {
        audienceId: uuidv4(),
        name,
        description: description || '',
        type,
        criteria,
        members,
        stats: {
          totalMembers,
          activeMembers: totalMembers, // Initially all are active
          lastCalculated: new Date(),
          membershipBreakdown
        },
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const created = await new Promise<MarketingAudience>((resolve, reject) => {
        this.db.marketing_audiences.insert(audience, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })

      res.json({
        success: true,
        data: created
      })
    } catch (error) {
      console.error('Error creating audience:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create audience'
      })
    }
  }

  // ==================== ANALYTICS ====================

  async getCampaignAnalytics(req: Request, res: Response) {
    try {
      const { campaignId } = req.params
      const { from, to } = req.query

      const dateRange = {
        from: from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: to ? new Date(to as string) : new Date()
      }

      // Get existing analytics or create new
      let analytics = await new Promise<MarketingAnalytics | null>((resolve, reject) => {
        this.db.marketing_analytics.findOne({ campaignId }, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })

      if (!analytics) {
        // Create new analytics record
        analytics = await this.createCampaignAnalytics(campaignId, dateRange)
      } else {
        // Update existing analytics
        analytics = await this.updateCampaignAnalytics(campaignId, dateRange)
      }

      res.json({
        success: true,
        data: analytics
      })
    } catch (error) {
      console.error('Error fetching campaign analytics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch campaign analytics'
      })
    }
  }

  // ==================== EVENTS ====================

  async trackEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const { campaignId, eventType, eventData, userContext } = req.body
      const userId = req.userId
      const sessionId = (req as any).sessionID || 'unknown'

      if (!campaignId || !eventType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: campaignId, eventType'
        })
      }

      const event: MarketingEvent = {
        eventId: uuidv4(),
        campaignId,
        userId,
        sessionId,
        eventType,
        eventData: eventData || {},
        userContext,
        timestamp: new Date(),
        createdAt: new Date()
      }

      const created = await new Promise<MarketingEvent>((resolve, reject) => {
        this.db.marketing_events.insert(event, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })

      // Update campaign analytics asynchronously
      this.updateCampaignMetrics(campaignId, eventType, eventData?.conversionValue || 0)

      res.json({
        success: true,
        data: created
      })
    } catch (error) {
      console.error('Error tracking event:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to track event'
      })
    }
  }

  async triggerEventCampaign(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const { campaignType, userFilters } = req.body

      // Get event details
      const event = await new Promise<any>((resolve, reject) => {
        this.db.events.findOne({ _id: eventId }, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        })
      }

      // Find relevant campaigns
      const campaigns = await new Promise<MarketingCampaign[]>((resolve, reject) => {
        this.db.marketing_campaigns.find({
          status: 'active',
          type: campaignType || 'cta',
          'schedule.startDate': { $lte: new Date() },
          $or: [
            { 'schedule.endDate': { $gte: new Date() } },
            { 'schedule.endDate': { $exists: false } }
          ]
        }, (err, docs) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })

      // Trigger campaigns for eligible users
      const results = []
      for (const campaign of campaigns) {
        const eligibleUsers = await this.findEligibleUsers(campaign.targeting, userFilters)
        
        for (const user of eligibleUsers) {
          // Create impression event
          await this.trackCampaignImpression(campaign.campaignId, user.userId, event.eventId)
        }

        results.push({
          campaignId: campaign.campaignId,
          campaignName: campaign.name,
          eligibleUsers: eligibleUsers.length
        })
      }

      res.json({
        success: true,
        data: {
          eventId,
          eventName: event.name,
          triggeredCampaigns: results,
          totalImpressions: results.reduce((sum, r) => sum + r.eligibleUsers, 0)
        }
      })
    } catch (error) {
      console.error('Error triggering event campaign:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to trigger event campaign'
      })
    }
  }

  // ==================== HELPER METHODS ====================

  private async calculateDynamicAudienceSize(criteria: any): Promise<number> {
    const query: any = {}
    
    if (criteria.membershipTypes) {
      query['membership.type'] = { $in: criteria.membershipTypes }
    }
    
    if (criteria.demographics) {
      if (criteria.demographics.ageMin || criteria.demographics.ageMax) {
        query['profile.age'] = {}
        if (criteria.demographics.ageMin) query['profile.age'].$gte = criteria.demographics.ageMin
        if (criteria.demographics.ageMax) query['profile.age'].$lte = criteria.demographics.ageMax
      }
      
      if (criteria.demographics.location) {
        query['profile.location'] = { $in: criteria.demographics.location }
      }
    }

    return new Promise<number>((resolve, reject) => {
      this.db.users.count(query, (err, count) => {
        if (err) reject(err)
        else resolve(count)
      })
    })
  }

  private async calculateDynamicAudienceBreakdown(criteria: any): Promise<any> {
    const breakdown = { visitor: 0, registered: 0, vip: 0, vvip: 0 }
    
    for (const membershipType of ['visitor', 'registered', 'vip', 'vvip']) {
      const query: any = { 'membership.type': membershipType }
      
      if (criteria.demographics) {
        if (criteria.demographics.ageMin || criteria.demographics.ageMax) {
          query['profile.age'] = {}
          if (criteria.demographics.ageMin) query['profile.age'].$gte = criteria.demographics.ageMin
          if (criteria.demographics.ageMax) query['profile.age'].$lte = criteria.demographics.ageMax
        }
        
        if (criteria.demographics.location) {
          query['profile.location'] = { $in: criteria.demographics.location }
        }
      }

      const count = await new Promise<number>((resolve, reject) => {
        this.db.users.count(query, (err, count) => {
          if (err) reject(err)
          else resolve(count)
        })
      })

      breakdown[membershipType] = count
    }

    return breakdown
  }

  private async createCampaignAnalytics(campaignId: string, dateRange: any): Promise<MarketingAnalytics> {
    const analytics: MarketingAnalytics = {
      analyticsId: uuidv4(),
      campaignId,
      dateRange,
      metrics: {
        impressions: 0,
        uniqueImpressions: 0,
        clicks: 0,
        uniqueClicks: 0,
        conversions: 0,
        uniqueConversions: 0,
        revenue: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        costPerClick: 0,
        costPerConversion: 0,
        returnOnAdSpend: 0
      },
      demographics: {
        membershipType: {
          visitor: { impressions: 0, clicks: 0, conversions: 0 },
          registered: { impressions: 0, clicks: 0, conversions: 0 },
          vip: { impressions: 0, clicks: 0, conversions: 0 },
          vvip: { impressions: 0, clicks: 0, conversions: 0 }
        },
        ageGroups: {},
        locations: {}
      },
      timeSeriesData: [],
      topPerforming: {
        recommendedOptimizations: []
      },
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return new Promise<MarketingAnalytics>((resolve, reject) => {
      this.db.marketing_analytics.insert(analytics, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  private async updateCampaignAnalytics(campaignId: string, dateRange: any): Promise<MarketingAnalytics> {
    // Calculate metrics from events
    const events = await new Promise<MarketingEvent[]>((resolve, reject) => {
      this.db.marketing_events.find({
        campaignId,
        timestamp: { $gte: dateRange.from, $lte: dateRange.to }
      }, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    const metrics = this.calculateMetricsFromEvents(events)

    const updated = await new Promise<MarketingAnalytics>((resolve, reject) => {
      this.db.marketing_analytics.update(
        { campaignId },
        {
          $set: {
            dateRange,
            metrics,
            generatedAt: new Date(),
            updatedAt: new Date()
          }
        },
        { returnUpdatedDocs: true },
        (err, numReplaced, doc) => {
          if (err) reject(err)
          else resolve(doc)
        }
      )
    })

    return updated
  }

  private calculateMetricsFromEvents(events: MarketingEvent[]): any {
    const impressions = events.filter(e => e.eventType === 'impression').length
    const clicks = events.filter(e => e.eventType === 'click').length
    const conversions = events.filter(e => e.eventType === 'conversion').length
    
    const uniqueImpressions = new Set(events.filter(e => e.eventType === 'impression').map(e => e.userId)).size
    const uniqueClicks = new Set(events.filter(e => e.eventType === 'click').map(e => e.userId)).size
    const uniqueConversions = new Set(events.filter(e => e.eventType === 'conversion').map(e => e.userId)).size

    const revenue = events
      .filter(e => e.eventType === 'conversion')
      .reduce((sum, e) => sum + (e.eventData.conversionValue || 0), 0)

    return {
      impressions,
      uniqueImpressions,
      clicks,
      uniqueClicks,
      conversions,
      uniqueConversions,
      revenue,
      clickThroughRate: impressions > 0 ? clicks / impressions : 0,
      conversionRate: clicks > 0 ? conversions / clicks : 0,
      costPerClick: clicks > 0 ? revenue / clicks : 0,
      costPerConversion: conversions > 0 ? revenue / conversions : 0,
      returnOnAdSpend: revenue > 0 ? revenue / revenue : 0 // Simplified ROAS
    }
  }

  private async updateCampaignMetrics(campaignId: string, eventType: string, conversionValue: number): Promise<void> {
    const updateData: any = {}
    
    if (eventType === 'impression') {
      updateData.$inc = { 'analytics.impressions': 1 }
    } else if (eventType === 'click') {
      updateData.$inc = { 'analytics.clicks': 1 }
    } else if (eventType === 'conversion') {
      updateData.$inc = { 
        'analytics.conversions': 1,
        'analytics.revenue': conversionValue
      }
    }

    if (Object.keys(updateData).length > 0) {
      updateData.$set = { 
        'analytics.lastUpdated': new Date(),
        updatedAt: new Date()
      }

      this.db.marketing_campaigns.update({ campaignId }, updateData, {}, () => {
        // Update completed, recalculate rates
        this.recalculateCampaignRates(campaignId)
      })
    }
  }

  private async recalculateCampaignRates(campaignId: string): Promise<void> {
    const campaign = await new Promise<MarketingCampaign>((resolve, reject) => {
      this.db.marketing_campaigns.findOne({ campaignId }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (campaign) {
      const { impressions, clicks, conversions, revenue } = campaign.analytics
      
      const clickThroughRate = impressions > 0 ? clicks / impressions : 0
      const conversionRate = clicks > 0 ? conversions / clicks : 0
      const costPerClick = clicks > 0 ? revenue / clicks : 0
      const costPerConversion = conversions > 0 ? revenue / conversions : 0

      this.db.marketing_campaigns.update(
        { campaignId },
        {
          $set: {
            'analytics.clickThroughRate': clickThroughRate,
            'analytics.conversionRate': conversionRate,
            'analytics.costPerClick': costPerClick,
            'analytics.costPerConversion': costPerConversion,
            'analytics.lastUpdated': new Date(),
            updatedAt: new Date()
          }
        },
        {},
        () => {}
      )
    }
  }

  private async findEligibleUsers(targeting: any, userFilters?: any): Promise<any[]> {
    const query: any = {}
    
    if (targeting.membershipTypes) {
      query['membership.type'] = { $in: targeting.membershipTypes }
    }
    
    if (targeting.demographics) {
      if (targeting.demographics.ageMin || targeting.demographics.ageMax) {
        query['profile.age'] = {}
        if (targeting.demographics.ageMin) query['profile.age'].$gte = targeting.demographics.ageMin
        if (targeting.demographics.ageMax) query['profile.age'].$lte = targeting.demographics.ageMax
      }
      
      if (targeting.demographics.location) {
        query['profile.location'] = { $in: targeting.demographics.location }
      }
    }

    // Apply additional user filters
    if (userFilters) {
      Object.assign(query, userFilters)
    }

    return new Promise<any[]>((resolve, reject) => {
      this.db.users.find(query, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  private async trackCampaignImpression(campaignId: string, userId: string, eventId?: string): Promise<void> {
    const event: MarketingEvent = {
      eventId: uuidv4(),
      campaignId,
      userId,
      eventType: 'impression',
      eventData: {
        placement: 'event_trigger'
      },
      timestamp: new Date(),
      createdAt: new Date()
    }

    this.db.marketing_events.insert(event, () => {
      // Update campaign metrics
      this.updateCampaignMetrics(campaignId, 'impression', 0)
    })
  }
}