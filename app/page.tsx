"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const user = AuthService.getCurrentUser()
    
    if (!user) {
      // No hay usuario autenticado, redirigir al login
      router.push("/login")
      return
    }

    // Usuario autenticado, redirigir al dashboard apropiado según su rol
    if (user.role === "garita") {
      router.push("/garita")
    } else if (user.role === "admin" || user.role === "company_admin") {
      router.push("/dashboard")
    } else {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
