import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Silo from "@/app/mongoDB/models/silo"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG GET /api/silos ===")
    
    // TODO: Restaurar autenticación cuando el sistema de login esté funcionando
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()

    // TODO: Filtrar por empresa cuando la autenticación esté habilitada
    // const filter = user.role === "system_admin" ? {} : { company_id: user.company_id }
    const filter = {}
    
    const silos = await Silo.find(filter).sort({ name: 1 })

    // Mapear _id a id para que coincida con el tipo TypeScript
    const mappedSilos = silos.map(silo => ({
      ...silo.toObject(),
      id: silo._id.toString(),
    }))

    return NextResponse.json({ success: true, silos: mappedSilos })
  } catch (error) {
    console.error("Error obteniendo silos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG POST /api/silos ===")
    
    // TODO: Restaurar autenticación cuando el sistema de login esté funcionando
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()

    const siloData = await request.json()
    console.log("Datos del silo a crear:", siloData)

    // TODO: Asignar company_id del usuario autenticado cuando la autenticación esté habilitada
    // if (user.role !== "system_admin") {
    //   siloData.company_id = user.company_id
    // }

    siloData.created_at = new Date().toISOString()
    siloData.updated_at = new Date().toISOString()

    const newSilo = new Silo(siloData)
    await newSilo.save()

    console.log("Silo creado exitosamente:", newSilo._id)

    return NextResponse.json({ 
      success: true, 
      silo: newSilo,
      message: "Silo creado exitosamente"
    })
  } catch (error) {
    console.error("Error creando silo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
