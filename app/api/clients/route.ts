import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Client from "@/app/mongoDB/models/client"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    // Filtrar por empresa (system_admin puede ver todos, otros solo su empresa)
    const filter = user.role === "system_admin" ? {} : { company_id: user.company_id }
    
    const clients = await Client.find(filter).sort({ name: 1 })

    // Mapear _id a id para que coincida con el tipo TypeScript
    const mappedClients = clients.map(client => ({
      ...client.toObject(),
      id: client._id.toString(),
    }))

    return NextResponse.json({ success: true, clients: mappedClients })
  } catch (error) {
    console.error("Error obteniendo clientes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG POST /api/clients ===")
    
    // Verificar autenticación
    const user = verifyToken(request)
    console.log("Usuario verificado:", user ? { userId: user.userId, email: user.email, role: user.role } : "null")
    
    if (!user) {
      console.log("Error: Usuario no autorizado")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectDB()

    const clientData = await request.json()
    console.log("Datos del cliente a crear:", clientData)

    // Asignar company_id del usuario autenticado (excepto system_admin que puede especificar)
    if (user.role !== "system_admin") {
      clientData.company_id = user.company_id
    }

    clientData.created_at = new Date().toISOString()
    clientData.updated_at = new Date().toISOString()

    const newClient = new Client(clientData)
    await newClient.save()

    console.log("Cliente creado exitosamente:", newClient._id)

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
