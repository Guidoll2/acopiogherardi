import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Cereal from "@/app/mongoDB/models/cereal"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG GET /api/cereals ===")
    
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    // Filtrar por empresa (system_admin puede ver todos, otros solo su empresa)
    const filter = user.role === "system_admin" ? {} : { company_id: user.company_id }
    
    const cereals = await Cereal.find(filter).sort({ name: 1 })

    // Mapear _id a id para que coincida con el tipo TypeScript
    const mappedCereals = cereals.map(cereal => ({
      ...cereal.toObject(),
      id: cereal._id.toString(),
    }))

    return NextResponse.json({ success: true, cereals: mappedCereals })
  } catch (error) {
    console.error("Error obteniendo cereales:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG POST /api/cereals ===")
    
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    const cerealData = await request.json()
    console.log("Datos del cereal a crear:", cerealData)

    // Asignar company_id del usuario autenticado (excepto system_admin que puede especificar)
    if (user.role !== "system_admin") {
      cerealData.company_id = user.company_id
    }

    cerealData.created_at = new Date().toISOString()
    cerealData.updated_at = new Date().toISOString()

    const newCereal = new Cereal(cerealData)
    await newCereal.save()

    console.log("Cereal creado exitosamente:", newCereal._id)

    return NextResponse.json({ 
      success: true, 
      cereal: newCereal,
      message: "Cereal creado exitosamente"
    })
  } catch (error) {
    console.error("Error creando cereal:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
