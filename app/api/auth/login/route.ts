import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import connectDB from "@/app/mongoDB/db"
import User from "@/app/mongoDB/models/user"

// Método GET para evitar errores de build
export async function GET() {
  return NextResponse.json({ message: "Login API endpoint" })
}

export async function POST(request: NextRequest) {
  try {
    // Verificar variable de entorno JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET no está configurado")
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500 }
      )
    }

    await connectDB()
    
    const { email, password } = await request.json()

    // Buscar usuario en la base de datos
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    // Verificar contraseña (asumiendo que tienes un campo password en el modelo)
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    // Verificar que el usuario esté activo
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Usuario inactivo" },
        { status: 401 }
      )
    }

    // Crear JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        company_id: user.company_id 
      },
      jwtSecret,
      { expiresIn: "7d" }
    )

    // Crear respuesta sin la contraseña
    const { password: _, ...userWithoutPassword } = user.toObject()

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
