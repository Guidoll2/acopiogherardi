import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/app/mongoDB/db"
import User from "@/app/mongoDB/models/user"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { full_name, email, phone, role, password, company_id } = body

    // Validar datos requeridos
    if (!full_name || !email || !role || !password || !company_id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Validar que el email no exista
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const newUser = new User({
      full_name,
      email,
      phone: phone || "",
      role,
      password: hashedPassword,
      company_id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    await newUser.save()

    // Retornar usuario sin la contraseña
    const userResponse = {
      id: newUser._id.toString(),
      full_name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      company_id: newUser.company_id,
      is_active: newUser.is_active,
      created_at: newUser.created_at,
    }

    return NextResponse.json({
      success: true,
      user: userResponse,
    })

  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

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
