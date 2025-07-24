"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useServiceWorker } from "./use-service-worker"
import { useNetworkStatus } from "./use-network-status"

export function useOfflineNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { cachePageVisit } = useServiceWorker()
  const { isOnline } = useNetworkStatus()

  // Cache la página actual cuando la visitamos
  useEffect(() => {
    if (typeof window !== 'undefined' && cachePageVisit) {
      // Cache la página actual para navegación offline
      cachePageVisit(window.location.href)
    }
  }, [pathname, cachePageVisit])

  // Función de navegación mejorada para offline
  const navigateOfflineSafe = (href: string) => {
    try {
      // Si tenemos Service Worker, notificarle que cache esta página
      if (cachePageVisit && isOnline) {
        const fullUrl = new URL(href, window.location.origin).href
        cachePageVisit(fullUrl)
      }
      
      router.push(href)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback navigation
      window.location.href = href
    }
  }

  // Pre-cache rutas comunes del dashboard
  const preCacheDashboardRoutes = () => {
    if (!cachePageVisit || !isOnline) return

    const commonRoutes = [
      '/dashboard',
      '/dashboard/cereals',
      '/dashboard/clients',
      '/dashboard/drivers',
      '/dashboard/silos',
      '/dashboard/operations',
      '/dashboard/offline-settings'
    ]

    commonRoutes.forEach(route => {
      const fullUrl = new URL(route, window.location.origin).href
      cachePageVisit(fullUrl)
    })
  }

  return {
    navigateOfflineSafe,
    preCacheDashboardRoutes,
    isOnline
  }
}
