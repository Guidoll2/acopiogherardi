"use client"

import { useState, useEffect } from 'react'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

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
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)

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

  const connectionQuality = getConnectionQuality()

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
    if (minutes === 1) return 'hace 1 minuto'
    if (minutes < 60) return `hace ${minutes} minutos`
    
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return 'hace 1 hora'
    if (hours < 24) return `hace ${hours} horas`
    
    return date.toLocaleDateString()
  }

  if (!hasBeenOffline && isOnline && connectionQuality === 'good') {
    return null // No mostrar nada si todo está bien
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500'
    if (connectionQuality === 'poor') return 'bg-orange-500'
    if (pendingCount > 0) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (!isOnline) return 'Sin conexión'
    if (syncInProgress) return 'Sincronizando...'
    if (pendingCount > 0) return `${pendingCount} cambios pendientes`
    if (connectionQuality === 'poor') return 'Conexión lenta'
    return 'Conectado'
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    if (syncInProgress) return <RefreshCw className="h-4 w-4 animate-spin" />
    if (pendingCount > 0) return <Clock className="h-4 w-4" />
    if (connectionQuality === 'poor') return <AlertTriangle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <div className={`fixed left-0 right-0 z-50 ${position === 'top' ? 'top-0' : 'bottom-0'}`}>
      <div className={`${getStatusColor()} text-white px-4 py-2 text-sm`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
            
            {showDetails && (
              <div className="flex items-center space-x-4 text-xs opacity-90">
                {effectiveType && (
                  <Badge variant="secondary" className="text-white border-white/30 bg-white/20">
                    {effectiveType.toUpperCase()}
                  </Badge>
                )}
                
                {lastSyncTime && (
                  <span>Última sync: {formatLastSync(lastSyncTime)}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isOnline && (
              <span className="text-xs opacity-90">
                Los cambios se guardarán localmente
              </span>
            )}
            
            {isOnline && pendingCount > 0 && !syncInProgress && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncClick}
                className="text-white border-white/30 hover:bg-white/10 h-6 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sincronizar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar en la esquina (versión compacta)
export function NetworkStatusBadge() {
  const { isOnline, getConnectionQuality } = useNetworkStatus()
  const connectionQuality = getConnectionQuality()

  const getColor = () => {
    if (!isOnline) return 'bg-red-500'
    if (connectionQuality === 'poor') return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />
    return <Wifi className="h-3 w-3" />
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <Badge className={`${getColor()} text-white border-0`}>
        {getIcon()}
        <span className="ml-1 text-xs">
          {!isOnline ? 'Offline' : connectionQuality === 'poor' ? 'Lento' : 'Online'}
        </span>
      </Badge>
    </div>
  )
}
