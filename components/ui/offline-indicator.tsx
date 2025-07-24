"use client"

import { useState, useEffect } from 'react'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { useOfflineNavigation } from '@/hooks/use-offline-navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Clock, Navigation, X } from 'lucide-react'

interface OfflineIndicatorProps {
  showDetails?: boolean
  position?: 'top' | 'bottom'
  onSyncRequested?: () => void
}

export function OfflineIndicator({ 
  showDetails = false, 
  position = 'top',
  onSyncRequested 
}: OfflineIndicatorProps) {
  const { isOnline, hasBeenOffline, getConnectionQuality, effectiveType } = useNetworkStatus()
  const { preCacheDashboardRoutes } = useOfflineNavigation()
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Escuchar eventos de sincronización
    const handleSyncStart = () => setSyncInProgress(true)
    const handleSyncEnd = () => {
      setSyncInProgress(false)
      setLastSyncTime(new Date())
    }
    const handlePendingChange = (event: Event) => {
      const customEvent = event as CustomEvent
      setPendingCount(customEvent.detail?.count || 0)
    }

    window.addEventListener('syncStart', handleSyncStart)
    window.addEventListener('syncEnd', handleSyncEnd)
    window.addEventListener('pendingChangesUpdate', handlePendingChange as EventListener)

    return () => {
      window.removeEventListener('syncStart', handleSyncStart)
      window.removeEventListener('syncEnd', handleSyncEnd)
      window.removeEventListener('pendingChangesUpdate', handlePendingChange as EventListener)
    }
  }, [])

  const handleSyncClick = () => {
    if (onSyncRequested && !syncInProgress) {
      onSyncRequested()
    } else if (!onSyncRequested && !syncInProgress) {
      // Handle sync internally if no handler provided
      window.dispatchEvent(new CustomEvent('forceSyncRequested'))
    }
  }

  const formatLastSync = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'hace un momento'
    if (minutes < 60) return `hace ${minutes}m`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `hace ${hours}h`
    
    const days = Math.floor(hours / 24)
    return `hace ${days}d`
  }

  // Solo mostrar si está offline
  if (isOnline) return null

  return (
    <div className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 z-50`}>
      <div 
        className={`transition-all duration-300 ${
          isExpanded 
            ? 'bg-red-600 text-white p-4 rounded-lg shadow-lg min-w-[300px]' 
            : 'bg-red-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-110'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {!isExpanded ? (
          // Icono compacto
          <div className="flex items-center justify-center relative">
            <WifiOff className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </div>
        ) : (
          // Vista expandida
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-5 w-5" />
                <span className="font-medium">Modo Offline</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(false)
                }}
                className="hover:bg-red-700 rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-sm space-y-2">
              <p>Sin conexión a internet</p>
              
              {pendingCount > 0 && (
                <div className="flex items-center space-x-2 text-orange-200">
                  <Clock className="h-4 w-4" />
                  <span>{pendingCount} cambios pendientes</span>
                </div>
              )}
              
              {lastSyncTime && (
                <div className="text-xs opacity-90">
                  Última sync: {formatLastSync(lastSyncTime)}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncClick}
                disabled={syncInProgress}
                className="text-white border-white/30 hover:bg-white/10 flex-1"
              >
                {syncInProgress ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                {syncInProgress ? 'Sincronizando...' : 'Reintentar'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => preCacheDashboardRoutes()}
                className="text-white border-white/30 hover:bg-white/10"
                title="Pre-cachear páginas"
              >
                <Navigation className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-xs opacity-75">
              Los cambios se guardan localmente y se sincronizarán cuando vuelva la conexión
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para mostrar en la esquina (versión compacta)
export function NetworkStatusBadge() {
  const { isOnline } = useNetworkStatus()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handlePendingChange = (event: Event) => {
      const customEvent = event as CustomEvent
      setPendingCount(customEvent.detail?.count || 0)
    }

    window.addEventListener('pendingChangesUpdate', handlePendingChange as EventListener)
    return () => {
      window.removeEventListener('pendingChangesUpdate', handlePendingChange as EventListener)
    }
  }, [])

  // Solo mostrar si hay cambios pendientes cuando está online
  if (!isOnline || pendingCount === 0) return null

  return (
    <div className="fixed top-4 right-20 z-40">
      <Badge variant="secondary" className="bg-orange-500 text-white border-0">
        <Clock className="h-3 w-3 mr-1" />
        {pendingCount} pendientes
      </Badge>
    </div>
  )
}
