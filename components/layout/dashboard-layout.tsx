"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { PageTransitionLoader } from "@/contexts/page-transition-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = AuthService.getCurrentUser()
    if (!user) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Acopio Gherardi</h2>
          <p className="mt-2 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      
      {/* Contenido principal - ocupa todo el ancho en móvil */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={toggleMobileMenu} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto relative min-h-0">
          {/* Loader de transición solo en el área de contenido */}
          <PageTransitionLoader />
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
