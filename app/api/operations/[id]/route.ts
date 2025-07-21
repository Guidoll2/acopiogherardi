import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Operation from "@/app/mongoDB/models/operation"
import { verifyToken } from "@/lib/auth-middleware"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    const resolvedParams = await params
    const operationId = resolvedParams.id
    const updateData = await request.json()

    console.log(`🔄 Actualizando operación ${operationId}:`, updateData)

    // Verificar que la operación existe
    const existingOperation = await Operation.findById(operationId)
    if (!existingOperation) {
      return NextResponse.json(
        { error: "Operación no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos: solo system_admin puede ver/editar todas las operaciones
    if (user.role !== "system_admin" && existingOperation.company_id !== user.company_id) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta operación" },
        { status: 403 }
      )
    }

    // Actualizar campos permitidos
    const allowedFields = [
      'status',
      'quantity',
      'tare_weight',
      'gross_weight', 
      'net_weight',
      'moisture',
      'impurities',
      'test_weight',
      'notes',
      'type',
      'updated_at'
    ]

    const filteredUpdateData: any = {}
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field]
      }
    }

    // Mapear operation_type del frontend a type para la base de datos
    if (updateData.operation_type !== undefined) {
      filteredUpdateData.type = updateData.operation_type
    }

    // Siempre actualizar la fecha de modificación
    filteredUpdateData.updated_at = new Date().toISOString()

    // Actualizar en la base de datos
    const updatedOperation = await Operation.findByIdAndUpdate(
      operationId,
      filteredUpdateData,
      { new: true }
    )

    if (!updatedOperation) {
      return NextResponse.json(
        { error: "Error actualizando operación" },
        { status: 500 }
      )
    }

    console.log(`✅ Operación ${operationId} actualizada exitosamente`)

    // Mapear _id a id y type a operation_type para consistencia con el frontend
    const { type, _id, ...operationData } = updatedOperation.toObject()
    const operationResponse = {
      ...operationData,
      id: updatedOperation._id.toString(),
      operation_type: updatedOperation.type, // Mapear type a operation_type para el frontend
    }

    return NextResponse.json({
      success: true,
      operation: operationResponse,
      message: "Operación actualizada exitosamente"
    })

  } catch (error) {
    console.error("Error actualizando operación:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    const resolvedParams = await params
    const operationId = resolvedParams.id

    console.log(`🗑️ Eliminando operación ${operationId}`)

    // Verificar que la operación existe
    const existingOperation = await Operation.findById(operationId)
    if (!existingOperation) {
      return NextResponse.json(
        { error: "Operación no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos: solo system_admin puede eliminar operaciones
    if (user.role !== "system_admin") {
      return NextResponse.json(
        { error: "Solo administradores del sistema pueden eliminar operaciones" },
        { status: 403 }
      )
    }

    // Eliminar la operación
    await Operation.findByIdAndDelete(operationId)

    console.log(`✅ Operación ${operationId} eliminada exitosamente`)

    return NextResponse.json({
      success: true,
      message: "Operación eliminada exitosamente"
    })

  } catch (error) {
    console.error("Error eliminando operación:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    const resolvedParams = await params
    const operationId = resolvedParams.id

    // Buscar la operación
    const operation = await Operation.findById(operationId)
      .populate("client_id")
      .populate("driver_id")
      .populate("silo_id")
      .populate("cereal_type_id")

    if (!operation) {
      return NextResponse.json(
        { error: "Operación no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos
    if (user.role !== "system_admin" && operation.company_id !== user.company_id) {
      return NextResponse.json(
        { error: "No tienes permisos para ver esta operación" },
        { status: 403 }
      )
    }

    // Mapear _id a id y type a operation_type para consistencia con el frontend
    const { type, _id, ...operationData } = operation.toObject()
    const operationResponse = {
      ...operationData,
      id: operation._id.toString(),
      operation_type: operation.type || "ingreso", // Mapear type a operation_type para el frontend
    }

    return NextResponse.json({
      success: true,
      operation: operationResponse
    })

  } catch (error) {
    console.error("Error obteniendo operación:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
