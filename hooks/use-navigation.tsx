"use client"

import { useRouter } from "next/navigation"
import { usePageTransition } from "@/contexts/page-transition-context"

export function useNavigationWithLoading() {
  const router = useRouter()
  const { setLoading } = usePageTransition()

  const navigateWithLoading = (href: string) => {
    setLoading(true)
    router.push(href)
    
    // Auto-clear loading después de un tiempo máximo por si falla
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  const navigateAndReplace = (href: string) => {
    setLoading(true)
    router.replace(href)
    
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return {
    navigateWithLoading,
    navigateAndReplace,
    router
  }
}
