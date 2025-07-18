// Marketing CTA System API Routes
// Enterprise-grade marketing campaign management routes

import express from 'express'
import { MarketingController } from '../controllers/MarketingController'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth'
import { requireAdminPermission, requireMarketingPermission, logAdminAction } from '../middleware/adminAuth'
import CTAContentService from '../services/CTAContentService'

const router = express.Router()
const marketingController = new MarketingController()
const contentService = new CTAContentService()

// ==================== PUBLIC ROUTES ====================

// Track marketing events (public endpoint for frontend tracking)
router.post('/events/track', marketingController.trackEvent.bind(marketingController))

// Get personalized CTA content (public endpoint for frontend)
router.get('/cta/personalized', async (req, res) => {
  try {
    const { userId, membershipType = 'visitor', pageRoute = '/', sessionId } = req.query
    
    const content = await contentService.getPersonalizedCTA(
      userId as string || null,
      membershipType as string,
      pageRoute as string,
      { sessionId }
    )
    
    if (!content) {
      return res.json({
        success: true,
        data: null,
        message: 'No CTA content available'
      })
    }

    res.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('Error getting personalized CTA:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get personalized CTA'
    })
  }
})

// Get CTA content for specific placement (public endpoint)
router.get('/cta/placement/:placement', async (req, res) => {
  try {
    const { placement } = req.params
    const { userId, membershipType = 'visitor', sessionId } = req.query
    
    const content = await contentService.getPlacementCTA(
      placement,
      userId as string || null,
      membershipType as string,
      { sessionId }
    )
    
    if (!content) {
      return res.json({
        success: true,
        data: null,
        message: 'No CTA content available for placement'
      })
    }

    res.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('Error getting placement CTA:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get placement CTA'
    })
  }
})

// Check if user should see CTA (public endpoint for frequency control)
router.get('/cta/should-show', async (req, res) => {
  try {
    const { campaignId, userId, sessionId } = req.query
    
    if (!campaignId || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID and session ID are required'
      })
    }

    const shouldShow = await contentService.shouldShowCTA(
      campaignId as string,
      userId as string || null,
      sessionId as string
    )
    
    res.json({
      success: true,
      data: { shouldShow }
    })
  } catch (error) {
    console.error('Error checking if should show CTA:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check CTA frequency'
    })
  }
})

// Get A/B test variants (public endpoint)
router.get('/cta/ab-test/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params
    const { userId, membershipType = 'visitor', pageRoute = '/', sessionId } = req.query
    
    const variants = await contentService.getABTestVariants(
      campaignId,
      userId as string || null,
      membershipType as string,
      pageRoute as string,
      { sessionId }
    )
    
    res.json({
      success: true,
      data: variants
    })
  } catch (error) {
    console.error('Error getting A/B test variants:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get A/B test variants'
    })
  }
})

// ==================== AUTHENTICATED ROUTES ====================

// Campaign management (requires authentication)
router.use(authenticateToken)

// Get active campaigns for current user (based on membership type)
router.get('/campaigns/active', async (req: AuthenticatedRequest, res) => {
  try {
    const userMembership = req.user?.membership?.type || 'visitor'
    
    // Get campaigns targeting this user's membership type
    const campaigns = await marketingController.getCampaigns({
      ...req,
      query: {
        status: 'active',
        'targeting.membershipTypes': userMembership
      }
    } as any, res)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active campaigns'
    })
  }
})

// ==================== ADMIN ROUTES ====================

// All marketing management routes require admin permissions
router.use(requireMarketingPermission('read'))

// ==================== CAMPAIGNS ====================

// Get all campaigns
router.get('/campaigns', marketingController.getCampaigns.bind(marketingController))

// Create new campaign
router.post('/campaigns', requireMarketingPermission('write'), logAdminAction('create_campaign'), marketingController.createCampaign.bind(marketingController))

// Get specific campaign
router.get('/campaigns/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params
    const campaign = await new Promise<any>((resolve, reject) => {
      const db = require('../db/nedb-setup').default.getInstance().getDatabases()
      db.marketing_campaigns.findOne({ campaignId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      })
    }

    res.json({
      success: true,
      data: campaign
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign'
    })
  }
})

// Update campaign
router.put('/campaigns/:campaignId', requireMarketingPermission('write'), logAdminAction('update_campaign'), marketingController.updateCampaign.bind(marketingController))

// Delete campaign
router.delete('/campaigns/:campaignId', requireMarketingPermission('delete'), logAdminAction('delete_campaign'), marketingController.deleteCampaign.bind(marketingController))

// ==================== TEMPLATES ====================

// Get all templates
router.get('/templates', marketingController.getTemplates.bind(marketingController))

