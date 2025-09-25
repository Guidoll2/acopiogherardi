import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB || "grain_management"

// POST - Verificar código y cambiar contraseña
export async function POST(request: NextRequest) {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    const body = await request.json()
    const { email, resetCode, newPassword } = body
    
    if (!email || !resetCode || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }
    
    await client.connect()
    const db = client.db(DB_NAME)
    
    // Buscar la solicitud de reset
    const resetRequest = await db.collection("password_reset_requests").findOne({
      email,
      reset_code: resetCode,
      used: false
    })
    
    if (!resetRequest) {
      return NextResponse.json(
        { success: false, error: "Código inválido o ya utilizado" },
        { status: 400 }
      )
    }
    
    // Verificar que no haya expirado
    const now = new Date()
    const expiresAt = new Date(resetRequest.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: "El código ha expirado. Solicita uno nuevo." },
        { status: 400 }
      )
    }
    
    // Marcar el código como usado
    await db.collection("password_reset_requests").updateOne(
      { id: resetRequest.id },
      { $set: { used: true } }
    )
    
    // Actualizar la contraseña del usuario
    const updateResult = await db.collection("users").updateOne(
      { email },
      { 
        $set: { 
          password: newPassword, // En producción esto debería estar hasheado
          updated_at: new Date().toISOString()
        } 
      }
    )
    
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente"
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}