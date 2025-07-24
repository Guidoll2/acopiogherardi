/**
 * Sistema de almacenamiento offline híbrido usando IndexedDB
 * Maneja cache, sincronización y recuperación de datos
 */

export interface PendingAction {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: 'operations' | 'clients' | 'drivers' | 'silos' | 'cereals' | 'companies' | 'users'
  data: any
  timestamp: number
  retryCount: number
  tempId?: string
  realId?: string
}

export interface StorageStats {
  totalSize: number
  pendingActions: number
  lastSync: Date | null
  cacheAge: Record<string, Date>
}

class OfflineStorage {
  private dbName = 'acopio-offline-db'
  private version = 2
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  constructor() {
    // Solo inicializar en el cliente (browser)
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initPromise = this.init()
    } else {
      // En el servidor, crear un Promise resuelto para evitar errores
      this.initPromise = Promise.resolve()
    }
  }

  async init(): Promise<void> {
    // Verificar que estemos en el cliente antes de acceder a IndexedDB
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not available (server-side or unsupported browser)')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        
        // Crear stores para cada entidad
        this.createStore('operations')
        this.createStore('clients')
        this.createStore('drivers')
        this.createStore('silos')
        this.createStore('cereals')
        this.createStore('companies')
        this.createStore('users')
        
        // Store para acciones pendientes de sincronización
        this.createStore('sync-queue')
        
        // Store para metadatos y configuración
        this.createStore('metadata')
        
        console.log('🏗️ IndexedDB: Database schema created')
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        console.log('✅ IndexedDB: Database connected')
        resolve()
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Failed to open database')
        reject(request.error)
      }
    })
  }

  private createStore(storeName: string) {
    if (!this.db) return

    if (!this.db.objectStoreNames.contains(storeName)) {
      const store = this.db.createObjectStore(storeName, { keyPath: 'id' })
      
      // Índices útiles
      if (storeName !== 'metadata' && storeName !== 'sync-queue') {
        store.createIndex('created_at', 'created_at', { unique: false })
        store.createIndex('updated_at', 'updated_at', { unique: false })
      }
      
      if (storeName === 'sync-queue') {
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('entity', 'entity', { unique: false })
      }
      
      console.log(`📦 IndexedDB: Store '${storeName}' created`)
    }
  }

  private async ensureReady(): Promise<void> {
    // Solo esperar inicialización si estamos en el cliente
    if (typeof window !== 'undefined' && this.initPromise) {
      await this.initPromise
    }
  }

  private isClientSide(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window
  }

  // Operaciones básicas de datos
  async saveData(storeName: string, data: any[]): Promise<void> {
    if (!this.isClientSide()) {
      console.warn('IndexedDB not available (server-side), skipping saveData')
      return
    }

    await this.ensureReady()
    if (!this.db) throw new Error('Database not initialized')

    const transaction = this.db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    // Limpiar store existente
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear()
      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    })

    // Agregar nuevos datos
    for (const item of data) {
      await new Promise<void>((resolve, reject) => {
        const request = store.add({
          ...item,
          _cachedAt: new Date().toISOString()
        })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }

    // Actualizar metadatos de cache
    await this.updateCacheMetadata(storeName)
    
    console.log(`💾 IndexedDB: Saved ${data.length} items to '${storeName}'`)
  }

  async getData(storeName: string): Promise<any[]> {
    if (!this.isClientSide()) {
      console.warn('IndexedDB not available (server-side), returning empty array')
      return []
    }

    await this.ensureReady()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const data = request.result.map(item => {
          const { _cachedAt, ...cleanItem } = item
          return cleanItem
        })
        resolve(data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveItem(storeName: string, item: any): Promise<void> {
    if (!this.isClientSide()) {
      console.warn('IndexedDB not available (server-side), skipping saveItem')
      return
    }

    await this.ensureReady()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put({
        ...item,
        _cachedAt: new Date().toISOString()
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getItem(storeName: string, id: string): Promise<any | null> {
    await this.ensureReady()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => {
        if (request.result) {
          const { _cachedAt, ...cleanItem } = request.result
          resolve(cleanItem)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteItem(storeName: string, id: string): Promise<void> {
    await this.ensureReady()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Sistema de cola de sincronización
  async addToSyncQueue(action: Omit<PendingAction, 'id' | 'retryCount'>): Promise<string> {
    if (!this.isClientSide()) {
      console.warn('IndexedDB not available (server-side), skipping sync queue')
      return `temp_${Date.now()}`
    }

    const actionWithId: PendingAction = {
      ...action,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0
    }

    await this.saveItem('sync-queue', actionWithId)
    
    // Disparar evento para notificar cambios pendientes
    this.notifyPendingChanges()
    
    console.log(`📝 Sync Queue: Added action ${actionWithId.type} for ${actionWithId.entity}`)
    return actionWithId.id
  }

  async getSyncQueue(): Promise<PendingAction[]> {
    if (!this.isClientSide()) {
      return []
    }
    
    const queue = await this.getData('sync-queue')
    return queue.sort((a, b) => a.timestamp - b.timestamp)
  }

  async removeFromSyncQueue(actionId: string): Promise<void> {
    if (!this.isClientSide()) {
      return
    }

    await this.deleteItem('sync-queue', actionId)
    this.notifyPendingChanges()
    console.log(`✅ Sync Queue: Removed action ${actionId}`)
  }

  async updateSyncQueueAction(actionId: string, updates: Partial<PendingAction>): Promise<void> {
    const existingAction = await this.getItem('sync-queue', actionId)
    if (existingAction) {
      await this.saveItem('sync-queue', { ...existingAction, ...updates })
    }
  }

  private async notifyPendingChanges(): Promise<void> {
    if (!this.isClientSide()) {
      return
    }

    const queue = await this.getSyncQueue()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pendingChangesUpdate', {
        detail: { count: queue.length, actions: queue }
      }))
    }
  }

  // Manejo de IDs temporales
  async replaceTemporaryId(storeName: string, tempId: string, realId: string, newData?: any): Promise<void> {
    if (!this.isClientSide()) {
      return
    }

    await this.ensureReady()
    if (!this.db) throw new Error('Database not initialized')

    const transaction = this.db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    // Obtener item con ID temporal
    const getRequest = store.get(tempId)
    
    await new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = async () => {
        const tempItem = getRequest.result
        if (tempItem) {
          // Eliminar item temporal
          await new Promise<void>((resolve2, reject2) => {
            const deleteRequest = store.delete(tempId)
            deleteRequest.onsuccess = () => resolve2()
            deleteRequest.onerror = () => reject2(deleteRequest.error)
          })

          // Agregar item con ID real
          const realItem = {
            ...tempItem,
            ...newData,
            id: realId,
            _cachedAt: new Date().toISOString()
          }

          await new Promise<void>((resolve3, reject3) => {
            const putRequest = store.put(realItem)
            putRequest.onsuccess = () => resolve3()
            putRequest.onerror = () => reject3(putRequest.error)
          })
        }
        resolve()
      }
      getRequest.onerror = () => reject(getRequest.error)
    })

    console.log(`🔄 IndexedDB: Replaced temporary ID ${tempId} with real ID ${realId}`)
  }

  // Metadatos y estadísticas
  private async updateCacheMetadata(storeName: string): Promise<void> {
    const metadata = {
      id: `cache_${storeName}`,
      storeName,
      lastUpdated: new Date().toISOString(),
      timestamp: Date.now()
    }
    await this.saveItem('metadata', metadata)
  }

  async getCacheAge(storeName: string): Promise<Date | null> {
    if (!this.isClientSide()) {
      return null
    }

    const metadata = await this.getItem('metadata', `cache_${storeName}`)
    return metadata ? new Date(metadata.lastUpdated) : null
  }

  async getStorageStats(): Promise<StorageStats> {
    if (!this.isClientSide()) {
      return {
        totalSize: 0,
        pendingActions: 0,
        lastSync: null,
        cacheAge: {}
      }
    }

    const pendingActions = await this.getSyncQueue()
    const stores = ['operations', 'clients', 'drivers', 'silos', 'cereals', 'companies', 'users']
    const cacheAge: Record<string, Date> = {}

    for (const store of stores) {
      const age = await this.getCacheAge(store)
      if (age) cacheAge[store] = age
    }

    return {
      totalSize: 0, // TODO: Calcular tamaño real
      pendingActions: pendingActions.length,
      lastSync: null, // TODO: Implementar tracking de última sync
      cacheAge
    }
  }

  // Limpieza de cache
  async clearCache(storeName?: string): Promise<void> {
    if (!this.isClientSide()) {
      return
    }

    if (storeName) {
      await this.saveData(storeName, [])
      console.log(`🧹 IndexedDB: Cleared cache for '${storeName}'`)
    } else {
      const stores = ['operations', 'clients', 'drivers', 'silos', 'cereals', 'companies', 'users']
      for (const store of stores) {
        await this.saveData(store, [])
      }
      console.log('🧹 IndexedDB: Cleared all cache')
    }
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.isClientSide()) {
      return
    }

    await this.saveData('sync-queue', [])
    this.notifyPendingChanges()
    console.log('🧹 IndexedDB: Cleared sync queue')
  }
}

// Instancia singleton
export const offlineStorage = new OfflineStorage()

// Hook para usar almacenamiento offline
export function useOfflineStorage() {
  return offlineStorage
}