// Create new template
router.post('/templates', requireMarketingPermission('write'), logAdminAction('create_template'), marketingController.createTemplate.bind(marketingController))

// Get specific template
router.get('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params
    const template = await new Promise<any>((resolve, reject) => {
      const db = require('../db/nedb-setup').default.getInstance().getDatabases()
      db.marketing_templates.findOne({ templateId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      })
    }

    res.json({
      success: true,
      data: template
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    })
  }
})

// Update template
router.put('/templates/:templateId', requireMarketingPermission('write'), logAdminAction('update_template'), async (req, res) => {
  try {
    const { templateId } = req.params
    const updates = req.body

    // Remove read-only fields
    delete updates.templateId
    delete updates.createdBy
    delete updates.createdAt
    delete updates.settings.usage

    updates.updatedAt = new Date()

    const db = require('../db/nedb-setup').default.getInstance().getDatabases()
    const updated = await new Promise<any>((resolve, reject) => {
      db.marketing_templates.update(
        { templateId },
        { $set: updates },
        { returnUpdatedDocs: true },
        (err: any, numReplaced: number, doc: any) => {
          if (err) reject(err)
          else if (numReplaced === 0) reject(new Error('Template not found'))
          else resolve(doc)
        }
      )
    })

    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update template'
    })
  }
})

// Delete template
router.delete('/templates/:templateId', requireMarketingPermission('delete'), logAdminAction('delete_template'), async (req, res) => {
  try {
    const { templateId } = req.params

    const db = require('../db/nedb-setup').default.getInstance().getDatabases()
    
    // Check if template is system template
    const template = await new Promise<any>((resolve, reject) => {
      db.marketing_templates.findOne({ templateId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      })
    }

    if (template.settings.isSystem) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete system template'
      })
    }

    const deleted = await new Promise<number>((resolve, reject) => {
      db.marketing_templates.remove({ templateId }, (err: any, numRemoved: number) => {
        if (err) reject(err)
        else resolve(numRemoved)
      })
    })

    res.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete template'
    })
  }
})

// ==================== AUDIENCES ====================

// Get all audiences
router.get('/audiences', marketingController.getAudiences.bind(marketingController))

// Create new audience
router.post('/audiences', requireMarketingPermission('write'), logAdminAction('create_audience'), marketingController.createAudience.bind(marketingController))

// Get specific audience
router.get('/audiences/:audienceId', async (req, res) => {
  try {
    const { audienceId } = req.params
    const audience = await new Promise<any>((resolve, reject) => {
      const db = require('../db/nedb-setup').default.getInstance().getDatabases()
      db.marketing_audiences.findOne({ audienceId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (!audience) {
      return res.status(404).json({
        success: false,
        error: 'Audience not found'
      })
    }

    res.json({
      success: true,
      data: audience
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audience'
    })
  }
})

// Update audience
router.put('/audiences/:audienceId', requireMarketingPermission('write'), logAdminAction('update_audience'), async (req, res) => {
  try {
    const { audienceId } = req.params
    const updates = req.body

    // Remove read-only fields
    delete updates.audienceId
    delete updates.createdBy
    delete updates.createdAt
    delete updates.stats

    updates.updatedAt = new Date()

    const db = require('../db/nedb-setup').default.getInstance().getDatabases()
    const updated = await new Promise<any>((resolve, reject) => {
      db.marketing_audiences.update(
        { audienceId },
        { $set: updates },
        { returnUpdatedDocs: true },
        (err: any, numReplaced: number, doc: any) => {
          if (err) reject(err)
          else if (numReplaced === 0) reject(new Error('Audience not found'))
          else resolve(doc)
        }
      )
    })

    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update audience'
    })
  }
})

// Delete audience
router.delete('/audiences/:audienceId', requireMarketingPermission('delete'), logAdminAction('delete_audience'), async (req, res) => {
  try {
    const { audienceId } = req.params

    const db = require('../db/nedb-setup').default.getInstance().getDatabases()
    const deleted = await new Promise<number>((resolve, reject) => {
      db.marketing_audiences.remove({ audienceId }, (err: any, numRemoved: number) => {
        if (err) reject(err)
        else resolve(numRemoved)
      })
    })

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: 'Audience not found'
      })
    }

    res.json({
      success: true,
      message: 'Audience deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete audience'
    })
  }
})

