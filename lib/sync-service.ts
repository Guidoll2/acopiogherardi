/**
 * Servicio de sincronización inteligente para datos offline
 * Maneja conflictos, retries y sincronización en background
 */

import { offlineStorage, PendingAction } from './offline-storage'
import type { Operation, Client, Driver, Silo, Cereal, Company, User } from '@/types'

export interface SyncResult {
  success: boolean
  processedActions: number
  failedActions: number
  conflicts: ConflictResolution[]
  errors: SyncError[]
}

export interface ConflictResolution {
  actionId: string
  entity: string
  resolution: 'local_wins' | 'server_wins' | 'merge' | 'manual_required'
  localData: any
  serverData: any
  resolvedData?: any
}

export interface SyncError {
  actionId: string
  error: string
  retryable: boolean
  action: PendingAction
}

export interface SyncOptions {
  maxRetries?: number
  conflictResolution?: 'local_wins' | 'server_wins' | 'merge'
  batchSize?: number
  timeout?: number
}

class SyncService {
  private static instance: SyncService
  private syncInProgress = false
  private lastSyncTime: Date | null = null
  private syncPromise: Promise<SyncResult> | null = null

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  async syncPendingData(options: SyncOptions = {}): Promise<SyncResult> {
    // Evitar múltiples sincronizaciones simultáneas
    if (this.syncInProgress) {
      console.log('🔄 Sync already in progress, waiting...')
      return this.syncPromise || this.getEmptyResult()
    }

    this.syncInProgress = true
    this.notifySyncStart()

    const defaultOptions: Required<SyncOptions> = {
      maxRetries: 3,
      conflictResolution: 'server_wins',
      batchSize: 10,
      timeout: 30000
    }

    const finalOptions = { ...defaultOptions, ...options }

    this.syncPromise = this.performSync(finalOptions)
    
    try {
      const result = await this.syncPromise
      this.lastSyncTime = new Date()
      return result
    } finally {
      this.syncInProgress = false
      this.syncPromise = null
      this.notifySyncEnd()
    }
  }

