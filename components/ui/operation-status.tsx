"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface OperationStatusProps {
  operation: any
  isOnline: boolean
  onRetrySync?: () => void
}

export function OperationStatus({ operation, isOnline, onRetrySync }: OperationStatusProps) {
  const isTemporary = operation.id?.startsWith('temp_')
  const needsSync = operation._needsSync || false
  const isOfflineCreated = operation._offline || false

  const getStatusBadge = () => {
    if (isTemporary) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      )
    }

    if (needsSync) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <RefreshCw className="h-3 w-3 mr-1" />
          Por sincronizar
        </Badge>
      )
    }

    if (isOfflineCreated) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sincronizado
        </Badge>
      )
    }

    return null
  }

  const getNetworkIndicator = () => {
    if (!isOnline) {
      return (
        <div className="flex items-center text-red-600 text-xs">
          <WifiOff className="h-3 w-3 mr-1" />
          Sin conexión
        </div>
      )
    }

    return (
      <div className="flex items-center text-green-600 text-xs">
        <Wifi className="h-3 w-3 mr-1" />
        En línea
      </div>
    )
  }

  const statusBadge = getStatusBadge()

  if (!statusBadge && isOnline) {
    return null // No mostrar nada si está todo OK
  }

  return (
    <div className="flex items-center space-x-2 text-xs">
      {statusBadge}
      {getNetworkIndicator()}
      
      {isTemporary && isOnline && onRetrySync && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetrySync}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reintentar
        </Button>
      )}
    </div>
  )
}

// Componente para mostrar resumen de estado offline
export function OfflineStatusSummary({ 
  totalOperations = 0,
  pendingOperations = 0,
  isOnline = true,
  lastSyncTime = null 
}: {
  totalOperations?: number
  pendingOperations?: number
  isOnline?: boolean
  lastSyncTime?: Date | null
}) {
  if (pendingOperations === 0 && isOnline) {
    return null
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'hace un momento'
    if (minutes < 60) return `hace ${minutes} minutos`
    return date.toLocaleTimeString()
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!isOnline ? (
            <WifiOff className="h-4 w-4 text-red-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          )}
          
          <div>
            <span className="font-medium text-blue-800">
              {!isOnline ? 'Modo offline activo' : 'Datos pendientes de sincronización'}
            </span>
            <div className="text-sm text-blue-600">
              {pendingOperations > 0 && (
                <span>{pendingOperations} de {totalOperations} operaciones pendientes</span>
              )}
              {lastSyncTime && (
                <span className="ml-2">• Última sync: {formatTime(lastSyncTime)}</span>
              )}
            </div>
          </div>
        </div>

        {pendingOperations > 0 && (
          <Badge className="bg-blue-600">
            {pendingOperations}
          </Badge>
        )}
      </div>
    </div>
  )
}
