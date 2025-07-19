// Query Adapter Service for Gradual Migration
// Provides seamless transition between legacy and new database structures

import NeDBSetup, { DatabaseCollections, TwoDatabaseCollections } from '../db/nedb-setup'

export type DatabaseMode = 'legacy' | 'new' | 'hybrid'

export interface QueryAdapterConfig {
  mode: DatabaseMode
  preferNew: boolean  // In hybrid mode, prefer new database when available
  fallbackEnabled: boolean  // Fallback to legacy if new database fails
}

export class QueryAdapterService {
  private dbSetup: NeDBSetup
  private legacyDb: DatabaseCollections
  private newDb: TwoDatabaseCollections
  private config: QueryAdapterConfig

  constructor(config: QueryAdapterConfig = {
    mode: 'legacy',
    preferNew: false,
    fallbackEnabled: true
  }) {
    this.dbSetup = NeDBSetup.getInstance()
    this.legacyDb = this.dbSetup.getDatabases()
    this.newDb = this.dbSetup.getTwoDatabases()
    this.config = config
  }

  // Update adapter configuration
  updateConfig(newConfig: Partial<QueryAdapterConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('🔧 Query adapter config updated:', this.config)
  }

  // Get collection based on current mode and configuration
  async getCollection(collectionName: string): Promise<any> {
    const isAdminCollection = this.isAdminCollection(collectionName)
    
    switch (this.config.mode) {
      case 'legacy':
        return this.getLegacyCollection(collectionName)
        
      case 'new':
        return this.getNewCollection(collectionName, isAdminCollection)
        
      case 'hybrid':
        return this.getHybridCollection(collectionName, isAdminCollection)
        
      default:
        throw new Error(`Unknown database mode: ${this.config.mode}`)
    }
  }

  // Check if collection contains admin-related data
  private isAdminCollection(collectionName: string): boolean {
    const adminCollections = [
      'admin_users',
      'admin_roles', 
      'permission_atoms',
      'permission_audit_logs'
    ]
    return adminCollections.includes(collectionName)
  }

  // Get collection from legacy database
  private getLegacyCollection(collectionName: string): any {
    const collection = (this.legacyDb as any)[collectionName]
    if (!collection) {
      throw new Error(`Legacy collection ${collectionName} not found`)
    }
    return collection
  }

  // Get collection from new database structure
  private async getNewCollection(collectionName: string, isAdminCollection: boolean): Promise<any> {
    const targetDb = isAdminCollection ? this.newDb.admin : this.newDb.application
    
    // Return wrapper that filters by collection name
    return {
      find: (query: any, callback: (err: any, docs: any[]) => void) => {
        const enhancedQuery = { ...query, _collection: collectionName }
        targetDb.find(enhancedQuery, callback)
      },
      
      findOne: (query: any, callback: (err: any, doc: any) => void) => {
        const enhancedQuery = { ...query, _collection: collectionName }
        targetDb.findOne(enhancedQuery, callback)
      },
      
      insert: (doc: any, callback: (err: any, newDoc: any) => void) => {
        const enhancedDoc = { ...doc, _collection: collectionName, _migrated: new Date() }
        targetDb.insert(enhancedDoc, callback)
      },
      
      update: (query: any, update: any, options: any, callback: (err: any, numReplaced: number) => void) => {
        const enhancedQuery = { ...query, _collection: collectionName }
        targetDb.update(enhancedQuery, update, options, callback)
      },
      
      remove: (query: any, options: any, callback: (err: any, numRemoved: number) => void) => {
        const enhancedQuery = { ...query, _collection: collectionName }
        targetDb.remove(enhancedQuery, options, callback)
      },
      
      count: (query: any, callback: (err: any, count: number) => void) => {
        const enhancedQuery = { ...query, _collection: collectionName }
        targetDb.count(enhancedQuery, callback)
      }
    }
  }

  // Get collection using hybrid approach (try new, fallback to legacy)
  private async getHybridCollection(collectionName: string, isAdminCollection: boolean): Promise<any> {
    if (this.config.preferNew) {
      try {
        // Check if data exists in new database
        const hasData = await this.hasDataInNewDatabase(collectionName, isAdminCollection)
        if (hasData) {
          console.log(`📊 Using new database for ${collectionName}`)
          return this.getNewCollection(collectionName, isAdminCollection)
        }
      } catch (error) {
        console.warn(`⚠️  Failed to check new database for ${collectionName}, falling back to legacy`)
      }
    }

    console.log(`📊 Using legacy database for ${collectionName}`)
    return this.getLegacyCollection(collectionName)
  }

  // Check if collection has data in new database
  private async hasDataInNewDatabase(collectionName: string, isAdminCollection: boolean): Promise<boolean> {
    const targetDb = isAdminCollection ? this.newDb.admin : this.newDb.application
    
    return new Promise((resolve) => {
      targetDb.count({ _collection: collectionName }, (err: any, count: number) => {
        if (err) {
          resolve(false)
        } else {
          resolve(count > 0)
        }
      })
    })
  }

