"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { LandingPage } from "@/components/landing/landing-page"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    
    if (currentUser) {
      // Usuario autenticado, redirigir al dashboard apropiado según su rol
      if (currentUser.role === "garita") {
        router.push("/garita")
      } else if (currentUser.role === "admin" || currentUser.role === "company_admin") {
        router.push("/dashboard")
      } else {
        router.push("/dashboard")
      }
      return
    }

    // No hay usuario autenticado, mostrar landing page
    setUser(null)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return <LandingPage />
}
