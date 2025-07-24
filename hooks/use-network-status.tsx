"use client"

import { useState, useEffect, useCallback } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  hasBeenOffline: boolean
  connectionType: string | null
  effectiveType: string | null
  downlink: number | null
  rtt: number | null
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    hasBeenOffline: false,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null
  })

  const updateNetworkStatus = useCallback(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    setNetworkStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      connectionType: connection?.type || null,
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null
    }))
  }, [])

  const handleOnline = useCallback(() => {
    console.log('🌐 Network: Back online')
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: true
    }))
    updateNetworkStatus()
    
    // Trigger custom event for sync
    window.dispatchEvent(new CustomEvent('networkOnline', {
      detail: { timestamp: new Date().toISOString() }
    }))
  }, [updateNetworkStatus])

  const handleOffline = useCallback(() => {
    console.log('📵 Network: Gone offline')
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: false,
      hasBeenOffline: true
    }))
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('networkOffline', {
      detail: { timestamp: new Date().toISOString() }
    }))
  }, [])

  const handleConnectionChange = useCallback(() => {
    updateNetworkStatus()
  }, [updateNetworkStatus])

  useEffect(() => {
    // Initial status
    updateNetworkStatus()
    
    // Event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Connection API listeners
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [handleOnline, handleOffline, handleConnectionChange])

  // Función para verificar conexión real (ping test)
  const checkRealConnection = useCallback(async (timeout = 5000): Promise<boolean> => {
    if (!navigator.onLine) return false
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.log('🔍 Real connection check failed:', error)
      return false
    }
  }, [])

  // Función para obtener calidad de conexión
  const getConnectionQuality = useCallback((): 'good' | 'poor' | 'offline' => {
    if (!networkStatus.isOnline) return 'offline'
    
    if (networkStatus.effectiveType) {
      switch (networkStatus.effectiveType) {
        case '4g':
          return 'good'
        case '3g':
          return 'poor'
        case '2g':
        case 'slow-2g':
          return 'poor'
        default:
          return 'good'
      }
    }
    
    // Fallback basado en RTT y downlink
    if (networkStatus.rtt && networkStatus.rtt > 1000) return 'poor'
    if (networkStatus.downlink && networkStatus.downlink < 0.5) return 'poor'
    
    return 'good'
  }, [networkStatus])

  return {
    ...networkStatus,
    checkRealConnection,
    getConnectionQuality,
    // Aliases para compatibilidad
    isOnline: networkStatus.isOnline,
    hasBeenOffline: networkStatus.hasBeenOffline
  }
}
