import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/app/mongoDB/db"
import User from "@/app/mongoDB/models/user"
import Company from "@/app/mongoDB/models/company"

// Método GET para evitar errores de build
export async function GET() {
  return NextResponse.json({ message: "Register API endpoint" })
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { email, password, full_name, phone, role, company_id } = await request.json()

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      )
    }

    // Para system_admin, no necesita company_id
    if (role !== "system_admin" && !company_id) {
      return NextResponse.json(
        { error: "company_id es requerido para este rol" },
        { status: 400 }
      )
    }

    // Si no es system_admin, verificar que la empresa existe
    if (role !== "system_admin") {
      const company = await Company.findById(company_id)
      if (!company) {
        return NextResponse.json(
          { error: "Empresa no encontrada" },
          { status: 400 }
        )
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      full_name,
      phone,
      role,
      company_id: role === "system_admin" ? undefined : company_id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    await newUser.save()

    // Respuesta sin contraseña
    const { password: _, ...userWithoutPassword } = newUser.toObject()

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Usuario creado exitosamente"
    })

  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
