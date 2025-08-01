import { NextRequest, NextResponse } from "next/server"
import { checkEmailConfiguration, sendWelcomeEmail, sendAdminNotification } from "@/lib/email-config"

export async function GET(request: NextRequest) {
  try {
    const config = checkEmailConfiguration()
    
    return NextResponse.json({
      success: true,
      emailConfiguration: config
    })
  } catch (error) {
    console.error("Error verificando configuración de email:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, ...data } = await request.json()
    
    if (type === 'test-welcome' || !type) {
      const { email, companyName, tempPassword } = data
      
      if (!email || !companyName) {
        return NextResponse.json(
          { error: "Email y nombre de empresa son requeridos" },
          { status: 400 }
        )
      }
      
      const result = await sendWelcomeEmail(
        email, 
        companyName, 
        tempPassword || "TEST123456"
      )
      
      return NextResponse.json({
        success: true,
        emailSent: result.success,
        message: result.success 
          ? "Email de prueba enviado exitosamente" 
          : `Error enviando email: ${'error' in result ? result.error : 'Error desconocido'}`,
        result
      })
    }
    
    if (type === 'test-admin-notification') {
      const { companyName, companyEmail, subscriptionPlan } = data
      
      if (!companyName || !companyEmail) {
        return NextResponse.json(
          { error: "companyName y companyEmail son requeridos" },
          { status: 400 }
        )
      }
      
      const result = await sendAdminNotification(
        companyName, 
        companyEmail, 
        subscriptionPlan || 'basic'
      )
      
      return NextResponse.json({
        success: true,
        emailSent: result.success,
        message: result.success 
          ? "Notificación al admin enviada exitosamente" 
          : `Error enviando notificación: ${'error' in result ? result.error : 'Error desconocido'}`,
        result
      })
    }
    
    return NextResponse.json(
      { error: "Tipo de prueba no válido. Use 'test-welcome' o 'test-admin-notification'" },
      { status: 400 }
    )
    
  } catch (error) {
    console.error("Error en prueba de email:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
