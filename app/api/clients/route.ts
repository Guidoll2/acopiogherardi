import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Client from "@/app/mongoDB/models/client"
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
    
    const clients = await Client.find(filter).sort({ name: 1 })

    return NextResponse.json({ success: true, clients })
  } catch (error) {
    console.error("Error obteniendo clientes:", error)
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

    const clientData = await request.json()

    // Asignar company_id del usuario autenticado si no es system_admin
    if (user.role !== "system_admin") {
      clientData.company_id = user.company_id
    }

    clientData.created_at = new Date().toISOString()
    clientData.updated_at = new Date().toISOString()

    const newClient = new Client(clientData)
    await newClient.save()

    return NextResponse.json({ 
      success: true, 
      client: newClient,
      message: "Cliente creado exitosamente"
    })
  } catch (error) {
    console.error("Error creando cliente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
