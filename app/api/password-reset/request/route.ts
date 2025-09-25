import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { EmailService } from "@/lib/email-service"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB || "grain_management"

// Generar código aleatorio de 6 dígitos
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST - Solicitar código de reset
export async function POST(request: NextRequest) {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: "El email es requerido" },
        { status: 400 }
      )
    }
    
    await client.connect()
    const db = client.db(DB_NAME)
    
    // Verificar que el usuario existe
    const user = await db.collection("users").findOne({ email })
    
    if (!user) {
      // Por seguridad, no revelamos que el email no existe
      return NextResponse.json({
        success: true,
        message: "Si el email existe en nuestro sistema, recibirás un código de recuperación."
      })
    }
    
    // Generar código y fecha de expiración (15 minutos)
    const resetCode = generateResetCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutos
    const now = new Date().toISOString()
    
    // Eliminar códigos previos no utilizados para este email
    await db.collection("password_reset_requests").deleteMany({
      email: email,
      used: false
    })
    
    // Crear nueva solicitud de reset
    const resetRequest = {
      id: `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      reset_code: resetCode,
      expires_at: expiresAt,
      used: false,
      created_at: now
    }
    
    await db.collection("password_reset_requests").insertOne(resetRequest)
    
    // Obtener información de la empresa (si aplica)
    let companyName = undefined
    if (user.company_id) {
      const company = await db.collection("companies").findOne({ id: user.company_id })
      companyName = company?.name
    }
    
    // Enviar email con el código
    try {
      await EmailService.sendPasswordResetCode({
        email,
        resetCode,
        companyName
      })
    } catch (emailError) {
      console.error("Error sending reset code email:", emailError)
      return NextResponse.json(
        { success: false, error: "Error enviando el código de recuperación" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Si el email existe en nuestro sistema, recibirás un código de recuperación."
    })
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}