  private async performSync(options: Required<SyncOptions>): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      processedActions: 0,
      failedActions: 0,
      conflicts: [],
      errors: []
    }

    try {
      const pendingActions = await offlineStorage.getSyncQueue()
      console.log(`🔄 Starting sync for ${pendingActions.length} pending actions`)

      // Procesar en lotes
      for (let i = 0; i < pendingActions.length; i += options.batchSize) {
        const batch = pendingActions.slice(i, i + options.batchSize)
        await this.processBatch(batch, options, result)
      }

      result.success = result.failedActions === 0
      
      console.log(`✅ Sync completed: ${result.processedActions} processed, ${result.failedActions} failed`)

    } catch (error) {
      console.error('❌ Sync failed:', error)
      result.success = false
      result.errors.push({
        actionId: 'sync_process',
        error: error instanceof Error ? error.message : 'Unknown sync error',
        retryable: true,
        action: {} as PendingAction
      })
    }

    return result
  }

  private async processBatch(
    batch: PendingAction[],
    options: Required<SyncOptions>,
    result: SyncResult
  ): Promise<void> {
    const promises = batch.map(action => this.processAction(action, options))
    const results = await Promise.allSettled(promises)

    results.forEach((actionResult, index) => {
      const action = batch[index]
      
      if (actionResult.status === 'fulfilled') {
        if (actionResult.value.success) {
          result.processedActions++
        } else {
          result.failedActions++
          if (actionResult.value.conflict) {
            result.conflicts.push(actionResult.value.conflict)
          }
          if (actionResult.value.error) {
            result.errors.push(actionResult.value.error)
          }
        }
      } else {
        result.failedActions++
        result.errors.push({
          actionId: action.id,
          error: actionResult.reason?.message || 'Unknown error',
          retryable: true,
          action
        })
      }
    })
  }

  private async processAction(
    action: PendingAction,
    options: Required<SyncOptions>
  ): Promise<{
    success: boolean
    conflict?: ConflictResolution
    error?: SyncError
  }> {
    try {
      console.log(`🔄 Processing ${action.type} ${action.entity} (${action.id})`)

      switch (action.type) {
        case 'CREATE':
          return await this.syncCreateAction(action, options)
        case 'UPDATE':
          return await this.syncUpdateAction(action, options)
        case 'DELETE':
          return await this.syncDeleteAction(action, options)
        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }
    } catch (error) {
      console.error(`❌ Failed to process action ${action.id}:`, error)
      
      // Incrementar contador de reintentos
      action.retryCount++
      
      if (action.retryCount < options.maxRetries) {
        await offlineStorage.updateSyncQueueAction(action.id, { retryCount: action.retryCount })
        return {
          success: false,
          error: {
            actionId: action.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            retryable: true,
            action
          }
        }
      } else {
        // Máximo de reintentos alcanzado, remover de cola
        await offlineStorage.removeFromSyncQueue(action.id)
        return {
          success: false,
          error: {
            actionId: action.id,
            error: `Max retries (${options.maxRetries}) exceeded`,
            retryable: false,
            action
          }
        }
      }
    }
  }

  private async syncCreateAction(
    action: PendingAction,
    options: Required<SyncOptions>
  ): Promise<{ success: boolean; conflict?: ConflictResolution }> {
    try {
      // Enviar datos al servidor
      const response = await this.apiCall(`/api/${action.entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }

      const serverData = await response.json()
      const newItem = serverData[action.entity.slice(0, -1)] || serverData.data

      // Si tenía ID temporal, reemplazar en cache local
      if (action.tempId && newItem.id) {
        await offlineStorage.replaceTemporaryId(action.entity, action.tempId, newItem.id, newItem)
      }

      // Remover de cola de sincronización
      await offlineStorage.removeFromSyncQueue(action.id)

      console.log(`✅ Created ${action.entity} successfully, new ID: ${newItem.id}`)
      return { success: true }

    } catch (error) {
      console.error(`❌ Failed to create ${action.entity}:`, error)
      throw error
    }
  }

  private async syncUpdateAction(
    action: PendingAction,
    options: Required<SyncOptions>
  ): Promise<{ success: boolean; conflict?: ConflictResolution }> {
    try {
      const itemId = action.data.id
      
      // Obtener versión actual del servidor para detectar conflictos
      const currentResponse = await this.apiCall(`/api/${action.entity}/${itemId}`)
      
      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        const serverItem = currentData[action.entity.slice(0, -1)] || currentData.data

        // Verificar si hay conflicto (comparar timestamps)
        const serverUpdated = new Date(serverItem.updated_at || serverItem.updatedAt)
        const localUpdated = new Date(action.data.updated_at || action.data.updatedAt)
        
        if (serverUpdated > localUpdated) {
          // Conflicto detectado, aplicar estrategia de resolución
          const conflict = await this.resolveUpdateConflict(action, serverItem, options.conflictResolution)
          if (conflict.resolution === 'manual_required') {
            return { success: false, conflict }
          }
          
          // Aplicar resolución automática
          action.data = conflict.resolvedData
        }
      }

      // Enviar actualización al servidor
      const response = await this.apiCall(`/api/${action.entity}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }

      const updatedData = await response.json()
      const updatedItem = updatedData[action.entity.slice(0, -1)] || updatedData.data

      // Actualizar cache local
      await offlineStorage.saveItem(action.entity, updatedItem)

      // Remover de cola de sincronización
      await offlineStorage.removeFromSyncQueue(action.id)

      console.log(`✅ Updated ${action.entity} ${itemId} successfully`)
      return { success: true }

    } catch (error) {
      console.error(`❌ Failed to update ${action.entity}:`, error)
      throw error
    }
  }

  private async syncDeleteAction(
    action: PendingAction,
    options: Required<SyncOptions>
  ): Promise<{ success: boolean }> {
    try {
      const itemId = action.data.id

      const response = await this.apiCall(`/api/${action.entity}/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }

      // Remover del cache local
      await offlineStorage.deleteItem(action.entity, itemId)

      // Remover de cola de sincronización
      await offlineStorage.removeFromSyncQueue(action.id)

      console.log(`✅ Deleted ${action.entity} ${itemId} successfully`)
      return { success: true }

    } catch (error) {
      console.error(`❌ Failed to delete ${action.entity}:`, error)
      throw error
    }
  }

  private async resolveUpdateConflict(
    action: PendingAction,
    serverData: any,
    strategy: 'local_wins' | 'server_wins' | 'merge'
  ): Promise<ConflictResolution> {
    const conflict: ConflictResolution = {
      actionId: action.id,
      entity: action.entity,
      resolution: strategy,
      localData: action.data,
      serverData
    }

    switch (strategy) {
      case 'local_wins':
        conflict.resolvedData = action.data
        break
        
      case 'server_wins':
        conflict.resolvedData = serverData
        break
        
      case 'merge':
        // Merge inteligente de campos
        conflict.resolvedData = this.mergeData(action.data, serverData)
        break
        
      default:
        conflict.resolution = 'manual_required'
        break
    }

    return conflict
  }

  private mergeData(localData: any, serverData: any): any {
    // Estrategia de merge simple: campos más recientes ganan
    const merged = { ...serverData }
    
    // Comparar campos individuales por timestamp si están disponibles
    Object.keys(localData).forEach(key => {
      if (key !== 'id' && key !== 'updated_at' && key !== 'updatedAt') {
        // Por simplicidad, mantener cambios locales para campos específicos
        if (localData[key] !== serverData[key]) {
          merged[key] = localData[key]
        }
      }
    })

    merged.updated_at = new Date().toISOString()
    
    return merged
  }

  private async apiCall(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  private notifySyncStart(): void {
    window.dispatchEvent(new CustomEvent('syncStart'))
  }

  private notifySyncEnd(): void {
    window.dispatchEvent(new CustomEvent('syncEnd'))
  }

  private getEmptyResult(): SyncResult {
    return {
      success: true,
      processedActions: 0,
      failedActions: 0,
      conflicts: [],
      errors: []
    }
  }

  // Métodos públicos para obtener estado
  isSyncInProgress(): boolean {
    return this.syncInProgress
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime
  }

  // Sincronización automática cuando se detecta conectividad
  async autoSync(): Promise<void> {
    try {
      const pendingActions = await offlineStorage.getSyncQueue()
      if (pendingActions.length > 0) {
        console.log(`🔄 Auto-sync triggered for ${pendingActions.length} pending actions`)
        await this.syncPendingData()
      }
    } catch (error) {
      console.error('❌ Auto-sync failed:', error)
    }
  }
}

// Instancia singleton
export const syncService = SyncService.getInstance()

// Hook para usar servicio de sincronización
export function useSyncService() {
  return syncService
}
