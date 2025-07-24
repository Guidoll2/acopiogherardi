"use client"

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      console.log('🔧 Registering Service Worker...')
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setSwRegistration(registration)
      setIsInstalled(true)

      console.log('✅ Service Worker registered successfully:', registration.scope)

      // Escuchar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          console.log('🔄 New Service Worker found, updating...')
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📦 New Service Worker installed, update available')
              setUpdateAvailable(true)
            }
          })
        }
      })

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from Service Worker:', event.data)
        
        if (event.data?.type === 'BACKGROUND_SYNC') {
          // Trigger sincronización cuando el SW detecta conectividad
          window.dispatchEvent(new CustomEvent('backgroundSync', {
            detail: event.data
          }))
        }
      })

      // Verificar si hay un service worker en waiting
      if (registration.waiting) {
        setUpdateAvailable(true)
      }

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  }

  const updateServiceWorker = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setUpdateAvailable(false)
      
      // Recargar página después de actualizar
      window.location.reload()
    }
  }

  const cacheApiData = (url: string, data: any) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_API_DATA',
        url,
        data
      })
    }
  }

  return {
    isSupported,
    isInstalled,
    updateAvailable,
    updateServiceWorker,
    cacheApiData,
    registration: swRegistration
  }
}

// Componente para mostrar notificación de actualización
export function ServiceWorkerUpdater() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker()

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Nueva versión disponible</h4>
          <p className="text-sm opacity-90">Actualiza para obtener las últimas mejoras</p>
        </div>
        <button
          onClick={updateServiceWorker}
          className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}
