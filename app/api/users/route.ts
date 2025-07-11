import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import User from "@/app/mongoDB/models/user"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Obtener todos los usuarios (sin las contraseñas)
    const users = await User.find({}, { password: 0 })
    
    // Transformar el _id a id para compatibilidad con el frontend
    const usersData = users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      is_active: user.is_active,
      company_id: user.company_id?.toString(),
      created_at: user.created_at,
      updated_at: user.updated_at,
    }))

    return NextResponse.json({ users: usersData })

  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
