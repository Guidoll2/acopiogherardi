"use client"

import { usePageTransition } from "@/contexts/page-transition-context"
import { PageLoadingSpinner } from "@/components/ui/loading-spinner"

interface ConditionalLoadingSpinnerProps {
  text: string
}

/**
 * Componente que solo muestra el loading específico de la página
 * si NO está activo el spinner de transición global
 */
export function ConditionalLoadingSpinner({ text }: ConditionalLoadingSpinnerProps) {
  const { isLoading: isTransitioning } = usePageTransition()
  
  // Si está en transición, no mostrar este loading específico
  if (isTransitioning) {
    return null
  }
  
  return <PageLoadingSpinner text={text} />
}
