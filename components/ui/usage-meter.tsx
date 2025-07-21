import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, XCircle, Infinity } from "lucide-react"

interface UsageMeterProps {
  currentCount: number
  limit: number
  plan: "free" | "basic" | "enterprise"
  planName: string
  className?: string
}

export function UsageMeter({ 
  currentCount, 
  limit, 
  plan, 
  planName, 
  className = "" 
}: UsageMeterProps) {
  const isUnlimited = limit === -1
  const usagePercentage = isUnlimited ? 0 : Math.min((currentCount / limit) * 100, 100)
  const remaining = isUnlimited ? -1 : Math.max(0, limit - currentCount)
  
  // Determinar color y estado
  const getStatusInfo = () => {
    if (isUnlimited) {
      return {
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        icon: Infinity,
        status: "Ilimitado",
        progressColor: "bg-purple-500"
      }
    }
    
    if (usagePercentage >= 100) {
      return {
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: XCircle,
        status: "Límite alcanzado",
        progressColor: "bg-red-500"
      }
    }
    
    if (usagePercentage >= 80) {
      return {
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        icon: AlertTriangle,
        status: "Cerca del límite",
        progressColor: "bg-orange-500"
      }
    }
    
    return {
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: CheckCircle,
      status: "Normal",
      progressColor: "bg-green-500"
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const getPlanBadgeColor = () => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "basic":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "free":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Uso de Operaciones</CardTitle>
          <Badge className={getPlanBadgeColor()}>
            {planName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Estadísticas principales */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.status}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {currentCount}
              {!isUnlimited && (
                <span className="text-sm text-gray-500 font-normal">
                  /{limit}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {isUnlimited ? "operaciones" : "operaciones usadas"}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        {!isUnlimited && (
          <div className="space-y-1">
            <Progress 
              value={usagePercentage} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{Math.round(usagePercentage)}%</span>
              <span>{limit}</span>
            </div>
          </div>
        )}

        {/* Operaciones restantes */}
        {!isUnlimited && (
          <div className={`text-center p-2 rounded-md ${statusInfo.bgColor}`}>
            <div className={`text-sm font-medium ${statusInfo.color}`}>
              {remaining === 0 ? (
                "Has alcanzado tu límite mensual"
              ) : (
                <>
                  <span className="text-lg font-bold">{remaining}</span>
                  <span className="text-xs ml-1">operaciones restantes</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mensaje de Enterprise */}
        {isUnlimited && (
          <div className={`text-center p-2 rounded-md ${statusInfo.bgColor}`}>
            <div className={`text-sm font-medium ${statusInfo.color}`}>
              <Infinity className="h-4 w-4 inline mr-1" />
              Operaciones ilimitadas
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
