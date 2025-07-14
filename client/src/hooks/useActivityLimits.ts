// Activity Limits Hook
// Tracks and manages activity viewing limits based on membership type
import { useAuthStore } from '../store/authStore'

export const useActivityLimits = () => {
  const { user } = useAuthStore()
  
  const membershipType = user?.membership?.type || 'visitor'
  
  const getLimits = () => {
    switch (membershipType) {
      case 'visitor':
        return {
          limit: 3,
          unlimited: false,
          nextTier: 'registered',
          nextTierLimit: 12
        }
      case 'registered':
        return {
          limit: 12,
          unlimited: false,
          nextTier: 'vip',
          nextTierLimit: 'unlimited'
        }
      case 'vip':
      case 'vvip':
        return {
          limit: Infinity,
          unlimited: true,
          nextTier: null,
          nextTierLimit: null
        }
      default:
        return {
          limit: 3,
          unlimited: false,
          nextTier: 'registered',
          nextTierLimit: 12
        }
    }
  }
  
  const limits = getLimits()
  
  const applyLimits = <T>(items: T[]): T[] => {
    if (limits.unlimited) {
      return items
    }
    return items.slice(0, limits.limit)
  }
  
  const isLimitReached = (totalItems: number): boolean => {
    if (limits.unlimited) return false
    return totalItems > limits.limit
  }
  
  const getRemainingViews = (totalItems: number): number => {
    if (limits.unlimited) return Infinity
    return Math.max(0, limits.limit - totalItems)
  }
  
  const getHiddenCount = (totalItems: number): number => {
    if (limits.unlimited) return 0
    return Math.max(0, totalItems - limits.limit)
  }
  
  return {
    membershipType,
    limits,
    applyLimits,
    isLimitReached,
    getRemainingViews,
    getHiddenCount
  }
}