// Refresh audience statistics (for dynamic audiences)
router.post('/audiences/:audienceId/refresh', requireMarketingPermission('write'), logAdminAction('refresh_audience'), async (req, res) => {
  try {
    const { audienceId } = req.params
    const db = require('../db/nedb-setup').default.getInstance().getDatabases()

    const audience = await new Promise<any>((resolve, reject) => {
      db.marketing_audiences.findOne({ audienceId }, (err: any, doc: any) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })

    if (!audience) {
      return res.status(404).json({
        success: false,
        error: 'Audience not found'
      })
    }

    if (audience.type !== 'dynamic') {
      return res.status(400).json({
        success: false,
        error: 'Can only refresh dynamic audiences'
      })
    }

    // Recalculate audience stats
    const controller = new MarketingController()
    const totalMembers = await (controller as any).calculateDynamicAudienceSize(audience.criteria)
    const membershipBreakdown = await (controller as any).calculateDynamicAudienceBreakdown(audience.criteria)

    const updated = await new Promise<any>((resolve, reject) => {
      db.marketing_audiences.update(
        { audienceId },
        {
          $set: {
            'stats.totalMembers': totalMembers,
            'stats.activeMembers': totalMembers,
            'stats.membershipBreakdown': membershipBreakdown,
            'stats.lastCalculated': new Date(),
            updatedAt: new Date()
          }
        },
        { returnUpdatedDocs: true },
        (err: any, numReplaced: number, doc: any) => {
          if (err) reject(err)
          else resolve(doc)
        }
      )
    })

    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh audience'
    })
  }
})

// ==================== ANALYTICS ====================

// Get campaign analytics
router.get('/analytics/campaigns/:campaignId', marketingController.getCampaignAnalytics.bind(marketingController))

// Get overall marketing analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const { from, to } = req.query
    const dateRange = {
      from: from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: to ? new Date(to as string) : new Date()
    }

    const db = require('../db/nedb-setup').default.getInstance().getDatabases()

    // Get all campaigns
    const campaigns = await new Promise<any[]>((resolve, reject) => {
      db.marketing_campaigns.find({}, (err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    // Get events in date range
    const events = await new Promise<any[]>((resolve, reject) => {
      db.marketing_events.find({
        timestamp: { $gte: dateRange.from, $lte: dateRange.to }
      }, (err: any, docs: any[]) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })

    // Calculate overall metrics
    const totalCampaigns = campaigns.length
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length
    const totalImpressions = events.filter(e => e.eventType === 'impression').length
    const totalClicks = events.filter(e => e.eventType === 'click').length
    const totalConversions = events.filter(e => e.eventType === 'conversion').length
    const totalRevenue = events
      .filter(e => e.eventType === 'conversion')
      .reduce((sum, e) => sum + (e.eventData.conversionValue || 0), 0)

    const overallCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0
    const overallCR = totalClicks > 0 ? totalConversions / totalClicks : 0

    // Top performing campaigns
    const campaignPerformance = campaigns.map(campaign => ({
      campaignId: campaign.campaignId,
      name: campaign.name,
      impressions: campaign.analytics.impressions,
      clicks: campaign.analytics.clicks,
      conversions: campaign.analytics.conversions,
      revenue: campaign.analytics.revenue,
      ctr: campaign.analytics.clickThroughRate,
      cr: campaign.analytics.conversionRate
    })).sort((a, b) => b.conversions - a.conversions)

    res.json({
      success: true,
      data: {
        overview: {
          totalCampaigns,
          activeCampaigns,
          totalImpressions,
          totalClicks,
          totalConversions,
          totalRevenue,
          overallCTR,
          overallCR
        },
        topPerformingCampaigns: campaignPerformance.slice(0, 10),
        dateRange
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview'
    })
  }
})

// ==================== EVENT TRIGGERS ====================

// Trigger campaigns for specific events
router.post('/events/:eventId/trigger', requireMarketingPermission('write'), logAdminAction('trigger_event_campaign'), marketingController.triggerEventCampaign.bind(marketingController))

// ==================== DYNAMIC CONTENT MANAGEMENT ====================

// Process template with variables
router.post('/templates/:templateId/process', requireMarketingPermission('write'), logAdminAction('process_template'), async (req, res) => {
  try {
    const { templateId } = req.params
    const { variables } = req.body
    
    const processedContent = await contentService.processTemplateContent(templateId, variables)
    
    res.json({
      success: true,
      data: processedContent
    })
  } catch (error) {
    console.error('Error processing template:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process template'
    })
  }
})

// Update CTA content dynamically
router.put('/campaigns/:campaignId/content', requireMarketingPermission('write'), logAdminAction('update_cta_content'), async (req, res) => {
  try {
    const { campaignId } = req.params
    const updates = req.body
    
    const success = await contentService.updateCTAContent(campaignId, updates)
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found or update failed'
      })
    }

    res.json({
      success: true,
      message: 'CTA content updated successfully'
    })
  } catch (error) {
    console.error('Error updating CTA content:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update CTA content'
    })
  }
})

// ==================== SYSTEM TEMPLATES ====================

