import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/app/mongoDB/db"
import User from "@/app/mongoDB/models/user"

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    
    // Verificar que el usuario existe
    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // No permitir eliminar administradores del sistema
    if (user.role === "system_admin") {
      return NextResponse.json(
        { error: "No se puede eliminar un administrador del sistema" },
        { status: 400 }
      )
    }

    // Eliminar usuario
    await User.findByIdAndDelete(params.id)

    return NextResponse.json({ 
      message: "Usuario eliminado exitosamente",
      deletedUser: {
        id: user._id,
        name: user.full_name,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
