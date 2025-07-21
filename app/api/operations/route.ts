import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Operation from "@/app/mongoDB/models/operation"
import { verifyToken } from "@/lib/auth-middleware"
import { SubscriptionService } from "@/lib/subscription-service"

export async function GET(request: NextRequest) {
  try {
    // TEMPORARY: Deshabilitamos autenticación para desarrollo
    // TODO: Rehabilitar autenticación cuando el usuario esté logueado correctamente
    /*
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    */

    await connectDB()

    // TEMPORARY: Obtener todas las operaciones sin filtrar por empresa
    // TODO: Filtrar por empresa cuando la autenticación esté habilitada
    // const filter = user.role === "system_admin" ? {} : { company_id: user.company_id }
    const filter = {} // Obtener todas las operaciones temporalmente
    
    const operations = await Operation.find(filter)
      .sort({ created_at: -1 })

    // Mapear _id a id para que coincida con el tipo TypeScript
    const mappedOperations = operations.map(op => {
      const opObject = op.toObject()
      return {
        ...opObject,
        id: op._id.toString(),
        client_id: opObject.client_id?.toString() || opObject.client_id,
        driver_id: opObject.driver_id?.toString() || opObject.driver_id,
        silo_id: opObject.silo_id?.toString() || opObject.silo_id,
        cereal_type_id: opObject.cereal_type_id?.toString() || opObject.cereal_type_id,
        company_id: opObject.company_id?.toString() || opObject.company_id,
        // Mapear 'type' del modelo a 'operation_type' para el frontend
        operation_type: opObject.type || "ingreso", // Por defecto "ingreso" si no existe
      }
    })

    return NextResponse.json({ success: true, operations: mappedOperations })
  } catch (error) {
    console.error("Error obteniendo operaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // TEMPORARY: Deshabilitamos autenticación para desarrollo
    // TODO: Rehabilitar autenticación cuando el usuario esté logueado correctamente
    /*
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    */

    await connectDB()

    const operationData = await request.json()

    // TEMPORARY: No asignar company_id específico por ahora
    // TODO: Asignar company_id del usuario autenticado cuando la autenticación esté habilitada
    // const company_id = user.role === "system_admin" ? operationData.company_id : user.company_id
    /*
    if (user.role !== "system_admin") {
      operationData.company_id = user.company_id
    }
    */

    // TEMPORARY: Asignar company_id por defecto si no se proporciona
    if (!operationData.company_id) {
      operationData.company_id = "default-company-id"
      console.log("🏢 Asignando company_id por defecto (temporal)")
    }

    // Mapear operation_type a type para compatibilidad con el modelo
    if (operationData.operation_type) {
      operationData.type = operationData.operation_type
      console.log(`🔄 Mapeando operation_type '${operationData.operation_type}' a field 'type'`)
    }

    // Establecer fecha si no se proporciona
    if (!operationData.date) {
      operationData.date = new Date().toISOString()
      console.log("📅 Asignando fecha actual")
    }

    console.log("📋 Datos finales para crear operación:", operationData)

    // Verificar límites de suscripción antes de crear la operación
    const companyId = operationData.company_id
    
    // TEMPORARY: Omitir verificación de límites para company_id por defecto
    if (companyId && companyId !== "default-company-id") {
      console.log(`🔍 Verificando límites para empresa: ${companyId}`)
      
      const subscriptionCheck = await SubscriptionService.checkOperationLimit(companyId)
      
      if (!subscriptionCheck.canCreate) {
        console.log(`❌ Límite excedido para empresa ${companyId}:`, subscriptionCheck.errorMessage)
        
        return NextResponse.json({ 
          error: subscriptionCheck.errorMessage,
          subscription: {
            plan: subscriptionCheck.plan,
            currentCount: subscriptionCheck.currentCount,
            limit: subscriptionCheck.limit,
            remainingOperations: subscriptionCheck.remainingOperations
          }
        }, { status: 403 }) // 403 Forbidden
      }

      console.log(`✅ Límites OK - Plan: ${subscriptionCheck.plan}, Uso: ${subscriptionCheck.currentCount}/${subscriptionCheck.limit === -1 ? '∞' : subscriptionCheck.limit}`)
    } else {
      console.log(`⚠️ Omitiendo verificación de límites para company_id temporal: ${companyId}`)
    }

    operationData.created_at = new Date().toISOString()
    operationData.updated_at = new Date().toISOString()

    const newOperation = new Operation(operationData)
    await newOperation.save()

    // Incrementar contador de operaciones después de crear exitosamente
    if (companyId && companyId !== "default-company-id") {
      const incrementSuccess = await SubscriptionService.incrementOperationCount(companyId)
      if (incrementSuccess) {
        console.log(`📊 Contador incrementado para empresa ${companyId}`)
      } else {
        console.warn(`⚠️ No se pudo incrementar contador para empresa ${companyId}`)
      }
    } else {
      console.log(`⚠️ Omitiendo incremento de contador para company_id temporal: ${companyId}`)
    }

    // Mapear _id a id para consistencia con el frontend
    const operationResponse = {
      ...newOperation.toObject(),
      id: newOperation._id.toString(),
    }

    return NextResponse.json({ 
      success: true, 
      operation: operationResponse,
      message: "Operación creada exitosamente"
    })
  } catch (error) {
    console.error("Error creando operación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
