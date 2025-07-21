"use client"

import { useState, useEffect } from "react"
import { AuthService } from "@/lib/auth"

export interface SubscriptionData {
  company: {
    id: string
    name: string
    email: string
  }
  subscription: {
    plan: "free" | "basic" | "enterprise"
    planName: string
    limit: number
    currentCount: number
    status: string
    billingCycleStart: string
    billingCycleEnd: string
    price: number
    features: string[]
  }
  currentLimits: {
    canCreateOperation: boolean
    remainingOperations: number
    usagePercentage: number
  }
}

interface UseSubscriptionReturn {
  data: SubscriptionData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSubscription(companyId?: string): UseSubscriptionReturn {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Si no se proporciona companyId, usar el del usuario actual
      let targetCompanyId = companyId
      if (!targetCompanyId) {
        const currentUser = AuthService.getCurrentUser()
        if (!currentUser?.company_id) {
          throw new Error("No se encontró empresa del usuario")
        }
        targetCompanyId = currentUser.company_id
      }

      const response = await fetch(
        `/api/subscription?company_id=${targetCompanyId}`,
        {
          method: "GET",
          credentials: "include",
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error obteniendo datos de suscripción")
      }

      const result = await response.json()
      setData(result.data)

    } catch (err) {
      console.error("Error en useSubscription:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionData()
  }, [companyId])

  return {
    data,
    loading,
    error,
    refetch: fetchSubscriptionData
  }
}

// Hook específico para verificar si se puede crear una operación
export function useCanCreateOperation() {
  const { data, loading, error, refetch } = useSubscription()
  
  return {
    canCreate: data?.currentLimits.canCreateOperation ?? false,
    remainingOperations: data?.currentLimits.remainingOperations ?? 0,
    currentCount: data?.subscription.currentCount ?? 0,
    limit: data?.subscription.limit ?? 0,
    plan: data?.subscription.plan ?? "free",
    loading,
    error,
    refetch
  }
}
