import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-config"

interface PlanComparisonProps {
  currentPlan?: "free" | "basic" | "enterprise"
  onSelectPlan?: (plan: "free" | "basic" | "enterprise") => void
  showUpgradeButtons?: boolean
  className?: string
}

export function PlanComparison({ 
  currentPlan, 
  onSelectPlan, 
  showUpgradeButtons = false,
  className = "" 
}: PlanComparisonProps) {
  
  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
    id: key as "free" | "basic" | "enterprise",
    ...plan
  }))

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "enterprise":
        return <Star className="h-5 w-5 text-purple-600" />
      case "basic":
        return <Zap className="h-5 w-5 text-blue-600" />
      case "free":
        return <Check className="h-5 w-5 text-gray-600" />
      default:
        return <Check className="h-5 w-5 text-gray-600" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "enterprise":
        return "border-purple-200 bg-purple-50"
      case "basic":
        return "border-blue-200 bg-blue-50"
      case "free":
        return "border-gray-200 bg-gray-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getPriceColor = (planId: string) => {
    switch (planId) {
      case "enterprise":
        return "text-purple-600"
      case "basic":
        return "text-blue-600"
      case "free":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan === plan.id
        const isPopular = plan.id === "basic"
        
        return (
          <Card 
            key={plan.id} 
            className={`relative ${getPlanColor(plan.id)} ${
              isCurrentPlan ? "ring-2 ring-green-500" : ""
            }`}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3 py-1">
                  Más Popular
                </Badge>
              </div>
            )}
            
            {isCurrentPlan && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-green-600 text-white px-3 py-1">
                  Plan Actual
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className={`text-3xl font-bold ${getPriceColor(plan.id)}`}>
                ${plan.price}
                <span className="text-sm font-normal text-gray-500">/mes</span>
              </div>
              <div className="text-sm text-gray-600">
                {plan.operations_limit === -1 
                  ? "Operaciones ilimitadas" 
                  : `${plan.operations_limit} operaciones/mes`
                }
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {showUpgradeButtons && onSelectPlan && (
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button 
                      variant="secondary" 
                      className="w-full" 
                      disabled
                    >
                      Plan Actual
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => onSelectPlan(plan.id)}
                      className={`w-full ${
                        plan.id === "enterprise" 
                          ? "bg-purple-600 hover:bg-purple-700" 
                          : plan.id === "basic"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      {plan.price === 0 ? "Seleccionar" : "Actualizar Plan"}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Componente simplificado para mostrar solo el plan actual
export function CurrentPlanCard({ 
  plan, 
  planName, 
  price, 
  currentCount, 
  limit,
  onUpgrade 
}: {
  plan: "free" | "basic" | "enterprise"
  planName: string
  price: number
  currentCount: number
  limit: number
  onUpgrade?: () => void
}) {
  const usagePercentage = limit === -1 ? 0 : (currentCount / limit) * 100

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Plan Actual</CardTitle>
          {getPlanIcon(plan)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium">{planName}</span>
          <span className="text-lg font-bold text-green-600">
            ${price}/mes
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          {limit === -1 ? (
            <span>✨ Operaciones ilimitadas</span>
          ) : (
            <span>
              {currentCount} de {limit} operaciones usadas ({Math.round(usagePercentage)}%)
            </span>
          )}
        </div>

        {onUpgrade && plan !== "enterprise" && (
          <Button 
            size="sm" 
            onClick={onUpgrade}
            className="w-full mt-2"
          >
            Actualizar Plan
          </Button>
        )}
      </CardContent>
    </Card>
  )

  function getPlanIcon(planId: string) {
    switch (planId) {
      case "enterprise":
        return <Star className="h-4 w-4 text-purple-600" />
      case "basic":
        return <Zap className="h-4 w-4 text-blue-600" />
      case "free":
        return <Check className="h-4 w-4 text-gray-600" />
      default:
        return <Check className="h-4 w-4 text-gray-600" />
    }
  }
}
