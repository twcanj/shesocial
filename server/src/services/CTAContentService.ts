// CTA Content Management Service
// Dynamic content delivery and personalization for marketing campaigns

import { v4 as uuidv4 } from 'uuid'
import NeDBSetup from '../db/nedb-setup'
import { MarketingCampaign, MarketingTemplate } from '../models/Marketing'
import { UserProfile } from '../types/database'

export interface CTAContent {
  campaignId: string
  variantId?: string
  title: string
  description: string
  primaryCTA: {
    text: string
    action: string
    url?: string
    variant: 'primary' | 'secondary' | 'luxury' | 'urgent'
  }
  secondaryCTA?: {
    text: string
    action: string
    url?: string
    variant: 'primary' | 'secondary' | 'luxury' | 'urgent'
  }
  styling: {
    backgroundColor: string
    textColor: string
    buttonColor: string
    borderColor: string
    fontFamily: string
    fontSize: string
  }
  icon?: string
  bannerImage?: string
  placement: string
  personalization: {
    userName?: string
    membershipType?: string
    locationBased?: boolean
    interestBased?: boolean
  }
}

export interface CTADisplayRules {
  membershipTypes: string[]
  pageRoutes: string[]
  timeConstraints: {
    startTime?: string
    endTime?: string
    daysOfWeek?: number[]
  }
  behaviorTriggers: {
    pageViews?: number
    timeOnSite?: number
    eventInteractions?: number
    lastActiveHours?: number
  }
  frequency: {
    maxImpressions?: number
    cooldownHours?: number
    maxPerSession?: number
  }
}

export class CTAContentService {
  private db = NeDBSetup.getInstance().getDatabases()

  // Get personalized CTA content for a user
  async getPersonalizedCTA(
    userId: string | null,
    membershipType: string,
    pageRoute: string,
    context: any = {}
  ): Promise<CTAContent | null> {
    try {
      // Find active campaigns targeting this user
      const campaigns = await this.findEligibleCampaigns(membershipType, pageRoute, context)
      
      if (campaigns.length === 0) {
        return null
      }

      // Select best campaign based on priority, performance, and targeting
      const selectedCampaign = await this.selectBestCampaign(campaigns, userId, context)
      
      if (!selectedCampaign) {
        return null
      }

      // Get user profile for personalization
      const userProfile = userId ? await this.getUserProfile(userId) : null
      
      // Generate personalized content
      const content = await this.generatePersonalizedContent(
        selectedCampaign,
        userProfile,
        membershipType,
        pageRoute,
        context
      )

      return content
    } catch (error) {
      console.error('Error getting personalized CTA:', error)
      return null
    }
  }

  // Get multiple CTA contents for A/B testing
  async getABTestVariants(
    campaignId: string,
    userId: string | null,
    membershipType: string,
    pageRoute: string,
    context: any = {}
  ): Promise<CTAContent[]> {
    try {
      const campaign = await this.getCampaign(campaignId)
      
      if (!campaign || !campaign.abTesting?.enabled) {
        return []
      }

      const userProfile = userId ? await this.getUserProfile(userId) : null
      const variants = []

      for (const variant of campaign.abTesting.variants) {
        const content = await this.generateContentFromVariant(
          campaign,
          variant,
          userProfile,
          membershipType,
          pageRoute,
          context
        )
        
        if (content) {
          variants.push(content)
        }
      }

      return variants
    } catch (error) {
      console.error('Error getting A/B test variants:', error)
      return []
    }
  }

  // Process template variables for dynamic content
  async processTemplateContent(
    templateId: string,
    variables: Record<string, any>
  ): Promise<any> {
    try {
      const template = await this.getTemplate(templateId)
      
      if (!template) {
        throw new Error('Template not found')
      }

      // Process template content with variables
      const processedContent = {
        title: this.processTemplateString(template.content.title, variables),
        description: this.processTemplateString(template.content.description, variables),
        primaryCTA: {
          ...template.content.primaryCTA,
          text: this.processTemplateString(template.content.primaryCTA.text, variables),
          customUrl: template.content.primaryCTA.customUrl 
            ? this.processTemplateString(template.content.primaryCTA.customUrl, variables)
            : undefined
        },
        secondaryCTA: template.content.secondaryCTA ? {
          ...template.content.secondaryCTA,
          text: this.processTemplateString(template.content.secondaryCTA.text, variables),
          customUrl: template.content.secondaryCTA.customUrl 
            ? this.processTemplateString(template.content.secondaryCTA.customUrl, variables)
            : undefined
        } : undefined,
        styling: template.content.styling || {},
        icon: template.content.icon,
        bannerImage: template.content.bannerImage
      }

      return processedContent
    } catch (error) {
      console.error('Error processing template content:', error)
      throw error
    }
  }

