"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { PageLoadingSpinner } from "@/components/ui/loading-spinner"

interface PageTransitionContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isLoading: false,
  setLoading: () => {}
})

export function usePageTransition() {
  return useContext(PageTransitionContext)
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [previousPathname, setPreviousPathname] = useState<string>("")
  const pathname = usePathname()

  // Efecto para manejar cambios de ruta solo en el dashboard
  useEffect(() => {
    const isDashboardRoute = pathname.startsWith('/dashboard')
    const wasInitialLoad = previousPathname === ""
    
    // Solo mostrar loading si es cambio entre páginas del dashboard, no carga inicial
    if (isDashboardRoute && !wasInitialLoad && previousPathname !== pathname) {
      setIsLoading(true)
      
      // Tiempo de carga mínimo para transición suave
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 200)

      return () => clearTimeout(timer)
    }

    // Actualizar pathname anterior
    if (previousPathname !== pathname) {
      setPreviousPathname(pathname)
    }
  }, [pathname, previousPathname])

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  return (
    <PageTransitionContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </PageTransitionContext.Provider>
  )
}

// Componente para mostrar loading en el área de contenido
export function PageTransitionLoader() {
  const { isLoading } = usePageTransition()
  
  if (!isLoading) return null
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Glass background que ocupa solo el área de contenido */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
      
      {/* Contenido del loading centrado - sin bordes ni contenedor */}
      <div className="relative z-10">
        <PageLoadingSpinner text="Cargando..." />
      </div>
    </div>
  )
}