  // Adaptive query method that automatically selects best database
  async adaptiveQuery<T>(
    collectionName: string,
    operation: 'find' | 'findOne' | 'insert' | 'update' | 'remove' | 'count',
    ...args: any[]
  ): Promise<T> {
    const collection = await this.getCollection(collectionName)
    
    return new Promise((resolve, reject) => {
      const callback = (err: any, result: T) => {
        if (err) {
          // If new database fails and fallback is enabled, try legacy
          if (this.config.mode === 'new' && this.config.fallbackEnabled) {
            console.warn(`⚠️  New database failed for ${collectionName}, trying fallback`)
            this.fallbackQuery(collectionName, operation, args)
              .then(resolve)
              .catch(reject)
          } else {
            reject(err)
          }
        } else {
          resolve(result)
        }
      }

      // Execute operation with callback
      ;(collection[operation] as Function)(...args, callback)
    })
  }

  // Fallback query to legacy database
  private async fallbackQuery<T>(
    collectionName: string,
    operation: string,
    args: any[]
  ): Promise<T> {
    const legacyCollection = this.getLegacyCollection(collectionName)
    
    return new Promise((resolve, reject) => {
      const callback = (err: any, result: T) => {
        if (err) reject(err)
        else resolve(result)
      }

      ;(legacyCollection[operation] as Function)(...args, callback)
    })
  }

  // Migration-aware service methods for common operations
  async findUser(query: any): Promise<any> {
    return this.adaptiveQuery('users', 'findOne', query)
  }

  async findEvent(query: any): Promise<any> {
    return this.adaptiveQuery('events', 'findOne', query)
  }

  async findAdminUser(query: any): Promise<any> {
    return this.adaptiveQuery('admin_users', 'findOne', query)
  }

  async createUser(userData: any): Promise<any> {
    return this.adaptiveQuery('users', 'insert', userData)
  }

  async createEvent(eventData: any): Promise<any> {
    return this.adaptiveQuery('events', 'insert', eventData)
  }

  async updateUser(query: any, update: any, options: any = {}): Promise<number> {
    return this.adaptiveQuery('users', 'update', query, update, options)
  }

  async updateEvent(query: any, update: any, options: any = {}): Promise<number> {
    return this.adaptiveQuery('events', 'update', query, update, options)
  }

  // Get system statistics across both database structures
  async getSystemStats(): Promise<{
    legacy: { [collection: string]: number }
    new: { admin: number; application: number }
    mode: DatabaseMode
  }> {
    const legacyStats: { [collection: string]: number } = {}
    const newStats = { admin: 0, application: 0 }

    // Count legacy collections
    for (const [name, collection] of Object.entries(this.legacyDb)) {
      try {
        legacyStats[name] = await new Promise<number>((resolve, reject) => {
          collection.count({}, (err: any, count: number) => {
            if (err) reject(err)
            else resolve(count)
          })
        })
      } catch (error) {
        legacyStats[name] = 0
      }
    }

    // Count new databases
    try {
      newStats.admin = await new Promise<number>((resolve, reject) => {
        this.newDb.admin.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      })

      newStats.application = await new Promise<number>((resolve, reject) => {
        this.newDb.application.count({}, (err: any, count: number) => {
          if (err) reject(err)
          else resolve(count)
        })
      })
    } catch (error) {
      console.warn('⚠️  Failed to get new database stats:', error)
    }

    return {
      legacy: legacyStats,
      new: newStats,
      mode: this.config.mode
    }
  }

  // Health check for both database structures
  async healthCheck(): Promise<{
    legacy: boolean
    new: boolean
    mode: DatabaseMode
    issues: string[]
  }> {
    const issues: string[] = []
    let legacyHealthy = true
    let newHealthy = true

    // Test legacy database
    try {
      await new Promise<void>((resolve, reject) => {
        this.legacyDb.users.count({}, (err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })
    } catch (error) {
      legacyHealthy = false
      issues.push(`Legacy database issue: ${error}`)
    }

    // Test new database
    try {
      await new Promise<void>((resolve, reject) => {
        this.newDb.admin.count({}, (err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })
      
      await new Promise<void>((resolve, reject) => {
        this.newDb.application.count({}, (err: any) => {
          if (err) reject(err)
          else resolve()
        })
      })
    } catch (error) {
      newHealthy = false
      issues.push(`New database issue: ${error}`)
    }

    return {
      legacy: legacyHealthy,
      new: newHealthy,
      mode: this.config.mode,
      issues
    }
  }
}

// Global instance for application use
export const queryAdapter = new QueryAdapterService()

export default QueryAdapterService