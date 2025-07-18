import Datastore from 'nedb'
import path from 'path'
import fs from 'fs'

export class NeDBSetup {
  private static instance: NeDBSetup
  private databases: {
    users: Datastore
    events: Datastore
    bookings: Datastore
    sync_queue: Datastore
    admin_users: Datastore
    admin_roles: Datastore
    permission_atoms: Datastore
    interviewers: Datastore
    appointment_bookings: Datastore
    audit_logs: Datastore
  }

  private constructor() {
    try {
      // 根據環境選擇數據目錄
      // 即使在測試環境中也使用持久化存儲，而非內存數據庫
      const dataDir = process.env.NODE_ENV === 'test' 
        ? path.join(__dirname, '../../test_data') 
        : path.join(__dirname, '../../data');
      
      // 創建數據目錄（如果不存在）
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      // 初始化數據庫 - 在所有環境中都使用持久化存儲
      // 重要規則：始終使用持久化存儲，而非內存數據庫
      this.databases = {
        users: new Datastore({ filename: path.join(dataDir, 'users.db'), autoload: true }),
        events: new Datastore({ filename: path.join(dataDir, 'events.db'), autoload: true }),
        bookings: new Datastore({ filename: path.join(dataDir, 'bookings.db'), autoload: true }),
        sync_queue: new Datastore({ filename: path.join(dataDir, 'sync_queue.db'), autoload: true }),
        admin_users: new Datastore({ filename: path.join(dataDir, 'admin_users.db'), autoload: true }),
        admin_roles: new Datastore({ filename: path.join(dataDir, 'admin_roles.db'), autoload: true }),
        permission_atoms: new Datastore({ filename: path.join(dataDir, 'permission_atoms.db'), autoload: true }),
        interviewers: new Datastore({ filename: path.join(dataDir, 'interviewers.db'), autoload: true }),
        appointment_bookings: new Datastore({ filename: path.join(dataDir, 'appointment_bookings.db'), autoload: true }),
        audit_logs: new Datastore({ filename: path.join(dataDir, 'audit_logs.db'), autoload: true })
      }

      // 創建索引
      this.databases.users.ensureIndex({ fieldName: 'email', unique: true })
      this.databases.admin_users.ensureIndex({ fieldName: 'email', unique: true })
      this.databases.admin_users.ensureIndex({ fieldName: 'username', unique: true })
      this.databases.admin_roles.ensureIndex({ fieldName: 'roleId', unique: true })
      this.databases.permission_atoms.ensureIndex({ fieldName: 'atomId', unique: true })
      
      console.log('💾 NeDB databases initialized with persistent storage at:', dataDir)
    } catch (error) {
      console.error('❌ Error initializing databases:', error)
      
      // 如果持久化存儲初始化失敗，使用內存數據庫作為臨時解決方案
      // 注意：這只是為了防止應用程序崩潰，不應該在生產環境中依賴這種行為
      console.warn('⚠️ WARNING: Falling back to in-memory databases due to initialization error')
      console.warn('⚠️ This is NOT recommended for production use')
      
      this.databases = {
        users: new Datastore(),
        events: new Datastore(),
        bookings: new Datastore(),
        sync_queue: new Datastore(),
        admin_users: new Datastore(),
        admin_roles: new Datastore(),
        permission_atoms: new Datastore(),
        interviewers: new Datastore(),
        appointment_bookings: new Datastore(),
        audit_logs: new Datastore()
      }
      
      // 創建索引
      this.databases.users.ensureIndex({ fieldName: 'email', unique: true })
      this.databases.admin_users.ensureIndex({ fieldName: 'email', unique: true })
      this.databases.admin_users.ensureIndex({ fieldName: 'username', unique: true })
      this.databases.admin_roles.ensureIndex({ fieldName: 'roleId', unique: true })
      this.databases.permission_atoms.ensureIndex({ fieldName: 'atomId', unique: true })
    }
  }

  public static getInstance(): NeDBSetup {
    if (!NeDBSetup.instance) {
      NeDBSetup.instance = new NeDBSetup()
    }
    return NeDBSetup.instance
  }

  public getDatabases() {
    return this.databases
  }
}
