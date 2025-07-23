"use client"

import { useEffect } from "react"
import { usePageTransition } from "@/contexts/page-transition-context"

/**
 * Hook para indicar cuando una página está completamente cargada
 * Esto permite mantener el spinner de transición hasta que la página esté lista
 */
export function usePageReady() {
  const { setPageReady } = usePageTransition()

  const markPageAsReady = () => {
    setPageReady()
  }

  // Auto-marcar como listo después del primer renderizado
  useEffect(() => {
    const timer = setTimeout(() => {
      markPageAsReady()
    }, 300) // Aumentado el delay para dar tiempo a la carga de datos

    return () => clearTimeout(timer)
  }, [markPageAsReady])

  return { markPageAsReady }
}
