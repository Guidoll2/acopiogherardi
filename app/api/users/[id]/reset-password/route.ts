import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/app/mongoDB/db"
import User from "@/app/mongoDB/models/user"

// POST /api/users/[id]/reset-password - Resetear contraseña de usuario
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { newPassword } = await request.json()
    const resolvedParams = await params
    
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }
    
    // Verificar que el usuario existe
    const user = await User.findById(resolvedParams.id)
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar contraseña
    await User.findByIdAndUpdate(resolvedParams.id, {
      password: hashedPassword,
      updated_at: new Date().toISOString()
    })

    console.log(`Contraseña reseteada para ${user.email}: ${newPassword}`)

    return NextResponse.json({ 
      message: "Contraseña actualizada exitosamente",
      user: {
        id: user._id,
        email: user.email,
        name: user.full_name
      },
      newPassword: newPassword // Solo para desarrollo
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