// Get system templates (pre-built templates)
router.get('/templates/system', async (req, res) => {
  try {
    const systemTemplates = [
      {
        templateId: 'sys_welcome_registered',
        name: '歡迎新會員',
        description: '新註冊會員的歡迎訊息',
        category: 'welcome',
        type: 'cta',
        content: {
          title: '歡迎加入天造地設人成對！',
          description: '恭喜您成功註冊！立即開始探索我們的精彩活動，找到您的真愛。',
          primaryCTA: {
            text: '立即探索活動',
            action: 'view_events',
            variant: 'luxury'
          },
          secondaryCTA: {
            text: '完善個人資料',
            action: 'custom',
            customUrl: '/profile',
            variant: 'secondary'
          }
        },
        variables: [
          { name: 'userName', type: 'string', description: '使用者姓名', required: true },
          { name: 'membershipType', type: 'string', description: '會員類型', required: true }
        ],
        settings: {
          isActive: true,
          isSystem: true,
          usage: { totalCampaigns: 0 }
        }
      },
      {
        templateId: 'sys_upgrade_vip',
        name: 'VIP升級邀請',
        description: '邀請已註冊會員升級至VIP',
        category: 'membership_upgrade',
        type: 'cta',
        content: {
          title: '升級VIP，享受更多特權！',
          description: '升級至VIP會員，優先預約活動，並享受更多專屬服務。',
          primaryCTA: {
            text: '立即升級VIP',
            action: 'upgrade',
            variant: 'luxury'
          },
          secondaryCTA: {
            text: '了解VIP特權',
            action: 'custom',
            customUrl: '/pricing',
            variant: 'secondary'
          }
        },
        variables: [
          { name: 'userName', type: 'string', description: '使用者姓名', required: true },
          { name: 'currentMembership', type: 'string', description: '目前會員類型', required: true }
        ],
        settings: {
          isActive: true,
          isSystem: true,
          usage: { totalCampaigns: 0 }
        }
      },
      {
        templateId: 'sys_upgrade_vvip',
        name: 'VVIP升級邀請',
        description: '邀請VIP會員升級至VVIP頂級會員',
        category: 'membership_upgrade',
        type: 'cta',
        content: {
          title: '升級VVIP頂級會員，享受至尊體驗！',
          description: '升級至VVIP頂級會員，享受參與者查看權限、專屬客服及所有平台功能。',
          primaryCTA: {
            text: '立即升級VVIP',
            action: 'upgrade',
            variant: 'luxury'
          },
          secondaryCTA: {
            text: '了解VVIP特權',
            action: 'custom',
            customUrl: '/pricing',
            variant: 'secondary'
          }
        },
        variables: [
          { name: 'userName', type: 'string', description: '使用者姓名', required: true },
          { name: 'currentMembership', type: 'string', description: '目前會員類型', required: true }
        ],
        settings: {
          isActive: true,
          isSystem: true,
          usage: { totalCampaigns: 0 }
        }
      },
      {
        templateId: 'sys_event_reminder',
        name: '活動提醒',
        description: '活動開始前的提醒訊息',
        category: 'event_promotion',
        type: 'notification',
        content: {
          title: '活動即將開始！',
          description: '您報名的活動「{{eventName}}」將於{{eventDate}}開始，請準時參加。',
          primaryCTA: {
            text: '查看活動詳情',
            action: 'custom',
            customUrl: '/events/{{eventId}}',
            variant: 'primary'
          }
        },
        variables: [
          { name: 'userName', type: 'string', description: '使用者姓名', required: true },
          { name: 'eventName', type: 'string', description: '活動名稱', required: true },
          { name: 'eventDate', type: 'date', description: '活動日期', required: true },
          { name: 'eventId', type: 'string', description: '活動ID', required: true }
        ],
        settings: {
          isActive: true,
          isSystem: true,
          usage: { totalCampaigns: 0 }
        }
      },
      {
        templateId: 'sys_interview_booking',
        name: '面試預約提醒',
        description: '提醒用戶進行面試預約',
        category: 'interview_booking',
        type: 'cta',
        content: {
          title: '完成面試，開啟交友之旅！',
          description: '預約30分鐘的面試，完成後即可上傳個人照片和影片。',
          primaryCTA: {
            text: '立即預約面試',
            action: 'book_interview',
            variant: 'luxury'
          },
          secondaryCTA: {
            text: '了解面試流程',
            action: 'custom',
            customUrl: '/about#interview',
            variant: 'secondary'
          }
        },
        variables: [
          { name: 'userName', type: 'string', description: '使用者姓名', required: true },
          { name: 'membershipType', type: 'string', description: '會員類型', required: true }
        ],
        settings: {
          isActive: true,
          isSystem: true,
          usage: { totalCampaigns: 0 }
        }
      }
    ]

    res.json({
      success: true,
      data: systemTemplates
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system templates'
    })
  }
})

export default router