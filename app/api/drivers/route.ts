import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import Driver from "@/app/mongoDB/models/driver"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-habilitar autenticación después del desarrollo
    // const user = verifyToken(request)
    // if (!user) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()

    // TODO: Filtrar por empresa cuando se re-habilite la autenticación
    // const filter = user.role === "system_admin" ? {} : { company_id: user.company_id }
    const filter = {}
    
    const drivers = await Driver.find(filter).sort({ name: 1 })

    return NextResponse.json({ success: true, drivers })
  } catch (error) {
    console.error("Error obteniendo drivers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG POST /api/drivers ===")
    
    // TODO: Re-habilitar autenticación después del desarrollo
    // const user = verifyToken(request)
    // console.log("Usuario verificado:", user ? { userId: user.userId, email: user.email, role: user.role } : "null")
    
    // if (!user) {
    //   console.log("Error: Usuario no autorizado")
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    await connectDB()

    const driverData = await request.json()
    console.log("Datos del driver a crear:", driverData)

    // TODO: Asignar company_id cuando se re-habilite la autenticación
    // if (user.role !== "system_admin") {
    //   driverData.company_id = user.company_id
    // }

    driverData.created_at = new Date().toISOString()
    driverData.updated_at = new Date().toISOString()

    const newDriver = new Driver(driverData)
    await newDriver.save()

    console.log("Driver creado exitosamente:", newDriver._id)

    return NextResponse.json({ 
      success: true, 
      driver: newDriver,
      message: "Driver creado exitosamente"
    })
  } catch (error) {
    console.error("Error creando driver:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
