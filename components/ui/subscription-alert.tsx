import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, XCircle, Zap, ArrowUp } from "lucide-react"

interface SubscriptionAlertProps {
  currentCount: number
  limit: number
  plan: "free" | "basic" | "enterprise"
  planName: string
  onUpgrade?: () => void
  className?: string
}

export function SubscriptionAlert({
  currentCount,
  limit,
  plan,
  planName,
  onUpgrade,
  className = ""
}: SubscriptionAlertProps) {
  const isUnlimited = limit === -1
  
  if (isUnlimited) {
    return null // No mostrar alerta para planes enterprise
  }

  const usagePercentage = (currentCount / limit) * 100
  const remaining = limit - currentCount

  // No mostrar alerta si está por debajo del 70%
  if (usagePercentage < 70) {
    return null
  }

  const getAlertInfo = () => {
    if (remaining <= 0) {
      return {
        icon: XCircle,
        title: "Límite alcanzado",
        description: `Has utilizado todas tus ${limit} operaciones del plan ${planName}. No puedes crear más operaciones este mes.`,
        buttonText: "Actualizar Plan",
        variant: "destructive" as const,
        alertClass: "border-red-200 bg-red-50"
      }
    }

    if (remaining <= 50) {
      return {
        icon: AlertTriangle,
        title: "Pocas operaciones restantes",
        description: `Solo te quedan ${remaining} operaciones en tu plan ${planName}. Considera actualizar tu plan.`,
        buttonText: "Ver Planes",
        variant: "default" as const,
        alertClass: "border-orange-200 bg-orange-50"
      }
    }

    if (usagePercentage >= 80) {
      return {
        icon: AlertTriangle,
        title: "Te estás acercando al límite",
        description: `Has usado ${currentCount} de ${limit} operaciones (${Math.round(usagePercentage)}%). Considera actualizar tu plan.`,
        buttonText: "Ver Planes",
        variant: "default" as const,
        alertClass: "border-yellow-200 bg-yellow-50"
      }
    }

    return null
  }

  const alertInfo = getAlertInfo()
  
  if (!alertInfo) {
    return null
  }

  const AlertIcon = alertInfo.icon

  return (
    <Alert className={`${alertInfo.alertClass} ${className}`}>
      <AlertIcon className="h-4 w-4" />
      <div className="flex-1">
        <AlertDescription className="space-y-2">
          <div>
            <strong>{alertInfo.title}</strong>
          </div>
          <div className="text-sm">
            {alertInfo.description}
          </div>
          {onUpgrade && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={onUpgrade}
                className="flex items-center gap-1"
              >
                {remaining <= 0 ? (
                  <Zap className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )}
                {alertInfo.buttonText}
              </Button>
              {remaining <= 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  Actualizar
                </Button>
              )}
            </div>
          )}
        </AlertDescription>
      </div>
    </Alert>
  )
}

// Componente simplificado para usar en formularios
export function QuickLimitCheck({ 
  currentCount, 
  limit, 
  plan 
}: { 
  currentCount: number
  limit: number
  plan: "free" | "basic" | "enterprise"
}) {
  const isUnlimited = limit === -1
  const canCreate = isUnlimited || currentCount < limit

  if (canCreate) {
    return null
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
      <XCircle className="h-4 w-4" />
      <span>Has alcanzado el límite de operaciones para este mes</span>
    </div>
  )
}
