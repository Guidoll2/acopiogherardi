"use client"

import { useState, useEffect } from 'react'
import { useOfflineData } from '@/contexts/offline-data-context'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { offlineStorage } from '@/lib/offline-storage'
import { syncService } from '@/lib/sync-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Clock, 
  Trash2, 
  Download, 
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface StorageInfo {
  totalSize: number
  pendingActions: number
  lastSync: Date | null
  cacheAge: Record<string, Date>
}

export function OfflineSettings() {
  const {
    isOnline,
    hasBeenOffline,
    pendingActions,
    lastSyncTime,
    syncInProgress,
    cacheAge,
    autoSyncEnabled,
    setAutoSyncEnabled,
    forcSync,
    clearCache
  } = useOfflineData()

  const { getConnectionQuality, effectiveType, downlink, rtt } = useNetworkStatus()
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    loadStorageInfo()
  }, [])

  const loadStorageInfo = async () => {
    try {
      const stats = await offlineStorage.getStorageStats()
      setStorageInfo(stats)
    } catch (error) {
      console.error('Error loading storage info:', error)
    }
  }

  const handleForceSync = async () => {
    try {
      await forcSync()
      await loadStorageInfo()
    } catch (error) {
      console.error('Force sync failed:', error)
    }
  }

  const handleClearCache = async () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el cache? Esto eliminará todos los datos offline.')) {
      setClearing(true)
      try {
        await clearCache()
        await loadStorageInfo()
      } catch (error) {
        console.error('Clear cache failed:', error)
      } finally {
        setClearing(false)
      }
    }
  }

  const handleClearEntity = async (entity: string) => {
    if (confirm(`¿Limpiar cache de ${entity}?`)) {
      try {
        await clearCache(entity)
        await loadStorageInfo()
      } catch (error) {
        console.error(`Clear ${entity} cache failed:`, error)
      }
    }
  }

  const formatAge = (date: Date) => {
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

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="h-5 w-5 text-red-500" />
    
    const quality = getConnectionQuality()
    if (quality === 'good') return <Wifi className="h-5 w-5 text-green-500" />
    if (quality === 'poor') return <Wifi className="h-5 w-5 text-orange-500" />
    
    return <Wifi className="h-5 w-5 text-gray-500" />
  }

  const getStorageUsage = () => {
    // Estimation based on data counts
    const entities = Object.keys(cacheAge).length
    return Math.min((entities * 15), 100) // Rough estimation
  }

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span>Estado de Conexión</span>
          </CardTitle>
          <CardDescription>
            Información sobre la conectividad y calidad de red
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {isOnline ? (
                  <Badge className="bg-green-500">Online</Badge>
                ) : (
                  <Badge className="bg-red-500">Offline</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Estado</p>
            </div>

            {effectiveType && (
              <div className="text-center">
                <div className="text-2xl font-bold">{effectiveType.toUpperCase()}</div>
                <p className="text-sm text-muted-foreground">Tipo</p>
              </div>
            )}

            {downlink && (
              <div className="text-center">
                <div className="text-2xl font-bold">{downlink.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">Mbps</p>
              </div>
            )}

            {rtt && (
              <div className="text-center">
                <div className="text-2xl font-bold">{rtt}</div>
                <p className="text-sm text-muted-foreground">ms latencia</p>
              </div>
            )}
          </div>

          {hasBeenOffline && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Has estado offline. Verifica que todos los datos estén sincronizados.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className={`h-5 w-5 ${syncInProgress ? 'animate-spin' : ''}`} />
            <span>Sincronización</span>
          </CardTitle>
          <CardDescription>
            Estado de la sincronización de datos offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-sync">Sincronización automática</Label>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingActions}</div>
              <p className="text-sm text-muted-foreground">Cambios pendientes</p>
            </div>

            <div className="text-center">
              <div className="text-sm">
                {lastSyncTime ? formatAge(lastSyncTime) : 'Nunca'}
              </div>
              <p className="text-sm text-muted-foreground">Última sincronización</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleForceSync}
              disabled={!isOnline || syncInProgress}
              className="flex-1"
            >
              {syncInProgress ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {syncInProgress ? 'Sincronizando...' : 'Sincronizar ahora'}
            </Button>
          </div>

          {pendingActions > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Hay {pendingActions} cambios pendientes de sincronizar
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Almacenamiento Offline</span>
          </CardTitle>
          <CardDescription>
            Gestión del cache y datos almacenados localmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Uso estimado</span>
              <span>{getStorageUsage()}%</span>
            </div>
            <Progress value={getStorageUsage()} className="h-2" />
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Cache por entidad:</h4>
            
            {Object.entries(cacheAge).map(([entity, date]) => (
              <div key={entity} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="capitalize">{entity}</span>
                  <Badge variant="secondary">{formatAge(date)}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleClearEntity(entity)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {Object.keys(cacheAge).length === 0 && (
              <p className="text-sm text-muted-foreground">No hay datos en cache</p>
            )}
          </div>

          <Separator />

          <Button
            onClick={handleClearCache}
            disabled={clearing}
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-50"
          >
            {clearing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {clearing ? 'Limpiando...' : 'Limpiar todo el cache'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
