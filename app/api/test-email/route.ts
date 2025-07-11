import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email, companyName } = await request.json()

    if (!email || !companyName) {
      return NextResponse.json(
        { error: "Email y nombre de empresa son requeridos" },
        { status: 400 }
      )
    }

    // Enviar email de prueba
    const result = await sendWelcomeEmail(email, companyName, "TEST123456")

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email de prueba enviado exitosamente",
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { error: `Error enviando email: ${result.error}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Error en test de email:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
