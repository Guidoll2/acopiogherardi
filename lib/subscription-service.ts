import connectDB from "@/app/mongoDB/db"
import Company from "@/app/mongoDB/models/company"
import { SUBSCRIPTION_PLANS, SubscriptionPlan, canCreateOperation, getOperationsLimit } from "./subscription-config"

export interface SubscriptionCheck {
  canCreate: boolean
  currentCount: number
  limit: number
  plan: SubscriptionPlan
  remainingOperations: number
  errorMessage?: string
}

export class SubscriptionService {
  
  /**
   * Verifica si una empresa puede crear una nueva operación
   */
  static async checkOperationLimit(companyId: string): Promise<SubscriptionCheck> {
    try {
      await connectDB()
      
      const company = await Company.findById(companyId)
      if (!company) {
        return {
          canCreate: false,
          currentCount: 0,
          limit: 0,
          plan: "free",
          remainingOperations: 0,
          errorMessage: "Empresa no encontrada"
        }
      }

      const plan = company.subscription_plan as SubscriptionPlan
      const currentCount = company.operations_count_current_month || 0
      const limit = company.operations_limit || getOperationsLimit(plan)
      
      // Verificar si el ciclo de facturación ha expirado y necesita reset
      const now = new Date()
      const cycleEnd = new Date(company.billing_cycle_end)
      
      let actualCurrentCount = currentCount
      
      // Si el ciclo expiró, resetear contador
      if (now > cycleEnd) {
        actualCurrentCount = 0
        await this.resetBillingCycle(companyId)
      }

      const canCreate = canCreateOperation(actualCurrentCount, plan)
      const remainingOperations = limit === -1 ? -1 : Math.max(0, limit - actualCurrentCount)

      let errorMessage: string | undefined
      if (!canCreate) {
        errorMessage = `Has alcanzado el límite de ${limit} operaciones para tu plan ${SUBSCRIPTION_PLANS[plan].name}. ${
          plan !== "enterprise" ? "Considera actualizar tu plan para obtener más operaciones." : ""
        }`
      }

      return {
        canCreate,
        currentCount: actualCurrentCount,
        limit,
        plan,
        remainingOperations,
        errorMessage
      }

    } catch (error) {
      console.error("Error verificando límite de operaciones:", error)
      return {
        canCreate: false,
        currentCount: 0,
        limit: 0,
        plan: "free",
        remainingOperations: 0,
        errorMessage: "Error interno del servidor"
      }
    }
  }

  /**
   * Incrementa el contador de operaciones de una empresa
   */
  static async incrementOperationCount(companyId: string): Promise<boolean> {
    try {
      await connectDB()
      
      const result = await Company.findByIdAndUpdate(
        companyId,
        { 
          $inc: { operations_count_current_month: 1 },
          updated_at: new Date().toISOString()
        },
        { new: true }
      )

      return !!result

    } catch (error) {
      console.error("Error incrementando contador de operaciones:", error)
      return false
    }
  }

  /**
   * Resetea el ciclo de facturación de una empresa
   */
  static async resetBillingCycle(companyId: string): Promise<boolean> {
    try {
      await connectDB()
      
      const now = new Date()
      const nextCycleEnd = new Date(now)
      nextCycleEnd.setMonth(nextCycleEnd.getMonth() + 1)

      const result = await Company.findByIdAndUpdate(
        companyId,
        {
          operations_count_current_month: 0,
          billing_cycle_start: now,
          billing_cycle_end: nextCycleEnd,
          updated_at: new Date().toISOString()
        },
        { new: true }
      )

      console.log(`🔄 Ciclo de facturación reseteado para empresa ${companyId}`)
      return !!result

    } catch (error) {
      console.error("Error reseteando ciclo de facturación:", error)
      return false
    }
  }

  /**
   * Obtiene información detallada de la suscripción de una empresa
   */
  static async getSubscriptionInfo(companyId: string) {
    try {
      await connectDB()
      
      const company = await Company.findById(companyId)
      if (!company) {
        return null
      }

      const plan = company.subscription_plan as SubscriptionPlan
      const planInfo = SUBSCRIPTION_PLANS[plan]
      
      return {
        company: {
          id: company._id,
          name: company.name,
          email: company.email
        },
        subscription: {
          plan,
          planName: planInfo.name,
          limit: company.operations_limit,
          currentCount: company.operations_count_current_month || 0,
          status: company.subscription_status,
          billingCycleStart: company.billing_cycle_start,
          billingCycleEnd: company.billing_cycle_end,
          price: planInfo.price,
          features: planInfo.features
        }
      }

    } catch (error) {
      console.error("Error obteniendo información de suscripción:", error)
      return null
    }
  }

  /**
   * Actualiza el plan de suscripción de una empresa
   */
  static async updateSubscriptionPlan(
    companyId: string, 
    newPlan: SubscriptionPlan
  ): Promise<boolean> {
    try {
      await connectDB()
      
      const planInfo = SUBSCRIPTION_PLANS[newPlan]
      
      const result = await Company.findByIdAndUpdate(
        companyId,
        {
          subscription_plan: newPlan,
          operations_limit: planInfo.operations_limit,
          updated_at: new Date().toISOString()
        },
        { new: true }
      )

      console.log(`📈 Plan actualizado para empresa ${companyId}: ${newPlan}`)
      return !!result

    } catch (error) {
      console.error("Error actualizando plan de suscripción:", error)
      return false
    }
  }
}
