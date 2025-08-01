import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/app/mongoDB/db"
import User from "@/app/mongoDB/models/user"

// POST /api/auth/change-password - Cambiar contraseña del usuario actual
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { userId, currentPassword, newPassword } = await request.json()
    
    // Validaciones
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }
    
    // Verificar que el usuario existe
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar la contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 400 }
      )
    }

    // Hashear la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar contraseña
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updated_at: new Date().toISOString()
    })

    console.log(`Contraseña cambiada exitosamente para ${user.email}`)

    return NextResponse.json({ 
      message: "Contraseña actualizada exitosamente",
      user: {
        id: user._id,
        email: user.email,
        name: user.full_name
      }
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
