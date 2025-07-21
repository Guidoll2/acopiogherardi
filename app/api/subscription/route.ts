import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-middleware"
import { SubscriptionService } from "@/lib/subscription-service"

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Si es system_admin, puede consultar cualquier empresa
    // Si no, solo su propia empresa
    const url = new URL(request.url)
    const companyId = url.searchParams.get('company_id') || user.company_id

    if (!companyId) {
      return NextResponse.json({ 
        error: "company_id es requerido" 
      }, { status: 400 })
    }

    // Verificar permisos: solo system_admin puede ver otras empresas
    if (user.role !== "system_admin" && companyId !== user.company_id) {
      return NextResponse.json({ 
        error: "No tienes permisos para ver esta información" 
      }, { status: 403 })
    }

    const subscriptionInfo = await SubscriptionService.getSubscriptionInfo(companyId)
    
    if (!subscriptionInfo) {
      return NextResponse.json({ 
        error: "Empresa no encontrada" 
      }, { status: 404 })
    }

    // También obtener el estado actual de límites
    const limitCheck = await SubscriptionService.checkOperationLimit(companyId)

    return NextResponse.json({
      success: true,
      data: {
        ...subscriptionInfo,
        currentLimits: {
          canCreateOperation: limitCheck.canCreate,
          remainingOperations: limitCheck.remainingOperations,
          usagePercentage: limitCheck.limit === -1 ? 0 : Math.round((limitCheck.currentCount / limitCheck.limit) * 100)
        }
      }
    })

  } catch (error) {
    console.error("Error obteniendo información de suscripción:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo system_admin puede actualizar planes
    if (user.role !== "system_admin") {
      return NextResponse.json({ 
        error: "Solo administradores del sistema pueden actualizar planes" 
      }, { status: 403 })
    }

    const { company_id, new_plan } = await request.json()

    if (!company_id || !new_plan) {
      return NextResponse.json({ 
        error: "company_id y new_plan son requeridos" 
      }, { status: 400 })
    }

    if (!["free", "basic", "enterprise"].includes(new_plan)) {
      return NextResponse.json({ 
        error: "Plan inválido. Debe ser: free, basic o enterprise" 
      }, { status: 400 })
    }

    const success = await SubscriptionService.updateSubscriptionPlan(company_id, new_plan)
    
    if (!success) {
      return NextResponse.json({ 
        error: "No se pudo actualizar el plan" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Plan actualizado a ${new_plan} exitosamente`
    })

  } catch (error) {
    console.error("Error actualizando plan de suscripción:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
