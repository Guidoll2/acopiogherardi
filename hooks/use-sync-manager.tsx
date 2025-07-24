"use client"

import { useEffect, useCallback } from 'react'
import { useOfflineData } from '@/contexts/offline-data-context'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { syncService } from '@/lib/sync-service'

export function useSyncManager() {
  const { isOnline, hasBeenOffline } = useNetworkStatus()
  const { autoSyncEnabled, forcSync } = useOfflineData()

  // Handle force sync requests
  const handleForceSyncRequest = useCallback(async () => {
    if (isOnline) {
      try {
        await forcSync()
        console.log('🔄 Force sync completed successfully')
      } catch (error) {
        console.error('❌ Force sync failed:', error)
      }
    }
  }, [isOnline, forcSync])

  // Handle network status changes
  const handleNetworkOnline = useCallback(async () => {
    if (hasBeenOffline && autoSyncEnabled) {
      console.log('🌐 Network back online, starting auto-sync...')
      try {
        await syncService.autoSync()
      } catch (error) {
        console.error('❌ Auto-sync on reconnect failed:', error)
      }
    }
  }, [hasBeenOffline, autoSyncEnabled])

  // Handle background sync from service worker
  const handleBackgroundSync = useCallback(async () => {
    if (isOnline && autoSyncEnabled) {
      console.log('🔄 Background sync triggered by service worker')
      try {
        await syncService.autoSync()
      } catch (error) {
        console.error('❌ Background sync failed:', error)
      }
    }
  }, [isOnline, autoSyncEnabled])

  useEffect(() => {
    // Listen for sync events
    window.addEventListener('forceSyncRequested', handleForceSyncRequest)
    window.addEventListener('networkOnline', handleNetworkOnline)
    window.addEventListener('backgroundSync', handleBackgroundSync)

    return () => {
      window.removeEventListener('forceSyncRequested', handleForceSyncRequest)
      window.removeEventListener('networkOnline', handleNetworkOnline)
      window.removeEventListener('backgroundSync', handleBackgroundSync)
    }
  }, [handleForceSyncRequest, handleNetworkOnline, handleBackgroundSync])

  return {
    isOnline,
    hasBeenOffline,
    autoSyncEnabled
  }
}
