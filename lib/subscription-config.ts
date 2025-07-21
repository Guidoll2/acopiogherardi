// Configuración de límites y precios para suscripciones
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Gratis",
    operations_limit: 250,
    price: 0,
    features: [
      "Hasta 250 operaciones por mes",
      "Gestión básica de clientes",
      "Soporte por email"
    ]
  },
  basic: {
    name: "Básico",
    operations_limit: 500,
    price: 29,
    features: [
      "Hasta 500 operaciones por mes",
      "Gestión completa de operaciones",
      "Reportes básicos",
      "Soporte prioritario"
    ]
  },
  enterprise: {
    name: "Enterprise",
    operations_limit: -1, // -1 significa ilimitado
    price: 299,
    features: [
      "Operaciones ilimitadas",
      "Reportes avanzados",
      "Múltiples usuarios",
      "Soporte 24/7",
      "API acceso"
    ]
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Función helper para obtener información del plan
export const getPlanInfo = (plan: SubscriptionPlan) => {
  return SUBSCRIPTION_PLANS[plan]
}

// Función para verificar si un plan tiene operaciones ilimitadas
export const hasUnlimitedOperations = (plan: SubscriptionPlan): boolean => {
  return SUBSCRIPTION_PLANS[plan].operations_limit === -1
}

// Función para obtener el límite de operaciones de un plan
export const getOperationsLimit = (plan: SubscriptionPlan): number => {
  return SUBSCRIPTION_PLANS[plan].operations_limit
}

// Función para verificar si se puede crear una operación
export const canCreateOperation = (
  currentCount: number,
  plan: SubscriptionPlan
): boolean => {
  const limit = getOperationsLimit(plan)
  return limit === -1 || currentCount < limit
}

// Función para calcular el porcentaje de uso
export const getUsagePercentage = (
  currentCount: number,
  plan: SubscriptionPlan
): number => {
  const limit = getOperationsLimit(plan)
  if (limit === -1) return 0 // Ilimitado
  return Math.min((currentCount / limit) * 100, 100)
}
