// Event-Driven Message Bus for Mobile-First Architecture
// Handles real-time updates between database operations and UI state

import { EventEmitter } from 'events'

export interface EventBusMessage {
  type: string
  payload: any
  timestamp: number
  priority: 'high' | 'medium' | 'low'
  source: 'db' | 'network' | 'user' | 'system'
  targetComponent?: string
}

export interface DatabaseEvent extends EventBusMessage {
  type: 'DB_UPDATE' | 'DB_INSERT' | 'DB_DELETE' | 'DB_SYNC'
  payload: {
    collection: string
    operation: string
    data: any
    userId?: string
  }
}

export interface NetworkEvent extends EventBusMessage {
  type: 'NETWORK_ONLINE' | 'NETWORK_OFFLINE' | 'SYNC_COMPLETE' | 'SYNC_FAILED'
  payload: {
    isOnline?: boolean
    syncedItems?: number
    errors?: string[]
  }
}

export interface UIEvent extends EventBusMessage {
  type: 'UI_REFRESH' | 'UI_FILTER_CHANGE' | 'UI_TAB_CHANGE'
  payload: {
    component: string
    filters?: any
    tab?: string
  }
}

class EventBus extends EventEmitter {
  private messageQueue: EventBusMessage[] = []
  private isProcessing = false
  private subscribers = new Map<string, Set<Function>>()

  constructor() {
    super()
    this.setMaxListeners(50) // Support many components
    this.startMessageProcessor()
  }

  // Publish message to event bus
  publish(message: EventBusMessage): void {
    message.timestamp = Date.now()
    this.messageQueue.push(message)
    this.emit('message', message)
    this.processMessageQueue()
  }

  // Subscribe to specific event types
  subscribe(eventType: string, callback: (message: EventBusMessage) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set())
    }
    this.subscribers.get(eventType)!.add(callback)

    this.on(eventType, callback)

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(callback)
      this.off(eventType, callback)
    }
  }

  // Database operation events
  publishDBEvent(collection: string, operation: string, data: any, userId?: string): void {
    this.publish({
      type: `DB_${operation.toUpperCase()}`,
      payload: { collection, operation, data, userId },
      timestamp: Date.now(),
      priority: 'high',
      source: 'db'
    })
  }

  // Network status events
  publishNetworkEvent(type: 'ONLINE' | 'OFFLINE' | 'SYNC_COMPLETE' | 'SYNC_FAILED', payload: any = {}): void {
    this.publish({
      type: `NETWORK_${type}`,
      payload: { isOnline: navigator.onLine, ...payload },
      timestamp: Date.now(),
      priority: type === 'OFFLINE' ? 'high' : 'medium',
      source: 'network'
    })
  }

  // UI state change events
  publishUIEvent(component: string, type: string, payload: any = {}): void {
    this.publish({
      type: `UI_${type.toUpperCase()}`,
      payload: { component, ...payload },
      timestamp: Date.now(),
      priority: 'low',
      source: 'user',
      targetComponent: component
    })
  }

  // Process message queue with priority
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) return

    this.isProcessing = true

    try {
      // Sort by priority and timestamp
      this.messageQueue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
      })

      // Process batch of messages
      const batch = this.messageQueue.splice(0, 10)
      
      for (const message of batch) {
        this.emit(message.type, message)
        
        // Notify specific component subscribers
        if (message.targetComponent) {
          this.emit(`${message.targetComponent}:${message.type}`, message)
        }

        // Add small delay for high-priority messages to prevent overwhelming
        if (message.priority === 'high') {
          await new Promise(resolve => setTimeout(resolve, 5))
        }
      }
    } catch (error) {
      console.error('Error processing message queue:', error)
    } finally {
      this.isProcessing = false
      
      // Continue processing if more messages arrived
      if (this.messageQueue.length > 0) {
        setTimeout(() => this.processMessageQueue(), 10)
      }
    }
  }

  // Start background message processor
  private startMessageProcessor(): void {
    setInterval(() => {
      this.processMessageQueue()
    }, 100) // Process every 100ms
  }

  // Get current queue stats
  getQueueStats(): { total: number; byPriority: Record<string, number> } {
    const byPriority = { high: 0, medium: 0, low: 0 }
    this.messageQueue.forEach(msg => byPriority[msg.priority]++)
    
    return {
      total: this.messageQueue.length,
      byPriority
    }
  }

  // Clear message queue (for testing/cleanup)
  clearQueue(): void {
    this.messageQueue = []
  }

  // Get subscriber count for monitoring
  getSubscriberCount(): number {
    let total = 0
    this.subscribers.forEach(set => total += set.size)
    return total
  }
}

// Singleton instance
export const eventBus = new EventBus()

// Convenience functions for common operations
export const dbEvents = {
  insert: (collection: string, data: any, userId?: string) => 
    eventBus.publishDBEvent(collection, 'insert', data, userId),
  
  update: (collection: string, data: any, userId?: string) => 
    eventBus.publishDBEvent(collection, 'update', data, userId),
  
  delete: (collection: string, data: any, userId?: string) => 
    eventBus.publishDBEvent(collection, 'delete', data, userId),
  
  sync: (collection: string, data: any) => 
    eventBus.publishDBEvent(collection, 'sync', data)
}

export const networkEvents = {
  online: () => eventBus.publishNetworkEvent('ONLINE'),
  offline: () => eventBus.publishNetworkEvent('OFFLINE'),
  syncComplete: (syncedItems: number) => 
    eventBus.publishNetworkEvent('SYNC_COMPLETE', { syncedItems }),
  syncFailed: (errors: string[]) => 
    eventBus.publishNetworkEvent('SYNC_FAILED', { errors })
}

export const uiEvents = {
  refresh: (component: string) => 
    eventBus.publishUIEvent(component, 'refresh'),
  
  filterChange: (component: string, filters: any) => 
    eventBus.publishUIEvent(component, 'filter_change', { filters }),
  
  tabChange: (component: string, tab: string) => 
    eventBus.publishUIEvent(component, 'tab_change', { tab })
}

// React hook for using event bus in components
export const useEventBus = () => {
  return {
    publish: eventBus.publish.bind(eventBus),
    subscribe: eventBus.subscribe.bind(eventBus),
    dbEvents,
    networkEvents,
    uiEvents,
    getQueueStats: eventBus.getQueueStats.bind(eventBus)
  }
}

// Initialize network event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => networkEvents.online())
  window.addEventListener('offline', () => networkEvents.offline())
}

export default eventBus