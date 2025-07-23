"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { PageLoadingSpinner } from "@/components/ui/loading-spinner"

interface PageTransitionContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  setPageReady: () => void
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isLoading: false,
  setLoading: () => {},
  setPageReady: () => {}
})

export function usePageTransition() {
  return useContext(PageTransitionContext)
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [previousPathname, setPreviousPathname] = useState<string>("")
  const [pageReady, setPageReady] = useState(false)
  const pathname = usePathname()

  // Efecto para manejar cambios de ruta solo en el dashboard
  useEffect(() => {
    const isDashboardRoute = pathname.startsWith('/dashboard')
    const wasInitialLoad = previousPathname === ""
    
    // Solo mostrar loading si es cambio entre páginas del dashboard, no carga inicial
    if (isDashboardRoute && !wasInitialLoad && previousPathname !== pathname) {
      setIsLoading(true)
      setPageReady(false)
      
      // Timeout de seguridad: si la página no está lista en 2 segundos, forzar el cierre
      const safetyTimer = setTimeout(() => {
        setIsLoading(false)
      }, 2000)

      return () => clearTimeout(safetyTimer)
    }

    // Actualizar pathname anterior
    if (previousPathname !== pathname) {
      setPreviousPathname(pathname)
    }
  }, [pathname, previousPathname])

  // Ocultar loading cuando la página esté lista
  useEffect(() => {
    if (pageReady && isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 150) // Pequeño delay para transición suave
      
      return () => clearTimeout(timer)
    }
  }, [pageReady, isLoading])

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const handleSetPageReady = () => {
    setPageReady(true)
  }

  return (
    <PageTransitionContext.Provider value={{ 
      isLoading, 
      setLoading, 
      setPageReady: handleSetPageReady 
    }}>
      {children}
    </PageTransitionContext.Provider>
  )
}

// Componente para mostrar loading en el área de contenido
export function PageTransitionLoader() {
  const { isLoading } = usePageTransition()
  
  if (!isLoading) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Glass background que ocupa toda la pantalla */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      {/* Contenido del loading centrado y fijo */}
      <div className="relative z-10 flex items-center justify-center">
        <PageLoadingSpinner text="Cargando..." />
      </div>
    </div>
  )
}
