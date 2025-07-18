// CTA Analytics Service
// Real-time tracking and analytics for marketing campaigns

import { v4 as uuidv4 } from 'uuid'
import NeDBSetup from '../db/nedb-setup'
import { MarketingEvent, MarketingAnalytics, MarketingCampaign } from '../models/Marketing'

export class CTAAnalyticsService {
  private db = NeDBSetup.getInstance().getDatabases()

  // Track CTA impression (when CTA is displayed to user)
  async trackImpression(campaignId: string, userId?: string, context?: any): Promise<void> {
    try {
      const event: MarketingEvent = {
        eventId: uuidv4(),
        campaignId,
        userId,
        sessionId: context?.sessionId,
        eventType: 'impression',
        eventData: {
          placement: context?.placement || 'unknown',
          deviceType: context?.deviceType || 'unknown',
          browserType: context?.browserType || 'unknown',
          userAgent: context?.userAgent,
          referrer: context?.referrer
        },
        userContext: context?.userContext,
        timestamp: new Date(),
        createdAt: new Date()
      }

      await this.saveEvent(event)
      await this.updateCampaignMetrics(campaignId, 'impression')
    } catch (error) {
      console.error('Error tracking impression:', error)
    }
  }

  // Track CTA click (when user clicks CTA button)
  async trackClick(campaignId: string, userId?: string, context?: any): Promise<void> {
    try {
      const event: MarketingEvent = {
        eventId: uuidv4(),
        campaignId,
        userId,
        sessionId: context?.sessionId,
        eventType: 'click',
        eventData: {
          ctaText: context?.ctaText,
          ctaAction: context?.ctaAction,
          variantId: context?.variantId,
          placement: context?.placement || 'unknown',
          deviceType: context?.deviceType || 'unknown',
          browserType: context?.browserType || 'unknown',
          userAgent: context?.userAgent,
          referrer: context?.referrer
        },
        userContext: context?.userContext,
        timestamp: new Date(),
        createdAt: new Date()
      }

      await this.saveEvent(event)
      await this.updateCampaignMetrics(campaignId, 'click')
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  // Track CTA conversion (when user completes desired action)
  async trackConversion(campaignId: string, userId?: string, context?: any): Promise<void> {
    try {
      const event: MarketingEvent = {
        eventId: uuidv4(),
        campaignId,
        userId,
        sessionId: context?.sessionId,
        eventType: 'conversion',
        eventData: {
          conversionType: context?.conversionType || 'unknown',
          conversionValue: context?.conversionValue || 0,
          ctaText: context?.ctaText,
          ctaAction: context?.ctaAction,
          variantId: context?.variantId,
          placement: context?.placement || 'unknown',
          deviceType: context?.deviceType || 'unknown',
          browserType: context?.browserType || 'unknown',
          userAgent: context?.userAgent,
          referrer: context?.referrer
        },
        userContext: context?.userContext,
        timestamp: new Date(),
        createdAt: new Date()
      }

      await this.saveEvent(event)
      await this.updateCampaignMetrics(campaignId, 'conversion', context?.conversionValue || 0)
    } catch (error) {
      console.error('Error tracking conversion:', error)
    }
  }

  // Track CTA dismissal (when user closes/dismisses CTA)
  async trackDismiss(campaignId: string, userId?: string, context?: any): Promise<void> {
    try {
      const event: MarketingEvent = {
        eventId: uuidv4(),
        campaignId,
        userId,
        sessionId: context?.sessionId,
        eventType: 'dismiss',
        eventData: {
          ctaText: context?.ctaText,
          placement: context?.placement || 'unknown',
          deviceType: context?.deviceType || 'unknown',
          browserType: context?.browserType || 'unknown',
          userAgent: context?.userAgent,
          referrer: context?.referrer
        },
        userContext: context?.userContext,
        timestamp: new Date(),
        createdAt: new Date()
      }

      await this.saveEvent(event)
    } catch (error) {
      console.error('Error tracking dismiss:', error)
    }
  }

  // Get campaign performance metrics
  async getCampaignMetrics(campaignId: string, dateRange?: { from: Date; to: Date }): Promise<any> {
    try {
      const query: any = { campaignId }
      
      if (dateRange) {
        query.timestamp = {
          $gte: dateRange.from,
          $lte: dateRange.to
        }
      }

      const events = await new Promise<MarketingEvent[]>((resolve, reject) => {
        this.db.marketing_events.find(query, (err, docs) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })

      return this.calculateMetrics(events)
    } catch (error) {
      console.error('Error getting campaign metrics:', error)
      return null
    }
  }

  // Get real-time campaign analytics
  async getRealTimeAnalytics(campaignId: string): Promise<any> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const events = await new Promise<MarketingEvent[]>((resolve, reject) => {
        this.db.marketing_events.find({
          campaignId,
          timestamp: { $gte: last24Hours }
        }, (err, docs) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })

      const metrics = this.calculateMetrics(events)
      
      // Calculate hourly breakdown
      const hourlyBreakdown = this.calculateHourlyBreakdown(events)
      
      // Calculate top performing content
      const topContent = this.calculateTopPerforming(events)

      return {
        ...metrics,
        hourlyBreakdown,
        topContent,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error getting real-time analytics:', error)
      return null
    }
  }

  // Generate A/B test results
  async getABTestResults(campaignId: string): Promise<any> {
    try {
      const events = await new Promise<MarketingEvent[]>((resolve, reject) => {
        this.db.marketing_events.find({ campaignId }, (err, docs) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })

      const variantResults = {}
      
      events.forEach(event => {
        const variantId = event.eventData.variantId || 'default'
        
        if (!variantResults[variantId]) {
          variantResults[variantId] = {
            variantId,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0
          }
        }

        const variant = variantResults[variantId]
        
        if (event.eventType === 'impression') variant.impressions++
        else if (event.eventType === 'click') variant.clicks++
        else if (event.eventType === 'conversion') {
          variant.conversions++
          variant.revenue += event.eventData.conversionValue || 0
        }
      })

      // Calculate conversion rates and statistical significance
      const results = Object.values(variantResults).map((variant: any) => ({
        ...variant,
        clickThroughRate: variant.impressions > 0 ? variant.clicks / variant.impressions : 0,
        conversionRate: variant.clicks > 0 ? variant.conversions / variant.clicks : 0,
        revenuePerClick: variant.clicks > 0 ? variant.revenue / variant.clicks : 0,
        confidence: this.calculateConfidence(variant.conversions, variant.clicks)
      }))

      // Determine winner
      const winner = results.reduce((prev, current) => 
        current.conversionRate > prev.conversionRate ? current : prev
      )

      return {
        variants: results,
        winner: winner.variantId,
        totalImpressions: results.reduce((sum, v) => sum + v.impressions, 0),
        totalClicks: results.reduce((sum, v) => sum + v.clicks, 0),
        totalConversions: results.reduce((sum, v) => sum + v.conversions, 0),
        totalRevenue: results.reduce((sum, v) => sum + v.revenue, 0)
      }
    } catch (error) {
      console.error('Error getting A/B test results:', error)
      return null
    }
  }

  // Get demographic breakdown
  async getDemographicBreakdown(campaignId: string): Promise<any> {
    try {
      const events = await new Promise<MarketingEvent[]>((resolve, reject) => {
        this.db.marketing_events.find({ campaignId }, (err, docs) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })

      const demographics = {
        membershipType: { visitor: 0, registered: 0, vip: 0, vvip: 0 },
        ageGroups: {},
        locations: {},
        devices: { desktop: 0, mobile: 0, tablet: 0 }
      }

      events.forEach(event => {
        // Membership type breakdown
        if (event.userContext?.membershipType) {
          demographics.membershipType[event.userContext.membershipType]++
        }

        // Age group breakdown
        if (event.userContext?.age) {
          const ageGroup = this.getAgeGroup(event.userContext.age)
          demographics.ageGroups[ageGroup] = (demographics.ageGroups[ageGroup] || 0) + 1
        }

        // Location breakdown
        if (event.userContext?.location) {
          const location = event.userContext.location
          demographics.locations[location] = (demographics.locations[location] || 0) + 1
        }

        // Device breakdown
        if (event.eventData.deviceType) {
          demographics.devices[event.eventData.deviceType]++
        }
      })

      return demographics
    } catch (error) {
      console.error('Error getting demographic breakdown:', error)
      return null
    }
  }

  // Private helper methods

  private async saveEvent(event: MarketingEvent): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.marketing_events.insert(event, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  private async updateCampaignMetrics(campaignId: string, eventType: string, conversionValue: number = 0): Promise<void> {
    try {
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

        await new Promise<void>((resolve, reject) => {
          this.db.marketing_campaigns.update({ campaignId }, updateData, {}, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })

        // Recalculate rates
        await this.recalculateCampaignRates(campaignId)
      }
    } catch (error) {
      console.error('Error updating campaign metrics:', error)
    }
  }

  private async recalculateCampaignRates(campaignId: string): Promise<void> {
    try {
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

        await new Promise<void>((resolve, reject) => {
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
            (err) => {
              if (err) reject(err)
              else resolve()
            }
          )
        })
      }
    } catch (error) {
      console.error('Error recalculating campaign rates:', error)
    }
  }

  private calculateMetrics(events: MarketingEvent[]): any {
    const impressions = events.filter(e => e.eventType === 'impression').length
    const clicks = events.filter(e => e.eventType === 'click').length
    const conversions = events.filter(e => e.eventType === 'conversion').length
    const dismissals = events.filter(e => e.eventType === 'dismiss').length
    
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size
    const uniqueImpressions = new Set(events.filter(e => e.eventType === 'impression').map(e => e.userId)).size
    const uniqueClicks = new Set(events.filter(e => e.eventType === 'click').map(e => e.userId)).size
    const uniqueConversions = new Set(events.filter(e => e.eventType === 'conversion').map(e => e.userId)).size

    const revenue = events
      .filter(e => e.eventType === 'conversion')
      .reduce((sum, e) => sum + (e.eventData.conversionValue || 0), 0)

    return {
      impressions,
      clicks,
      conversions,
      dismissals,
      uniqueUsers,
      uniqueImpressions,
      uniqueClicks,
      uniqueConversions,
      revenue,
      clickThroughRate: impressions > 0 ? clicks / impressions : 0,
      conversionRate: clicks > 0 ? conversions / clicks : 0,
      dismissalRate: impressions > 0 ? dismissals / impressions : 0,
      avgRevenuePerConversion: conversions > 0 ? revenue / conversions : 0,
      avgRevenuePerClick: clicks > 0 ? revenue / clicks : 0,
      avgRevenuePerImpression: impressions > 0 ? revenue / impressions : 0
    }
  }

  private calculateHourlyBreakdown(events: MarketingEvent[]): any {
    const hourlyData = {}
    
    events.forEach(event => {
      const hour = event.timestamp.getHours()
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = { impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }

      const data = hourlyData[hour]
      
      if (event.eventType === 'impression') data.impressions++
      else if (event.eventType === 'click') data.clicks++
      else if (event.eventType === 'conversion') {
        data.conversions++
        data.revenue += event.eventData.conversionValue || 0
      }
    })

    return hourlyData
  }

  private calculateTopPerforming(events: MarketingEvent[]): any {
    const ctaPerformance = {}
    
    events.forEach(event => {
      const ctaText = event.eventData.ctaText || 'Unknown'
      
      if (!ctaPerformance[ctaText]) {
        ctaPerformance[ctaText] = { impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }

      const data = ctaPerformance[ctaText]
      
      if (event.eventType === 'impression') data.impressions++
      else if (event.eventType === 'click') data.clicks++
      else if (event.eventType === 'conversion') {
        data.conversions++
        data.revenue += event.eventData.conversionValue || 0
      }
    })

    // Sort by conversion rate
    const sortedCTAs = Object.entries(ctaPerformance)
      .map(([ctaText, data]: [string, any]) => ({
        ctaText,
        ...data,
        conversionRate: data.clicks > 0 ? data.conversions / data.clicks : 0
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)

    return sortedCTAs.slice(0, 10) // Top 10
  }

  private calculateConfidence(conversions: number, clicks: number): number {
    // Simplified confidence calculation
    // In a real implementation, you'd use proper statistical methods
    if (clicks < 30) return 0 // Not enough data
    
    const conversionRate = conversions / clicks
    const standardError = Math.sqrt((conversionRate * (1 - conversionRate)) / clicks)
    const zScore = 1.96 // 95% confidence interval
    
    return Math.min(95, Math.max(0, (1 - standardError * zScore) * 100))
  }

  private getAgeGroup(age: number): string {
    if (age < 25) return '18-24'
    if (age < 35) return '25-34'
    if (age < 45) return '35-44'
    if (age < 55) return '45-54'
    return '55+'
  }
}

export default CTAAnalyticsService