  // Get CTA content for specific placement
  async getPlacementCTA(
    placement: string,
    userId: string | null,
    membershipType: string,
    context: any = {}
  ): Promise<CTAContent | null> {
    try {
      const campaigns = await new Promise<MarketingCampaign[]>((resolve, reject) => {
        this.db.marketing_campaigns.find({
          status: 'active',
          'targeting.membershipTypes': membershipType,
          'content.placement': placement
        }, (err, docs) => {
          if (err) reject(err)
          else resolve(docs)
        })
      })

      if (campaigns.length === 0) {
        return null
      }

      // Select campaign based on priority and performance
      const selectedCampaign = campaigns.sort((a, b) => {
        // Sort by conversion rate descending
        return b.analytics.conversionRate - a.analytics.conversionRate
      })[0]

      const userProfile = userId ? await this.getUserProfile(userId) : null
      
      return await this.generatePersonalizedContent(
        selectedCampaign,
        userProfile,
        membershipType,
        placement,
        context
      )
    } catch (error) {
      console.error('Error getting placement CTA:', error)
      return null
    }
  }

  // Check if user should see CTA based on frequency rules
  async shouldShowCTA(
    campaignId: string,
    userId: string | null,
    sessionId: string
  ): Promise<boolean> {
    try {
      const campaign = await this.getCampaign(campaignId)
      
      if (!campaign) {
        return false
      }

      // Check frequency rules (add frequency to targeting if not exists)
      const frequency = (campaign.targeting as any).frequency || {}
      
      if (frequency.maxImpressions || frequency.cooldownHours || frequency.maxPerSession) {
        const now = new Date()
        const userEvents = await this.getUserEvents(campaignId, userId, sessionId)
        
        // Check max impressions
        if (frequency.maxImpressions) {
          const impressions = userEvents.filter(e => e.eventType === 'impression').length
          if (impressions >= frequency.maxImpressions) {
            return false
          }
        }

        // Check cooldown period
        if (frequency.cooldownHours) {
          const cooldownTime = new Date(now.getTime() - frequency.cooldownHours * 60 * 60 * 1000)
          const recentImpressions = userEvents.filter(e => 
            e.eventType === 'impression' && e.timestamp >= cooldownTime
          )
          if (recentImpressions.length > 0) {
            return false
          }
        }

        // Check max per session
        if (frequency.maxPerSession) {
          const sessionImpressions = userEvents.filter(e => 
            e.eventType === 'impression' && e.sessionId === sessionId
          ).length
          if (sessionImpressions >= frequency.maxPerSession) {
            return false
          }
        }
      }

      return true
    } catch (error) {
      console.error('Error checking CTA frequency:', error)
      return false
    }
  }

