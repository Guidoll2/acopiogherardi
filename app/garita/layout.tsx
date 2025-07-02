"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"

export default function GaritaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const user = AuthService.getCurrentUser()

    if (!user) {
      router.push("/login")
      return
    }

    // Solo usuarios con rol permitido pueden acceder
    const allowedRoles = ["system_admin", "admin", "company_admin"] as const;
    if (!allowedRoles.includes(user.role)) {
      router.push("/dashboard")
      return
    }
  }, [router])

  return <div className="min-h-screen bg-gray-50">{children}</div>
}
