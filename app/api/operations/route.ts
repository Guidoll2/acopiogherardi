import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Operation from "@/app/mongoDB/models/operation"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    // Filtrar por empresa si no es system_admin
    const filter = user.role === "system_admin" ? {} : { company_id: user.company_id }
    
    const operations = await Operation.find(filter)
      .populate("client_id")
      .populate("driver_id")
      .populate("silo_id")
      .populate("cereal_type_id")
      .sort({ created_at: -1 })

    return NextResponse.json({ success: true, operations })
  } catch (error) {
    console.error("Error obteniendo operaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    const operationData = await request.json()

    // Asignar company_id del usuario autenticado si no es system_admin
    if (user.role !== "system_admin") {
      operationData.company_id = user.company_id
    }

    operationData.created_at = new Date().toISOString()
    operationData.updated_at = new Date().toISOString()

    const newOperation = new Operation(operationData)
    await newOperation.save()

    return NextResponse.json({ 
      success: true, 
      operation: newOperation,
      message: "Operación creada exitosamente"
    })
  } catch (error) {
    console.error("Error creando operación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