  // Update CTA content dynamically
  async updateCTAContent(
    campaignId: string,
    updates: Partial<CTAContent>
  ): Promise<boolean> {
    try {
      const campaign = await this.getCampaign(campaignId)
      
      if (!campaign) {
        return false
      }

      // Update campaign content
      const updatedContent = { ...campaign.content, ...updates }
      
      await new Promise<void>((resolve, reject) => {
        this.db.marketing_campaigns.update(
          { campaignId },
          { 
            $set: { 
              content: updatedContent,
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

      return true
    } catch (error) {
      console.error('Error updating CTA content:', error)
      return false
    }
  }

  // Private helper methods

  private async findEligibleCampaigns(
    membershipType: string,
    pageRoute: string,
    context: any
  ): Promise<MarketingCampaign[]> {
    const now = new Date()
    
    return new Promise<MarketingCampaign[]>((resolve, reject) => {
      this.db.marketing_campaigns.find({
        status: 'active',
        'targeting.membershipTypes': membershipType,
        'schedule.startDate': { $lte: now },
        $or: [
          { 'schedule.endDate': { $gte: now } },
          { 'schedule.endDate': { $exists: false } }
        ]
      }, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  private async selectBestCampaign(
    campaigns: MarketingCampaign[],
    userId: string | null,
    context: any
  ): Promise<MarketingCampaign | null> {
    // Sort by priority: conversion rate, then by targeting specificity
    const sortedCampaigns = campaigns.sort((a, b) => {
      // Primary sort: conversion rate (higher is better)
      const aRate = a.analytics.conversionRate || 0
      const bRate = b.analytics.conversionRate || 0
      
      if (aRate !== bRate) {
        return bRate - aRate
      }

      // Secondary sort: targeting specificity (more specific is better)
      const aSpecificity = this.calculateTargetingSpecificity(a.targeting)
      const bSpecificity = this.calculateTargetingSpecificity(b.targeting)
      
      return bSpecificity - aSpecificity
    })

    return sortedCampaigns[0] || null
  }

  private async generatePersonalizedContent(
    campaign: MarketingCampaign,
    userProfile: UserProfile | null,
    membershipType: string,
    pageRoute: string,
    context: any
  ): Promise<CTAContent> {
    const userName = userProfile?.profile?.name || '朋友'
    const userLocation = userProfile?.profile?.location || '台北'
    const userInterests = userProfile?.profile?.interests || []

    // Process content with personalization
    const personalizedContent: CTAContent = {
      campaignId: campaign.campaignId,
      title: this.personalizeText(campaign.content.title, { userName, membershipType, userLocation }),
      description: this.personalizeText(campaign.content.description, { userName, membershipType, userLocation }),
      primaryCTA: {
        text: this.personalizeText(campaign.content.primaryCTA.text, { userName, membershipType }),
        action: campaign.content.primaryCTA.action,
        url: campaign.content.primaryCTA.customUrl,
        variant: campaign.content.primaryCTA.variant
      },
      secondaryCTA: campaign.content.secondaryCTA ? {
        text: this.personalizeText(campaign.content.secondaryCTA.text, { userName, membershipType }),
        action: campaign.content.secondaryCTA.action,
        url: campaign.content.secondaryCTA.customUrl,
        variant: campaign.content.secondaryCTA.variant
      } : undefined,
      styling: {
        backgroundColor: campaign.content.styling?.backgroundColor || '#663399',
        textColor: campaign.content.styling?.textColor || '#ffffff',
        buttonColor: campaign.content.styling?.buttonColor || '#d4af37',
        borderColor: campaign.content.styling?.borderColor || '#d4af37',
        fontFamily: campaign.content.styling?.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: campaign.content.styling?.fontSize || '16px'
      },
      icon: campaign.content.icon,
      bannerImage: campaign.content.bannerImage,
      placement: pageRoute,
      personalization: {
        userName,
        membershipType,
        locationBased: userLocation !== '台北',
        interestBased: userInterests.length > 0
      }
    }

    return personalizedContent
  }

  private async generateContentFromVariant(
    campaign: MarketingCampaign,
    variant: any,
    userProfile: UserProfile | null,
    membershipType: string,
    pageRoute: string,
    context: any
  ): Promise<CTAContent | null> {
    const userName = userProfile?.profile?.name || '朋友'
    const userLocation = userProfile?.profile?.location || '台北'

    return {
      campaignId: campaign.campaignId,
      variantId: variant.variantId,
      title: this.personalizeText(variant.content.title, { userName, membershipType, userLocation }),
      description: this.personalizeText(variant.content.description, { userName, membershipType, userLocation }),
      primaryCTA: {
        text: this.personalizeText(variant.content.primaryCTA.text, { userName, membershipType }),
        action: variant.content.primaryCTA.action,
        url: variant.content.primaryCTA.customUrl,
        variant: variant.content.primaryCTA.variant
      },
      secondaryCTA: variant.content.secondaryCTA ? {
        text: this.personalizeText(variant.content.secondaryCTA.text, { userName, membershipType }),
        action: variant.content.secondaryCTA.action,
        url: variant.content.secondaryCTA.customUrl,
        variant: variant.content.secondaryCTA.variant
      } : undefined,
      styling: {
        backgroundColor: variant.content.styling?.backgroundColor || '#663399',
        textColor: variant.content.styling?.textColor || '#ffffff',
        buttonColor: variant.content.styling?.buttonColor || '#d4af37',
        borderColor: variant.content.styling?.borderColor || '#d4af37',
        fontFamily: variant.content.styling?.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: variant.content.styling?.fontSize || '16px'
      },
      icon: variant.content.icon,
      bannerImage: variant.content.bannerImage,
      placement: pageRoute,
      personalization: {
        userName,
        membershipType,
        locationBased: userLocation !== '台北',
        interestBased: (userProfile?.profile?.interests || []).length > 0
      }
    }
  }

  private personalizeText(text: string, variables: Record<string, any>): string {
    let personalizedText = text
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      personalizedText = personalizedText.replace(regex, String(value))
    }

    return personalizedText
  }

  private processTemplateString(template: string, variables: Record<string, any>): string {
    let processed = template
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processed = processed.replace(regex, String(value))
    }

    return processed
  }

  private calculateTargetingSpecificity(targeting: any): number {
    let specificity = 0
    
    if (targeting.membershipTypes?.length) {
      specificity += targeting.membershipTypes.length * 10
    }
    
    if (targeting.demographics?.ageMin || targeting.demographics?.ageMax) {
      specificity += 20
    }
    
    if (targeting.demographics?.location?.length) {
      specificity += targeting.demographics.location.length * 5
    }
    
    if (targeting.demographics?.interests?.length) {
      specificity += targeting.demographics.interests.length * 3
    }
    
    if (targeting.behaviorFilters) {
      Object.keys(targeting.behaviorFilters).forEach(() => {
        specificity += 15
      })
    }

    return specificity
  }

  private async getCampaign(campaignId: string): Promise<MarketingCampaign | null> {
    return new Promise<MarketingCampaign | null>((resolve, reject) => {
      this.db.marketing_campaigns.findOne({ campaignId }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  private async getTemplate(templateId: string): Promise<MarketingTemplate | null> {
    return new Promise<MarketingTemplate | null>((resolve, reject) => {
      this.db.marketing_templates.findOne({ templateId }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    return new Promise<UserProfile | null>((resolve, reject) => {
      this.db.users.findOne({ userId }, (err, doc) => {
        if (err) reject(err)
        else resolve(doc)
      })
    })
  }

  private async getUserEvents(campaignId: string, userId: string | null, sessionId: string): Promise<any[]> {
    const query: any = { campaignId }
    
    if (userId) {
      query.userId = userId
    } else if (sessionId) {
      query.sessionId = sessionId
    }

    return new Promise<any[]>((resolve, reject) => {
      this.db.marketing_events.find(query, (err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }
}

export default CTAContentService